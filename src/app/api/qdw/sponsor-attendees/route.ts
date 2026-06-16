import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RegistrationRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  registration_type: string | null;
  designation: string | null;
  location: string | null;
  dietary_restriction: string | null;
  project_title: string | null;
  project_description: string | null;
  cv_url: string | null;
  poster_url: string | null;
  created_at: string | null;
};

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    const sponsorPasscode = process.env.QDW_SPONSOR_PASSCODE || "SPONSOR26";

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const { passcode } = await request.json();

    if (!passcode || passcode !== sponsorPasscode) {
      return NextResponse.json({ error: "Invalid sponsor passcode" }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("qdw_registrations")
      .select(
        "id, first_name, last_name, email, registration_type, designation, location, dietary_restriction, project_title, project_description, cv_url, poster_url, created_at"
      )
      .eq("payment_status", "paid")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching sponsor attendees:", error);
      return NextResponse.json({ error: "Failed to fetch attendees" }, { status: 500 });
    }

    const attendees = ((data || []) as RegistrationRow[]).map((attendee) => ({
      id: attendee.id,
      firstName: attendee.first_name || "",
      lastName: attendee.last_name || "",
      email: attendee.email || "",
      registrationType: attendee.registration_type || "",
      designation: attendee.designation || "",
      location: attendee.location || "",
      dietaryRestriction: attendee.dietary_restriction || "",
      projectTitle: attendee.project_title || "",
      projectDescription: attendee.project_description || "",
      hasCv: Boolean(attendee.cv_url),
      hasPoster: Boolean(attendee.poster_url),
      createdAt: attendee.created_at || "",
    }));

    return NextResponse.json({ success: true, attendees });
  } catch (error) {
    console.error("Error in sponsor attendees API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
