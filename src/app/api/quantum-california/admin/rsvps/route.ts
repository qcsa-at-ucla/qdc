import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const CAPACITY = 300;

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

    const { apiKey, adminEmail, action } = await req.json();

    if (!apiKey || apiKey !== adminApiKey) {
      return NextResponse.json({ error: "Unauthorized - Invalid API key" }, { status: 401 });
    }
    if (adminEmailEnv && (!adminEmail || adminEmail.toLowerCase() !== adminEmailEnv.toLowerCase())) {
      return NextResponse.json({ error: "Unauthorized - Invalid email" }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const { data, error } = await supabase
      .from("quantum_california_rsvps")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("QC admin fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch RSVPs" }, { status: 500 });
    }

    const rows = data || [];

    if (action === "stats") {
      const confirmed = rows.filter((r) => r.status === "confirmed").length;
      const waitlisted = rows.filter((r) => r.status === "waitlisted").length;
      return NextResponse.json({
        success: true,
        stats: { confirmed, waitlisted, total: rows.length, capacity: CAPACITY },
      });
    }

    return NextResponse.json({ success: true, rsvps: rows });
  } catch (err) {
    console.error("QC admin error:", err);
    return NextResponse.json({ error: "Failed to fetch RSVPs" }, { status: 500 });
  }
}
