import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument, PDFFont, rgb, StandardFonts } from "pdf-lib";

export const dynamic = "force-dynamic";
export const revalidate = 0;
// Increase timeout for large attendee lists with many pages to embed
export const maxDuration = 300;

type Reg = {
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

function storagePath(ref: string | null, bucket: string): string | null {
  if (!ref) return null;
  for (const m of [
    `/storage/v1/object/public/${bucket}/`,
    `/storage/v1/object/${bucket}/`,
  ]) {
    if (ref.includes(m)) return ref.split(m)[1] || null;
  }
  if (ref.startsWith(`${bucket}/`)) return ref.slice(bucket.length + 1);
  if (ref.startsWith("cvs/") || ref.startsWith("posters/")) return ref;
  return null;
}

function regLabel(type: string | null): string {
  const map: Record<string, string> = {
    student_in_person: "Student - In Person",
    student_online: "Student - Online",
    professional_in_person: "Professional - In Person",
    professional_online: "Professional - Online",
  };
  return type ? (map[type] ?? type.replace(/_/g, " ")) : "";
}

// Strip characters outside WinAnsi (what Helvetica/standard fonts support)
function safe(text: string | null): string {
  if (!text) return "";
  return text.replace(/[^\x20-\x7E\xA0-\xFF]/g, "?");
}

function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number
): string[] {
  const paragraphs = text.split("\n");
  const lines: string[] = [];
  for (const para of paragraphs) {
    if (!para.trim()) { lines.push(""); continue; }
    const words = para.split(" ");
    let current = "";
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
  }
  return lines.length > 0 ? lines : [""];
}

