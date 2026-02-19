import { NextRequest, NextResponse } from "next/server";

/**
 * Update Profile API - Updates first name and last name for a registered member
 */

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { email, firstName, lastName } = body;

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Update the user's profile in Supabase
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
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString(),
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Supabase update error:", errorText);
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    const updated = await response.json();

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updated[0],
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile. Please try again." },
      { status: 500 }
    );
  }
}
