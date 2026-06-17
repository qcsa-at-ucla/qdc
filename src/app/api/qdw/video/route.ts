import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const BUCKET = "QDW-Videos";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const path = searchParams.get("path");
    const email = searchParams.get("email");

    if (!path || !email) {
      return new NextResponse("Missing path or email", { status: 400 });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return new NextResponse("Server misconfigured", { status: 500 });
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
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Generate a short-lived signed URL server-side (60 seconds — just enough for the proxy fetch)
    const { data: signed, error: signError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 60);

    if (signError || !signed?.signedUrl) {
      return new NextResponse("Video not found", { status: 404 });
    }

    // Forward Range header for seek support
    const rangeHeader = request.headers.get("range");
    const fetchHeaders: Record<string, string> = {};
    if (rangeHeader) {
      fetchHeaders["Range"] = rangeHeader;
    }

    const upstream = await fetch(signed.signedUrl, { headers: fetchHeaders });

    if (!upstream.ok && upstream.status !== 206) {
      return new NextResponse("Failed to fetch video", { status: 502 });
    }

    // Build response headers — strip any signed URL info, prevent download
    const responseHeaders = new Headers();
    const passthroughHeaders = [
      "content-type",
      "content-length",
      "content-range",
      "accept-ranges",
      "last-modified",
      "etag",
    ];
    for (const header of passthroughHeaders) {
      const value = upstream.headers.get(header);
      if (value) responseHeaders.set(header, value);
    }

    responseHeaders.set("Content-Disposition", "inline");
    responseHeaders.set("Cache-Control", "private, no-store");
    responseHeaders.set("X-Content-Type-Options", "nosniff");

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error("Video proxy error:", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