function addInfoPage(
  doc: PDFDocument,
  reg: Reg,
  index: number,
  total: number,
  regular: PDFFont,
  bold: PDFFont,
  includesPoster: boolean
): void {
  const page = doc.addPage([612, 792]); // US Letter
  const { width, height } = page.getSize();
  const marginL = 56;
  const purple = rgb(0.38, 0.18, 0.62);
  const lightPurple = rgb(0.87, 0.78, 0.96);
  const dark = rgb(0.12, 0.12, 0.12);

  // ── Header band ──────────────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: height - 72, width, height: 72, color: purple });
  page.drawText("QDW 2026  |  Paid Attendee", {
    x: marginL, y: height - 20, size: 9, font: regular,
    color: rgb(0.84, 0.74, 0.98),
  });
  const name = safe(`${reg.first_name ?? ""} ${reg.last_name ?? ""}`.trim() || "—");
  page.drawText(name, {
    x: marginL, y: height - 50, size: 20, font: bold,
    color: rgb(1, 1, 1),
  });
  page.drawText(`${index + 1} / ${total}`, {
    x: width - marginL - 32, y: height - 46, size: 10, font: regular,
    color: rgb(0.8, 0.7, 0.95),
  });

  // ── Body ─────────────────────────────────────────────────────────────────
  const lCol = marginL;
  const vCol = marginL + 126;
  const vMaxW = width - vCol - marginL;
  const labelSz = 8.5;
  const valueSz = 10;
  const lineH = valueSz + 4;
  const rowGap = 6;
  const pageBottom = 56;

  let y = height - 90;

  const row = (label: string, value: string | null) => {
    if (!value || y < pageBottom + lineH) return;
    const lines = wrapText(safe(value), regular, valueSz, vMaxW);
    page.drawText(label, { x: lCol, y, size: labelSz, font: bold, color: purple });
    for (const line of lines) {
      if (y < pageBottom) break;
      page.drawText(line, { x: vCol, y, size: valueSz, font: regular, color: dark });
      y -= lineH;
    }
    y -= rowGap;
  };

  row("Email", reg.email);
  row("Type", regLabel(reg.registration_type));
  row("Designation", reg.designation);
  row("Location", reg.location);
  row("Dietary", reg.dietary_restriction);
  row("Project Title", reg.project_title);
  row(
    "Description",
    reg.project_description
      ? reg.project_description.slice(0, 500) +
          (reg.project_description.length > 500 ? "..." : "")
      : null
  );
  row(
    "Registered",
    reg.created_at
      ? new Date(reg.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null
  );

  // ── Footer note ───────────────────────────────────────────────────────────
  if (y > pageBottom + 40) {
    y -= 16;
    page.drawLine({
      start: { x: marginL, y },
      end: { x: width - marginL, y },
      thickness: 0.5,
      color: lightPurple,
    });
    y -= 16;
    const note = includesPoster
      ? "CV and poster follow on the next pages"
      : "CV follows on the next page(s)";
    page.drawText(note, {
      x: marginL, y, size: 9, font: regular,
      color: rgb(0.58, 0.48, 0.7),
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    const adminApiKey = process.env.ADMIN_API_KEY;
    const adminEmailEnv = process.env.ADMIN_EMAIL;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "posters";

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }
    if (!adminApiKey) {
      return NextResponse.json({ error: "Admin access not configured" }, { status: 500 });
    }

    const { apiKey, adminEmail, mode } = (await request.json()) as {
      apiKey: string;
      adminEmail: string;
      mode: "cv" | "cv-and-poster";
    };

    if (!apiKey || apiKey !== adminApiKey) {
      return NextResponse.json({ error: "Unauthorized - Invalid API key" }, { status: 401 });
    }
    if (
      adminEmailEnv &&
      (!adminEmail || adminEmail.toLowerCase() !== adminEmailEnv.toLowerCase())
    ) {
      return NextResponse.json({ error: "Unauthorized - Invalid email" }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("qdw_registrations")
      .select(
        "first_name, last_name, email, registration_type, designation, location, dietary_restriction, project_title, project_description, cv_url, poster_url, created_at"
      )
      .eq("payment_status", "paid")
      .not("cv_url", "is", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Export PDF fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 });
    }

    let regs = (data ?? []) as Reg[];

    if (mode === "cv-and-poster") {
      regs = regs.filter((r) => r.poster_url);
    }

    if (regs.length === 0) {
      return NextResponse.json(
        {
          error:
            mode === "cv-and-poster"
              ? "No paid attendees have both a CV and a poster uploaded."
              : "No paid attendees have a CV uploaded.",
        },
        { status: 404 }
      );
    }

    const mergedDoc = await PDFDocument.create();
    const regular = await mergedDoc.embedFont(StandardFonts.Helvetica);
    const bold = await mergedDoc.embedFont(StandardFonts.HelveticaBold);

    for (let i = 0; i < regs.length; i++) {
      const reg = regs[i];
      const includesPoster = mode === "cv-and-poster" && !!reg.poster_url;

      // Attendee info page
      addInfoPage(mergedDoc, reg, i, regs.length, regular, bold, includesPoster);

      // Embed CV pages
      const cvPath = storagePath(reg.cv_url, bucket);
      if (cvPath) {
        try {
          const { data: blob, error: dlErr } = await supabase.storage
            .from(bucket)
            .download(cvPath);
          if (dlErr || !blob) throw dlErr ?? new Error("No blob");
          const bytes = await blob.arrayBuffer();
          const cvDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
          const indices = Array.from({ length: cvDoc.getPageCount() }, (_, j) => j);
          const copied = await mergedDoc.copyPages(cvDoc, indices);
          copied.forEach((p: import("pdf-lib").PDFPage) => mergedDoc.addPage(p));
        } catch (e) {
          console.error(`CV embed failed for ${reg.email}:`, e);
          const errPage = mergedDoc.addPage([612, 792]);
          errPage.drawText(
            safe(`[CV could not be loaded for ${reg.first_name} ${reg.last_name}]`),
            { x: 56, y: 396, size: 11, font: regular, color: rgb(0.55, 0.3, 0.3) }
          );
        }
      }

      // Embed poster pages (cv-and-poster mode only)
      if (includesPoster) {
        const posterPath = storagePath(reg.poster_url, bucket);
        if (posterPath) {
          try {
            const { data: blob, error: dlErr } = await supabase.storage
              .from(bucket)
              .download(posterPath);
            if (dlErr || !blob) throw dlErr ?? new Error("No blob");
            const bytes = await blob.arrayBuffer();
            const posterDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
            const indices = Array.from({ length: posterDoc.getPageCount() }, (_, j) => j);
            const copied = await mergedDoc.copyPages(posterDoc, indices);
            copied.forEach((p: import("pdf-lib").PDFPage) => mergedDoc.addPage(p));
          } catch (e) {
            console.error(`Poster embed failed for ${reg.email}:`, e);
          }
        }
      }
    }

    const pdfBytes = await mergedDoc.save();
    const label = mode === "cv-and-poster" ? "cv-poster" : "cv";
    const filename = `qdw-2026-attendees-${label}-${new Date().toISOString().split("T")[0]}.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Export attendees PDF error:", err);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
