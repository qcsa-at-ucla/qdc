import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

/**
 * Admin API for job requests
 * Actions: list | approve | reject
 * Body: { apiKey, action, id?, adminNotes? }
 *   approve — marks request approved and creates a manual_job_listings entry
 *   reject  — marks request rejected
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiKey, action, id, adminNotes } = body;

    const adminApiKey = process.env.ADMIN_API_KEY;
    if (!adminApiKey || apiKey !== adminApiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    if (action === "list") {
      const { data, error } = await supabase
        .from("job_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
      return NextResponse.json({ success: true, requests: data });
    }

    if (action === "approve") {
      if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

      const { data: req_, error: fetchErr } = await supabase
        .from("job_requests")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchErr || !req_) return NextResponse.json({ error: "Request not found" }, { status: 404 });

      // Promote to manual_job_listings
      const { error: insertErr } = await supabase.from("manual_job_listings").insert({
        title: req_.job_title,
        company: req_.company_name,
        location: req_.location,
        type: req_.job_type,
        description: req_.description,
        link: req_.link || "",
        is_active: true,
      });

      if (insertErr) {
        console.error("Failed to create listing:", insertErr);
        return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
      }

      const { error: updateErr } = await supabase
        .from("job_requests")
        .update({ status: "approved", admin_notes: adminNotes || null, reviewed_at: new Date().toISOString() })
        .eq("id", id);

      if (updateErr) return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (action === "reject") {
      if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

      const { error } = await supabase
        .from("job_requests")
        .update({ status: "rejected", admin_notes: adminNotes || null, reviewed_at: new Date().toISOString() })
        .eq("id", id);

      if (error) return NextResponse.json({ error: "Failed to reject request" }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("Job request admin error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
