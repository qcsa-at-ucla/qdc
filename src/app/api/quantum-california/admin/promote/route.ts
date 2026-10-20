import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendPromotionEmails } from "../../rsvp/emails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Moves waitlisted RSVPs to confirmed and emails each one a "you're registered"
// notice. With `ids` only those RSVPs are promoted; without, every waitlisted one.
export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;
    const adminApiKey = process.env.ADMIN_API_KEY;
    const adminEmailEnv = process.env.ADMIN_EMAIL;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }
    if (!adminApiKey) {
      return NextResponse.json({ error: "Admin access not configured" }, { status: 500 });
    }

    const { apiKey, adminEmail, ids } = await req.json();

    if (!apiKey || apiKey !== adminApiKey) {
      return NextResponse.json({ error: "Unauthorized - Invalid API key" }, { status: 401 });
    }
    if (adminEmailEnv && (!adminEmail || adminEmail.toLowerCase() !== adminEmailEnv.toLowerCase())) {
      return NextResponse.json({ error: "Unauthorized - Invalid email" }, { status: 401 });
    }
    if (ids !== undefined && (!Array.isArray(ids) || ids.length === 0)) {
      return NextResponse.json({ error: "ids must be a non-empty array" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Filtering on status='waitlisted' makes this idempotent: a double click or
    // a retry only returns rows that actually changed, so nobody is emailed twice.
    let query = supabase
      .from("quantum_california_rsvps")
      .update({ status: "confirmed" })
      .eq("status", "waitlisted");
    if (ids) query = query.in("id", ids);

    const { data, error } = await query.select("id, full_name, email, attendance");

    if (error) {
      console.error("QC promote error:", error);
      return NextResponse.json({ error: "Failed to promote RSVPs" }, { status: 500 });
    }

    const promoted = data || [];
    console.log(`✅ QC promoted ${promoted.length} waitlisted RSVP(s)`);

    const { sent, failed } = await sendPromotionEmails(promoted);

    return NextResponse.json({ success: true, promoted: promoted.length, emailed: sent.length, failed });
  } catch (err) {
    console.error("QC promote error:", err);
    return NextResponse.json({ error: "Failed to promote RSVPs" }, { status: 500 });
  }
}
