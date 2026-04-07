import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

/**
 * Public POST — submit a job listing request
 * Body: { companyName, contactName, contactEmail, jobTitle, jobType, location, description, link? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyName, contactName, contactEmail, jobTitle, jobType, location, description, link } = body;

    if (!companyName || !contactName || !contactEmail || !jobTitle || !jobType || !location || !description) {
      return NextResponse.json({ error: "All required fields must be filled in." }, { status: 400 });
    }

    // Basic email validation at the boundary
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(contactEmail)) {
      return NextResponse.json({ error: "Invalid contact email address." }, { status: 400 });
    }

    // Optional URL validation
    if (link) {
      try {
        new URL(link);
      } catch {
        return NextResponse.json({ error: "Invalid URL for job link." }, { status: 400 });
      }
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const { error } = await supabase.from("job_requests").insert({
      company_name: companyName.trim(),
      contact_name: contactName.trim(),
      contact_email: contactEmail.trim().toLowerCase(),
      job_title: jobTitle.trim(),
      job_type: jobType.trim(),
      location: location.trim(),
      description: description.trim(),
      link: link?.trim() || null,
      status: "pending",
    });

    if (error) {
      console.error("Failed to submit job request:", error);
      return NextResponse.json({ error: "Failed to submit request. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Job request error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
