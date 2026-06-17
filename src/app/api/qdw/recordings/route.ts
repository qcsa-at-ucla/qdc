import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DEFAULT_RECORDINGS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1-mXYkU3Fqjroz4veruTmNCRfBJx9GITJ8dYywqrZOIk/gviz/tq?tqx=out:csv&gid=0";

type RecordingLink = {
  label: string;
  href: string;
  isUrl: boolean;
  isVideo?: boolean;
};

type RecordingSession = {
  session: string;
  links: RecordingLink[];
};

type RecordingSection = {
  track: string;
  sessions: RecordingSession[];
};

function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const next = csv[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i++;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function isUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

function linkLabel(value: string, index: number): string {
  if (!isUrl(value)) return value;

  try {
    const url = new URL(value);
    if (url.hostname.includes("zoom.us")) return `Zoom Recording ${index + 1}`;
    if (url.hostname.includes("drive.google.com")) return `Google Drive Recording ${index + 1}`;
  } catch {
    return `Recording ${index + 1}`;
  }

  return `Recording ${index + 1}`;
}

function sectionTitle(value: string): string {
  return value
    .replace(/\s*session\s*$/i, "")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function recordingsFromCsv(csv: string): RecordingSection[] {
  const rows = parseCsv(csv);
  const sections: RecordingSection[] = [];
  let currentSection: RecordingSection | null = null;

  for (const rawRow of rows) {
    const row = rawRow.map((value) => value.trim());
    const firstCell = row[0] || "";
    const linkCells = row.slice(1).filter(Boolean);

    if (!firstCell) continue;

    if (/track session$/i.test(firstCell)) {
      currentSection = { track: sectionTitle(firstCell), sessions: [] };
      sections.push(currentSection);
      continue;
    }

    if (!currentSection || linkCells.length === 0) continue;

    currentSection.sessions.push({
      session: firstCell,
      links: linkCells.map((value, index) => ({
        label: linkLabel(value, index),
        href: value,
        isUrl: isUrl(value),
      })),
    });
  }

  return sections.filter((section) => section.sessions.length > 0);
}

function formatStorageName(name: string): string {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function listBucketVideos(supabase: any, email: string): Promise<RecordingSection[]> {
  const BUCKET = 'QDW-Videos';

  const { data: rootItems } = await supabase.storage
    .from(BUCKET)
    .list('', { limit: 1000, sortBy: { column: 'name', order: 'asc' } });

  if (!rootItems) return [];

  interface FileEntry { path: string; folder: string; filename: string; }
  const files: FileEntry[] = [];
  const folders: string[] = [];

  for (const item of rootItems) {
    if (item.id === null) {
      folders.push(item.name);
    } else if (item.name.toLowerCase().endsWith('.mp4')) {
      files.push({ path: item.name, folder: '', filename: item.name });
    }
  }

  for (const folder of folders) {
    const { data: folderItems } = await supabase.storage
      .from(BUCKET)
      .list(folder, { limit: 1000, sortBy: { column: 'name', order: 'asc' } });
    if (!folderItems) continue;
    for (const item of folderItems) {
      if (item.id !== null && item.name.toLowerCase().endsWith('.mp4')) {
        files.push({ path: `${folder}/${item.name}`, folder, filename: item.name });
      }
    }
  }

  if (files.length === 0) return [];

  const sectionMap = new Map<string, RecordingSession[]>();
  for (const file of files) {
    const trackName = file.folder
      ? formatStorageName(file.folder)
      : 'QDW 2026 Video Recordings';
    if (!sectionMap.has(trackName)) sectionMap.set(trackName, []);
    const proxyUrl = `/api/qdw/video?path=${encodeURIComponent(file.path)}&email=${encodeURIComponent(email)}`;
    sectionMap.get(trackName)!.push({
      session: formatStorageName(file.filename),
      links: [{ label: 'Watch Recording', href: proxyUrl, isUrl: true, isVideo: true }],
    });
  }

  const trackOrder = (name: string) =>
    name.toLowerCase().includes('training') ? 0 : name.toLowerCase().includes('advanced') ? 1 : 2;

  return Array.from(sectionMap.entries())
    .sort(([a], [b]) => trackOrder(a) - trackOrder(b))
    .map(([track, sessions]) => ({ track, sessions }));
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
      console.error("Recording access check failed:", memberError);
      return NextResponse.json({ error: "Failed to verify access" }, { status: 500 });
    }

    if (!member) {
      return NextResponse.json({ error: "Recordings are only available to paid attendees" }, { status: 401 });
    }

    const csvUrl = process.env.QDW_RECORDINGS_CSV_URL || DEFAULT_RECORDINGS_CSV_URL;
    const sheetResponse = await fetch(csvUrl, { cache: "no-store" });

    if (!sheetResponse.ok) {
      return NextResponse.json({ error: "Failed to load recordings sheet" }, { status: 502 });
    }

    const csv = await sheetResponse.text();
    const csvSections = recordingsFromCsv(csv);
    const videoSections = await listBucketVideos(supabase, email);
    const sections = [...videoSections, ...csvSections];

    return NextResponse.json({
      success: true,
      sections,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error loading recordings:", error);
    return NextResponse.json({ error: "Failed to load recordings" }, { status: 500 });
  }
}