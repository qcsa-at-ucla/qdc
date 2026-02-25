import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Mark route as dynamic to prevent static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Never cache API responses

/**
 * Student ID Photo Proxy API - Securely serves student ID photos without exposing Supabase URL
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

    // Fetch user's student ID photo URL from database
    const { data: userData, error: dbError } = await supabase
      .from("qdw_registrations")
      .select("student_id_photo_url")
      .eq("email", email)
      .single();

    if (dbError || !userData || !userData.student_id_photo_url) {
      return NextResponse.json({ error: "No student ID photo found" }, { status: 404 });
    }

    const studentIdPhotoUrl = userData.student_id_photo_url;

    // Extract the file path from the storage reference
    // Format: /storage/v1/object/student-ids/filename.ext (just a reference, not a real URL)
    const match = studentIdPhotoUrl.match(/\/student-ids\/(.+)$/);
    if (!match) {
      return NextResponse.json({ error: "Invalid student ID photo URL format" }, { status: 500 });
    }

    const fileName = match[1];

    // Download the file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from("student-ids")
      .download(fileName);

    if (downloadError || !fileData) {
      console.error("Download error:", downloadError);
      return NextResponse.json({ error: "Failed to fetch student ID photo" }, { status: 500 });
    }

    // Convert blob to array buffer
    const fileBuffer = await fileData.arrayBuffer();

    // Determine content type based on file extension
    const extension = fileName.split('.').pop()?.toLowerCase();
    let contentType = "image/jpeg"; // default
    if (extension === "png") contentType = "image/png";
    else if (extension === "jpg" || extension === "jpeg") contentType = "image/jpeg";
    else if (extension === "gif") contentType = "image/gif";
    else if (extension === "webp") contentType = "image/webp";

    // Return the image with appropriate headers (no cache to always show latest version)
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="student-id.${extension}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("Error serving student ID photo:", error);
    return NextResponse.json(
      { error: "Failed to load student ID photo" },
      { status: 500 }
    );
  }
}
