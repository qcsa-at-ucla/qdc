import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Mark route as dynamic to prevent static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Never cache API responses

/**
 * Admin API - Get all registered and paid applicants
 * Requires ADMIN_API_KEY for authentication
 */

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    const adminApiKey = process.env.ADMIN_API_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    if (!adminApiKey) {
      return NextResponse.json({ error: "Admin access not configured" }, { status: 500 });
    }

    // Verify admin API key
    const { apiKey } = await request.json();

    if (!apiKey || apiKey !== adminApiKey) {
      return NextResponse.json({ error: "Unauthorized - Invalid API key" }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all registrations (paid, pending approval, approved, and rejected)
    // For students: includes pending, approved, rejected, and paid
    // For non-students: only paid (they don't have approval_status)
    const { data: applicants, error } = await supabase
      .from("qdw_registrations")
      .select("*")
      .or("payment_status.eq.paid,approval_status.eq.pending,approval_status.eq.approved,approval_status.eq.rejected")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching applicants:", error);
      return NextResponse.json({ error: "Failed to fetch applicants" }, { status: 500 });
    }

    // Return applicant data (excluding sensitive password info)
    const sanitizedApplicants = applicants?.map((applicant) => ({
      id: applicant.id,
      firstName: applicant.first_name,
      lastName: applicant.last_name,
      email: applicant.email,
      registrationType: applicant.registration_type,
      designation: applicant.designation,
      location: applicant.location,
      projectTitle: applicant.project_title,
      projectDescription: applicant.project_description,
      posterUrl: applicant.poster_url,
      studentIdPhotoUrl: applicant.student_id_photo_url,
      paymentStatus: applicant.payment_status,
      approvalStatus: applicant.approval_status,
      approvedAt: applicant.approved_at,
      stripeSessionId: applicant.stripe_session_id,
      createdAt: applicant.created_at,
    })) || [];

    return NextResponse.json({
      success: true,
      count: sanitizedApplicants.length,
      applicants: sanitizedApplicants,
    });
  } catch (error) {
    console.error("Error in admin API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
