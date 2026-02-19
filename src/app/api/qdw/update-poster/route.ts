import { NextRequest, NextResponse } from "next/server";

/**
 * Update Poster API - Updates project title, description, and poster URL for a registered member
 */

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { email, projectTitle, projectDescription, posterUrl } = body;

    // Validate required fields
    if (!email || !projectTitle || !projectDescription) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Update the project info in Supabase
    const updateData: any = {
      project_title: projectTitle,
      project_description: projectDescription,
      updated_at: new Date().toISOString(),
    };

    // Only update poster URL if provided
    if (posterUrl) {
      updateData.poster_url = posterUrl;
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/qdw_registrations?email=eq.${encodeURIComponent(email)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Supabase update error:", errorText);
      return NextResponse.json({ error: "Failed to update poster information" }, { status: 500 });
    }

    const updated = await response.json();

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Poster information updated successfully",
      user: updated[0],
    });
  } catch (error) {
    console.error("Error updating poster:", error);
    return NextResponse.json(
      { error: "Failed to update poster information. Please try again." },
      { status: 500 }
    );
  }
}
