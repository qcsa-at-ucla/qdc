import { createHmac, timingSafeEqual } from "crypto";

const CERTIFICATE_TOKEN_SCOPE = "qdw-certificate";
const CERTIFICATE_TOKEN_TTL_SECONDS = 60 * 60 * 12;

type CertificateTokenPayload = {
  email: string;
  exp: number;
  registrationId: string;
  scope: typeof CERTIFICATE_TOKEN_SCOPE;
};

type CreateCertificateTokenInput = {
  email: string;
  registrationId: string;
};

function tokenSecret(): string {
  const secret = process.env.QDW_CERTIFICATE_TOKEN_SECRET || process.env.SUPABASE_SERVICE_KEY;
  if (!secret) throw new Error("Certificate token secret is not configured");
  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", tokenSecret()).update(value).digest("base64url");
}

export function createCertificateToken({ email, registrationId }: CreateCertificateTokenInput): string {
  const payload: CertificateTokenPayload = {
    email: email.toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + CERTIFICATE_TOKEN_TTL_SECONDS,
    registrationId,
    scope: CERTIFICATE_TOKEN_SCOPE,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyCertificateToken(token: string): CertificateTokenPayload | null {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = sign(encodedPayload);
  const signatureBuffer = Buffer.from(signature, "base64url");
  const expectedSignatureBuffer = Buffer.from(expectedSignature, "base64url");
  if (signatureBuffer.length !== expectedSignatureBuffer.length) return null;
  if (!timingSafeEqual(signatureBuffer, expectedSignatureBuffer)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as CertificateTokenPayload;
    if (payload.scope !== CERTIFICATE_TOKEN_SCOPE) return null;
    if (!payload.email || !payload.registrationId || !payload.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}