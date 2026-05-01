import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

/**
 * Admin API: CRUD for manually-curated job listings
 *
 * All requests are POST with { apiKey, action, ...payload }
 *
 * Actions:
 *   list   — returns all manual job listings (active + inactive)
 *   add    — adds a new listing: { job: { title, company, location, type, description, link } }
 *   delete — removes a listing: { id }
 *   toggle — flips is_active on a listing: { id }
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiKey, action, ...payload } = body;

    // Authenticate
    const adminApiKey = process.env.ADMIN_API_KEY;
    if (!adminApiKey || apiKey !== adminApiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For the list action (login), also verify admin email
    if (action === "list") {
      const adminEmailEnv = process.env.ADMIN_EMAIL;
      const { adminEmail } = payload;
      if (adminEmailEnv && (!adminEmail || adminEmail.toLowerCase() !== adminEmailEnv.toLowerCase())) {
        return NextResponse.json({ error: "Unauthorized - Invalid email" }, { status: 401 });
      }
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // ── list ──────────────────────────────────────────────────────────────────
    if (action === "list") {
      const { data, error } = await supabase
        .from("manual_job_listings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to list jobs:", error);
        return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
      }

      return NextResponse.json({ success: true, jobs: data });
    }

    // ── add ───────────────────────────────────────────────────────────────────
    if (action === "add") {
      const { job } = payload as {
        job: {
          title: string;
          company: string;
          location: string;
          type: string;
          description: string;
          link: string;
        };
      };

      if (!job?.title || !job?.company || !job?.location || !job?.type || !job?.description || !job?.link) {
        return NextResponse.json({ error: "All job fields are required" }, { status: 400 });
      }

      // Basic URL validation
      try {
        new URL(job.link);
      } catch {
        return NextResponse.json({ error: "Invalid URL for job link" }, { status: 400 });
      }

      const { data, error } = await supabase
        .from("manual_job_listings")
        .insert({
          title: job.title.trim(),
          company: job.company.trim(),
          location: job.location.trim(),
          type: job.type.trim(),
          description: job.description.trim(),
          link: job.link.trim(),
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error("Failed to add job:", error);
        return NextResponse.json({ error: "Failed to add listing" }, { status: 500 });
      }

      return NextResponse.json({ success: true, job: data });
    }

    // ── delete ────────────────────────────────────────────────────────────────
    if (action === "delete") {
      const { id } = payload as { id: string };
      if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

      const { error } = await supabase
        .from("manual_job_listings")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Failed to delete job:", error);
        return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    // ── toggle ────────────────────────────────────────────────────────────────
    if (action === "toggle") {
      const { id } = payload as { id: string };
      if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

      // Fetch current state
      const { data: existing, error: fetchError } = await supabase
        .from("manual_job_listings")
        .select("is_active")
        .eq("id", id)
        .single();

      if (fetchError || !existing) {
        return NextResponse.json({ error: "Listing not found" }, { status: 404 });
      }

      const { data, error } = await supabase
        .from("manual_job_listings")
        .update({ is_active: !existing.is_active })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Failed to toggle job:", error);
        return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
      }

      return NextResponse.json({ success: true, job: data });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("Error in /api/jobs/manage:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
