import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendRsvpEmail } from "./emails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ATTENDANCE_VALUES = ["day1", "day2", "both", "other"] as const;
type Attendance = (typeof ATTENDANCE_VALUES)[number];

export interface RsvpBody {
  fullName: string;
  email: string;
  organization?: string;
  jobTitle?: string;
  attendance: Attendance;
  attendanceOther?: string;
  dietaryRestrictions?: string;
  accessibilityNeeds?: string;
  mediaConsent?: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const body = (await req.json()) as Partial<RsvpBody>;

    const fullName = (body.fullName || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const attendance = body.attendance;
    const attendanceOther = (body.attendanceOther || "").trim();

    if (!fullName) {
      return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!attendance || !ATTENDANCE_VALUES.includes(attendance)) {
      return NextResponse.json({ error: "Please select which day(s) you'll attend." }, { status: 400 });
    }
    if (attendance === "other" && !attendanceOther) {
      return NextResponse.json({ error: "Please describe your attendance plans." }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const { data, error } = await supabase.rpc("rsvp_quantum_california", {
      p_full_name: fullName,
      p_email: email,
      p_organization: (body.organization || "").trim() || null,
      p_job_title: (body.jobTitle || "").trim() || null,
      p_attendance: attendance,
      p_attendance_other: attendance === "other" ? attendanceOther : null,
      p_dietary_restrictions: (body.dietaryRestrictions || "").trim() || null,
      p_accessibility_needs: (body.accessibilityNeeds || "").trim() || null,
      p_media_consent: Boolean(body.mediaConsent),
    });

    if (error) {
      console.error("QC RSVP insert failed:", error);
      return NextResponse.json({ error: "Could not save your RSVP. Please try again." }, { status: 500 });
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      console.error("QC RSVP returned no row");
      return NextResponse.json({ error: "Could not save your RSVP. Please try again." }, { status: 500 });
    }

    if (row.is_duplicate) {
      return NextResponse.json(
        { error: "You're already registered with this email." },
        { status: 409 }
      );
    }

    console.log(`✅ QC RSVP ${row.rsvp_status}: ${email}`);

    await sendRsvpEmail({
      status: row.rsvp_status,
      fullName,
      email,
      attendance,
    });

    return NextResponse.json({ status: row.rsvp_status, id: row.rsvp_id });
  } catch (err) {
    console.error("QC RSVP error:", err);
    return NextResponse.json({ error: "Could not save your RSVP. Please try again." }, { status: 500 });
  }
}
