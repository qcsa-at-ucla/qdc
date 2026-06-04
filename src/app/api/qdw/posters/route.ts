import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PosterRecord {
  id: string;
  first_name: string;
  last_name: string;
  designation: string | null;
  location: string | null;
  registration_type: string;
  project_title: string | null;
  project_description: string | null;
  poster_url: string | null;
  approved_at: string | null;
  created_at: string;
}

export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("qdw_registrations")
      .select(
        "id, first_name, last_name, designation, location, registration_type, project_title, project_description, poster_url, approved_at, created_at"
      )
      .in("registration_type", ["student_in_person", "student_online"])
      .eq("payment_status", "paid")
      .not("poster_url", "is", null)
      .order("approved_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching poster entries:", error);
      return NextResponse.json({ error: "Failed to fetch posters" }, { status: 500 });
    }

    const posters = ((data as PosterRecord[]) || [])
      .map((entry) => ({
        id: entry.id,
        name: `${entry.first_name} ${entry.last_name}`.trim(),
        designation: entry.designation || "",
        location: entry.location || "",
        registrationType: entry.registration_type,
        projectTitle: entry.project_title || "Untitled Project",
        projectDescription: entry.project_description || "",
        hasPoster: Boolean(entry.poster_url),
        approvedAt: entry.approved_at,
        createdAt: entry.created_at,
      }))
      .filter((entry) => entry.hasPoster);

    return NextResponse.json({
      success: true,
      count: posters.length,
      posters,
    });
  } catch (error) {
    console.error("Error in posters API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
