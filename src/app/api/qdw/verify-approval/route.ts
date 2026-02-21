import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

/**
 * Verify student approval token and return registration data
 * 
 * Required environment variables:
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_KEY
 */

export async function POST(req: Request) {
  try {
    const { email, token } = await req.json();

    if (!email || !token) {
      return NextResponse.json(
        { error: "Email and token are required" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Verify the approval token
    const { data: registration, error } = await supabase
      .from("qdw_registrations")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("approval_token", token)
      .eq("approval_status", "approved")
      .single();

    if (error || !registration) {
      console.error("Invalid approval token:", error);
      return NextResponse.json(
        { error: "Invalid or expired approval link. Please contact support." },
        { status: 404 }
      );
    }

    // Check if already paid
    if (registration.payment_status === "paid") {
      return NextResponse.json(
        { error: "This registration has already been paid for. Please check your email for access instructions." },
        { status: 400 }
      );
    }

    // Return registration data (excluding sensitive fields)
    return NextResponse.json({
      success: true,
      registration: {
        id: registration.id,
        firstName: registration.first_name,
        lastName: registration.last_name,
        email: registration.email,
        designation: registration.designation,
        location: registration.location,
        registrationType: registration.registration_type,
        projectTitle: registration.project_title,
        projectDescription: registration.project_description,
        wantsQdcMembership: registration.wants_qdc_membership,
        agreeToTerms: registration.agree_to_terms,
      },
    });
  } catch (error) {
    console.error("Error verifying approval token:", error);
    return NextResponse.json(
      { error: "Failed to verify approval. Please try again." },
      { status: 500 }
    );
  }
}
