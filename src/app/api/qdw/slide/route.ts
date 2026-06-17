import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const BUCKET = "QDW-SLIDES";
const SIGNED_URL_TTL = 60;
const ALLOWED_PREFIXES = ["Training/", "Advanced/"];

function isAllowedPdfPath(path: string): boolean {
  return path.toLowerCase().endsWith(".pdf") && ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function safeFilename(path: string): string {
  return (path.split("/").pop() || "slides.pdf").replace(/[\r\n"]/g, "");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const path = searchParams.get("path");
    const email = searchParams.get("email");

    if (!path || !email) {
      return new NextResponse("Missing path or email", { status: 400 });
    }

    if (!isAllowedPdfPath(path)) {
      return new NextResponse("Invalid slide path", { status: 400 });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return new NextResponse("Server misconfigured", { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: member, error: memberError } = await supabase
      .from("qdw_registrations")
      .select("id")
      .eq("email", email)
      .eq("payment_status", "paid")
      .maybeSingle();

    if (memberError || !member) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data: signed, error: signError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, SIGNED_URL_TTL);

    if (signError || !signed?.signedUrl) {
      return new NextResponse("Slide not found", { status: 404 });
    }

    const rangeHeader = request.headers.get("range");
    const fetchHeaders: Record<string, string> = {};
    if (rangeHeader) fetchHeaders.Range = rangeHeader;

    const upstream = await fetch(signed.signedUrl, { headers: fetchHeaders });

    if (!upstream.ok && upstream.status !== 206) {
      return new NextResponse("Failed to fetch slide", { status: 502 });
    }

    const headers = new Headers();
    const passthroughHeaders = ["content-length", "content-range", "accept-ranges", "last-modified", "etag"];
    for (const header of passthroughHeaders) {
      const value = upstream.headers.get(header);
      if (value) headers.set(header, value);
    }

    headers.set("Content-Type", "application/pdf");
    headers.set("Content-Disposition", `inline; filename="${safeFilename(path)}"`);
    headers.set("Cache-Control", "private, no-store");
    headers.set("X-Content-Type-Options", "nosniff");

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (error) {
    console.error("Slide proxy error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
