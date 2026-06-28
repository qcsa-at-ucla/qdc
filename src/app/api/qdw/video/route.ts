import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BUCKET = "QDW-Videos";
const ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".mov"];

function isAllowedVideoPath(path: string): boolean {
  const lowerPath = path.toLowerCase();
  return ALLOWED_VIDEO_EXTENSIONS.some((extension) => lowerPath.endsWith(extension)) && !path.includes("..") && !path.startsWith("/");
}

function defaultContentType(path: string): string {
  return path.toLowerCase().endsWith(".mov") ? "video/quicktime" : "video/mp4";
}

function safeFilename(path: string): string {
  return (path.split("/").pop() || "recording.mp4").replace(/[\r\n"]/g, "");
}

function storageObjectUrl(supabaseUrl: string, path: string): string {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/${encodeURIComponent(BUCKET)}/${encodedPath}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const path = searchParams.get("path");
    const email = searchParams.get("email");

    if (!path || !email) {
      return NextResponse.json({ error: "Missing path or email" }, { status: 400 });
    }

    if (!isAllowedVideoPath(path)) {
      return NextResponse.json({ error: "Invalid video path" }, { status: 400 });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the requester is a paid member
    const { data: member, error: memberError } = await supabase
      .from("qdw_registrations")
      .select("id")
      .eq("email", email)
      .eq("payment_status", "paid")
      .maybeSingle();

    if (memberError || !member) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rangeHeader = request.headers.get("range");
    const fetchHeaders: Record<string, string> = {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    };
    if (rangeHeader) fetchHeaders.Range = rangeHeader;

    const upstream = await fetch(storageObjectUrl(supabaseUrl, path), { headers: fetchHeaders });

    if (upstream.status === 404) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    if (!upstream.ok && upstream.status !== 206 && upstream.status !== 416) {
      return NextResponse.json({ error: "Failed to fetch video" }, { status: 502 });
    }

    const headers = new Headers();
    const passthroughHeaders = ["content-length", "content-range", "accept-ranges", "last-modified", "etag"];
    for (const header of passthroughHeaders) {
      const value = upstream.headers.get(header);
      if (value) headers.set(header, value);
    }

    headers.set("Content-Type", upstream.headers.get("content-type") || defaultContentType(path));
    headers.set("Content-Disposition", `inline; filename="${safeFilename(path)}"`);
    headers.set("Cache-Control", "private, no-store");
    headers.set("X-Content-Type-Options", "nosniff");

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (err) {
    console.error("Video proxy error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
