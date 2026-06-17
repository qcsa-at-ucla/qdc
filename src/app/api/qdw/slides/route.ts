import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BUCKET = "QDW-SLIDES";
// should be 8 hours to cover the entire conference duration without needing to re-fetch URLs, but can be adjusted as needed.
const SIGNED_URL_TTL = 28800;

const SLIDE_FOLDERS = [
  { folder: "Training", track: "Training Slides" },
  { folder: "Advanced", track: "Advanced Slides" },
];

type SlideItem = {
  title: string;
  filename: string;
  href: string;
};

type SlideSection = {
  track: string;
  slides: SlideItem[];
};

function formatSlideTitle(filename: string): string {
  return filename
    .replace(/\.pdf$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function listPdfSlides(supabase: any): Promise<SlideSection[]> {
  const sections: SlideSection[] = [];

  for (const { folder, track } of SLIDE_FOLDERS) {
    const { data: items, error: listError } = await supabase.storage
      .from(BUCKET)
      .list(folder, { limit: 1000, sortBy: { column: "name", order: "asc" } });

    if (listError) {
      console.error(`Failed to list ${track}:`, listError);
      continue;
    }

    const pdfs = (items || [])
      .filter((item: { id: string | null; name: string }) => item.id !== null && item.name.toLowerCase().endsWith(".pdf"))
      .map((item: { name: string }) => ({
        filename: item.name,
        path: `${folder}/${item.name}`,
      }));

    if (pdfs.length === 0) {
      sections.push({ track, slides: [] });
      continue;
    }

    const { data: signedUrls, error: signError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrls(pdfs.map((pdf: { path: string }) => pdf.path), SIGNED_URL_TTL);

    if (signError || !signedUrls) {
      console.error(`Failed to sign ${track}:`, signError);
      sections.push({ track, slides: [] });
      continue;
    }

    sections.push({
      track,
      slides: pdfs
        .map((pdf: { filename: string }, index: number) => ({
          title: formatSlideTitle(pdf.filename),
          filename: pdf.filename,
          href: signedUrls[index]?.signedUrl || "",
        }))
        .filter((slide: SlideItem) => Boolean(slide.href)),
    });
  }

  return sections;
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: member, error: memberError } = await supabase
      .from("qdw_registrations")
      .select("id")
      .eq("email", email)
      .eq("payment_status", "paid")
      .maybeSingle();

    if (memberError) {
      console.error("Slides access check failed:", memberError);
      return NextResponse.json({ error: "Failed to verify access" }, { status: 500 });
    }

    if (!member) {
      return NextResponse.json({ error: "Slides are only available to paid attendees" }, { status: 401 });
    }

    const sections = await listPdfSlides(supabase);

    return NextResponse.json({
      success: true,
      sections,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error loading slides:", error);
    return NextResponse.json({ error: "Failed to load slides" }, { status: 500 });
  }
}
