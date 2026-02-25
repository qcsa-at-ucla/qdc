import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Mark route as dynamic to prevent static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Never cache API responses

/**
 * Poster Proxy API - Securely serves poster PDFs without exposing Supabase URL
 */

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Storage not configured" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get email from query params
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Fetch user's poster URL from database
    const { data: userData, error: dbError } = await supabase
      .from("qdw_registrations")
      .select("poster_url")
      .eq("email", email)
      .single();

    if (dbError || !userData || !userData.poster_url) {
      return NextResponse.json({ error: "No poster found" }, { status: 404 });
    }

    const posterUrl = userData.poster_url;

    // Extract the file path from the storage reference
    // Format: /storage/v1/object/posters/filename.pdf (just a reference, not a real URL)
    const match = posterUrl.match(/\/posters\/(.+)$/);
    if (!match) {
      return NextResponse.json({ error: "Invalid poster URL format" }, { status: 500 });
    }

    const fileName = match[1];

    // Download the file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from("posters")
      .download(fileName);

    if (downloadError || !fileData) {
      console.error("Download error:", downloadError);
      return NextResponse.json({ error: "Failed to fetch poster" }, { status: 500 });
    }

    // Convert blob to array buffer
    const fileBuffer = await fileData.arrayBuffer();

    // Return the PDF with appropriate headers (no cache to always show latest version)
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="poster.pdf"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("Error serving poster:", error);
    return NextResponse.json(
      { error: "Failed to load poster" },
      { status: 500 }
    );
  }
}
