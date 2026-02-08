import { NextRequest, NextResponse } from "next/server";

/**
 * Registration API - Saves user registration data to Supabase
 *
 * Required environment variables:
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_KEY
 *   - ADMIN_API_KEY (for GET endpoint)
 */

export interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  location: string;
  registrationType: string;
  projectTitle?: string;
  projectDescription?: string;
  posterUrl?: string;
  wantsQdcMembership: boolean;
  agreeToTerms: boolean;
  createdAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = ["firstName", "lastName", "email", "registrationType"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Check terms agreement
    if (!body.agreeToTerms) {
      return NextResponse.json({ error: "You must agree to the Terms & Conditions" }, { status: 400 });
    }

    const registrationData: RegistrationData = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      designation: body.designation || "",
      location: body.location || "",
      registrationType: body.registrationType,
      projectTitle: body.projectTitle,
      projectDescription: body.projectDescription,
      posterUrl: body.posterUrl,
      wantsQdcMembership: Boolean(body.wantsQdcMembership),
      agreeToTerms: Boolean(body.agreeToTerms),
      createdAt: new Date().toISOString(),
    };

    // Insert into Supabase (return inserted row)
    const response = await fetch(`${supabaseUrl}/rest/v1/qdw_registrations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        first_name: registrationData.firstName,
        last_name: registrationData.lastName,
        email: registrationData.email,
        designation: registrationData.designation,
        location: registrationData.location,
        registration_type: registrationData.registrationType,
        project_title: registrationData.projectTitle || null,
        project_description: registrationData.projectDescription || null,
        poster_url: registrationData.posterUrl || null,
        wants_qdc_membership: registrationData.wantsQdcMembership,
        agree_to_terms: registrationData.agreeToTerms,
        created_at: registrationData.createdAt,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Supabase error:", errorText);
      return NextResponse.json(
        { error: "Failed to save registration" },
        { status: 500 }
      );
    }

    // Supabase returns an array of inserted rows
    const inserted = await response.json();
    const id = inserted?.[0]?.id;

    if (!id) {
      console.error("Inserted row missing id:", inserted);
      return NextResponse.json(
        { error: "Registration saved, but missing id" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Registration saved successfully",
      id,
    });
  } catch (error) {
    console.error("Error saving registration:", error);
    return NextResponse.json(
      { error: "Failed to save registration. Please try again." },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve registrations (admin use)
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    const adminKey = process.env.ADMIN_API_KEY;

    // Simple auth check
    const authHeader = request.headers.get("Authorization");
    if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const url = new URL(request.url);
    const qdcOnly = url.searchParams.get("qdc_members") === "true";

    let endpoint = `${supabaseUrl}/rest/v1/qdw_registrations?select=*&order=created_at.desc`;
    if (qdcOnly) {
      endpoint += "&wants_qdc_membership=eq.true";
    }

    const response = await fetch(endpoint, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Supabase fetch error:", errorText);
      return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({ registrations: data });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 });
  }
}