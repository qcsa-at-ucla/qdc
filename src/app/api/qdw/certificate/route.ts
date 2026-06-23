import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { execFile } from "child_process";
import { randomUUID } from "crypto";
import { existsSync, promises as fs } from "fs";
import os from "os";
import path from "path";
import { promisify } from "util";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const execFileAsync = promisify(execFile);
const DEFAULT_CERTIFICATE_BUCKET = "QDW-Certificate";

function escapedLikeEmail(email: string): string {
  return email.toLowerCase().replace(/%/g, "\\%").replace(/_/g, "\\_");
}

function certificateFilename(name: string): string {
  const safeName = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "attendee";
  return `qdw-2026-certificate-${safeName}.png`;
}

function storagePathSegment(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "") || "registration";
}

function certificateObjectPath(memberId: string, name: string): string {
  return `qdw-2026/${storagePathSegment(memberId)}/${certificateFilename(name)}`;
}

function titleCaseToken(token: string): string {
  if (!token || (token !== token.toLowerCase() && token !== token.toUpperCase())) return token;

  return token
    .toLowerCase()
    .replace(/(^|[-'])([a-z])/g, (_match, prefix: string, letter: string) => `${prefix}${letter.toUpperCase()}`);
}

function displayName(firstName: string | null, lastName: string | null): string {
  return [firstName, lastName]
    .map((value) => (value || "").trim().split(/\s+/).filter(Boolean).map(titleCaseToken).join(" "))
    .filter(Boolean)
    .join(" ");
}

function pythonCommand(): string {
  if (process.env.QDW_CERTIFICATE_PYTHON) return process.env.QDW_CERTIFICATE_PYTHON;

  const localVenvPython = process.platform === "win32"
    ? path.join(process.cwd(), ".venv", "Scripts", "python.exe")
    : path.join(process.cwd(), ".venv", "bin", "python");

  if (existsSync(localVenvPython)) return localVenvPython;

  return process.platform === "win32" ? "python" : "python3";
}

function certificateTemplatePath(): string {
  if (process.env.QDW_CERTIFICATE_TEMPLATE) return process.env.QDW_CERTIFICATE_TEMPLATE;

  const publicTemplate = path.join(process.cwd(), "public", "images", "qdw-certificate-template.png");
  if (existsSync(publicTemplate)) return publicTemplate;

  return path.join(process.cwd(), "example_certificate.png");
}

export async function GET(request: NextRequest) {
  const tmpPath = path.join(os.tmpdir(), `qdw-certificate-${randomUUID()}.png`);

  try {
    const email = request.nextUrl.searchParams.get("email")?.trim();
    const shouldDownload = request.nextUrl.searchParams.get("download") === "true";

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    const certificateBucket = process.env.QDW_CERTIFICATE_BUCKET || DEFAULT_CERTIFICATE_BUCKET;

    if (!supabaseUrl || !supabaseKey) {
      return new NextResponse("Server misconfigured", { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: member, error: memberError } = await supabase
      .from("qdw_registrations")
      .select("id, first_name, last_name")
      .ilike("email", escapedLikeEmail(email))
      .eq("payment_status", "paid")
      .maybeSingle();

    if (memberError) {
      console.error("Certificate access check failed:", memberError);
      return new NextResponse("Failed to verify access", { status: 500 });
    }

    if (!member) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const fullName = displayName(member.first_name, member.last_name);
    if (!fullName) {
      return new NextResponse("Registration name is missing", { status: 400 });
    }

    const scriptPath = path.join(process.cwd(), "scripts", "generate_certificate.py");
    const templatePath = certificateTemplatePath();

    await execFileAsync(
      pythonCommand(),
      [scriptPath, "--name", fullName, "--template", templatePath, "--output", tmpPath],
      { cwd: process.cwd(), timeout: 15000 }
    );

    const png = await fs.readFile(tmpPath);
    const objectPath = certificateObjectPath(String(member.id), fullName);

    if (shouldDownload) {
      const { error: uploadError } = await supabase.storage
        .from(certificateBucket)
        .upload(objectPath, png, {
          cacheControl: "3600",
          contentType: "image/png",
          upsert: true,
        });

      if (uploadError) {
        console.error("Certificate storage upload failed:", uploadError);
        return new NextResponse("Failed to store certificate", { status: 500 });
      }
    }

    const headers = new Headers();
    headers.set("Content-Type", "image/png");
    headers.set("Content-Disposition", `${shouldDownload ? "attachment" : "inline"}; filename="${certificateFilename(fullName)}"`);
    headers.set("Cache-Control", "private, no-store");
    headers.set("X-Certificate-Storage-Bucket", certificateBucket);
    headers.set("X-Certificate-Storage-Path", objectPath);
    headers.set("X-Content-Type-Options", "nosniff");

    return new NextResponse(new Uint8Array(png), { headers });
  } catch (error) {
    console.error("Certificate generation failed:", error);
    return new NextResponse("Failed to generate certificate", { status: 500 });
  } finally {
    await fs.unlink(tmpPath).catch(() => undefined);
  }
}