import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const BUCKET = "QDW-Videos";
// Signed URLs are valid for 10 minutes — enough to watch without re-fetching,
// short enough to be useless if copied.
const SIGNED_URL_TTL = 600;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const path = searchParams.get("path");
    const email = searchParams.get("email");

    if (!path || !email) {
      return NextResponse.json({ error: "Missing path or email" }, { status: 400 });
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

    // Generate a short-lived signed URL and return it as JSON.
    // The video plays directly from Supabase storage — no streaming through
    // this function — which avoids serverless timeout issues with large files.
    const { data: signed, error: signError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, SIGNED_URL_TTL);

    if (signError || !signed?.signedUrl) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    return NextResponse.json(
      { url: signed.signedUrl },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (err) {
    console.error("Video token error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
