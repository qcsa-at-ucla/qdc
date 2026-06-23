import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { existsSync } from "fs";
import * as fontkit from "fontkit";
import path from "path";
import sharp from "sharp";
import { verifyCertificateToken } from "@/lib/qdwCertificateToken";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_CERTIFICATE_BUCKET = "QDW-Certificate";
const NAME_TEXT_COLOR = "#d69756";
const NAME_CENTER_X_RATIO = 0.5;
const NAME_CENTER_Y_RATIO = 0.475;
const NAME_MAX_WIDTH_RATIO = 0.55;
const BASE_FONT_SIZE_RATIO = 0.075;
const MIN_FONT_SIZE_RATIO = 0.035;
const NAME_FONT_PATH = path.join(process.cwd(), "public", "fonts", "GreatVibes-Regular.ttf");

let cachedNameFont: fontkit.Font | null = null;

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

function certificateTemplatePath(): string {
  if (process.env.QDW_CERTIFICATE_TEMPLATE) return process.env.QDW_CERTIFICATE_TEMPLATE;

  const publicTemplate = path.join(process.cwd(), "public", "images", "qdw-certificate-template.png");
  if (existsSync(publicTemplate)) return publicTemplate;

  return path.join(process.cwd(), "example_certificate.png");
}

function nameFont(): fontkit.Font {
  if (cachedNameFont) return cachedNameFont;

  if (!existsSync(NAME_FONT_PATH)) {
    throw new Error(`Certificate name font not found: ${NAME_FONT_PATH}`);
  }

  cachedNameFont = fontkit.openSync(NAME_FONT_PATH) as fontkit.Font;
  return cachedNameFont;
}

function fittedFontSize(name: string, imageWidth: number, font: fontkit.Font): number {
  const baseSize = imageWidth * BASE_FONT_SIZE_RATIO;
  const minSize = imageWidth * MIN_FONT_SIZE_RATIO;
  const maxWidth = imageWidth * NAME_MAX_WIDTH_RATIO;

  for (let fontSize = baseSize; fontSize >= minSize; fontSize -= 4) {
    const run = font.layout(name);
    const width = run.advanceWidth * (fontSize / font.unitsPerEm);
    if (width <= maxWidth) return fontSize;
  }

  return minSize;
}

function namePathData(name: string, imageWidth: number, imageHeight: number): string {
  const font = nameFont();
  const fontSize = fittedFontSize(name, imageWidth, font);
  const scale = fontSize / font.unitsPerEm;
  const run = font.layout(name);
  const textWidth = run.advanceWidth * scale;
  const textHeight = (run.bbox.maxY - run.bbox.minY) * scale;
  const startX = imageWidth * NAME_CENTER_X_RATIO - textWidth / 2;
  const baselineY = imageHeight * NAME_CENTER_Y_RATIO + textHeight / 2 + run.bbox.minY * scale;
  let cursorX = startX;
  const paths: string[] = [];

  for (let index = 0; index < run.glyphs.length; index++) {
    const glyph = run.glyphs[index];
    const position = run.positions[index];
    const glyphX = cursorX + position.xOffset * scale;
    const glyphY = baselineY + position.yOffset * scale;
    paths.push(glyph.path.scale(scale, -scale).translate(glyphX, glyphY).toSVG());
    cursorX += position.xAdvance * scale;
  }

  return paths.join("");
}

async function generateCertificatePng(name: string, templatePath: string): Promise<Buffer> {
  const image = sharp(templatePath);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Certificate template dimensions could not be read");
  }

  const pathData = namePathData(name, metadata.width, metadata.height);

  const svg = `
    <svg width="${metadata.width}" height="${metadata.height}" xmlns="http://www.w3.org/2000/svg">
      <path d="${pathData}" fill="${NAME_TEXT_COLOR}" />
    </svg>
  `;

  return image
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toBuffer();
}

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token")?.trim();
    const shouldDownload = request.nextUrl.searchParams.get("download") === "true";

    if (!token) {
      return new NextResponse("Certificate token is required", { status: 400 });
    }

    const tokenPayload = verifyCertificateToken(token);
    if (!tokenPayload) {
      return new NextResponse("Unauthorized", { status: 401 });
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
      .eq("id", tokenPayload.registrationId)
      .ilike("email", escapedLikeEmail(tokenPayload.email))
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

    const templatePath = certificateTemplatePath();
    const png = await generateCertificatePng(fullName, templatePath);
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
  }
}