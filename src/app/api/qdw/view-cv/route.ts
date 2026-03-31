import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Mark route as dynamic to prevent static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Never cache API responses

/**
 * CV Proxy API - Securely serves CV PDFs without exposing Supabase URL
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

    // Fetch user's CV URL from database
    const { data: userData, error: dbError } = await supabase
      .from("qdw_registrations")
      .select("cv_url")
      .eq("email", email)
      .single();

    if (dbError || !userData || !userData.cv_url) {
      return NextResponse.json({ error: "No CV found" }, { status: 404 });
    }

    const cvUrl = userData.cv_url;

    // Extract the file path from the storage reference
    // Format: /storage/v1/object/posters/cvs/filename.pdf
    const match = cvUrl.match(/\/posters\/(.+)$/);
    if (!match) {
      return NextResponse.json({ error: "Invalid CV URL format" }, { status: 500 });
    }

    const fileName = match[1];

    // Download the file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from("posters")
      .download(fileName);

    if (downloadError || !fileData) {
      console.error("Download error:", downloadError);
      return NextResponse.json({ error: "Failed to fetch CV" }, { status: 500 });
    }

    // Convert blob to array buffer
    const fileBuffer = await fileData.arrayBuffer();

    // Return the PDF with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="cv.pdf"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("Error serving CV:", error);
    return NextResponse.json(
      { error: "Failed to load CV" },
      { status: 500 }
    );
  }
}
