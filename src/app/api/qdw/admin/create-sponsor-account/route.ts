import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

/**
 * Admin API - Create or rotate the shared sponsor/guest login for the QDW member portal.
 *
 * This provisions a single `qdw_registrations` row with `registration_type: "sponsor_guest"`
 * and `payment_status: "paid"` so it can sign in through the normal member login flow
 * (POST /api/qdw/login) without going through registration/payment. The member-only
 * portal hides billing, certificate, and profile/poster/CV editing for this account type,
 * and the update-profile/update-poster/update-student-id APIs reject edits to it server-side.
 *
 * Call this once to create the account, and again (with a new password) to rotate the
 * shared credential if it needs to be revoked/reissued.
 *
 * Required environment variables:
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_KEY
 *   - ADMIN_API_KEY
 *
 * Request body:
 *   - apiKey: string (must match ADMIN_API_KEY)
 *   - email: string (the shared login email, e.g. "sponsors@qdc-qcsa.org")
 *   - password: string (min 8 characters; share this with sponsors separately from the email)
 *   - firstName?: string (defaults to "Government")
 *   - lastName?: string (defaults to "Sponsor")
 */
export async function POST(req: Request) {
  try {
    const { apiKey, email, password, firstName, lastName } = await req.json();

    const adminApiKey = process.env.ADMIN_API_KEY;
    if (!adminApiKey || apiKey !== adminApiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!password || typeof password !== "string" || password.length < 12) {
      return NextResponse.json(
        { error: "Password is required and must be at least 12 characters" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const normalizedEmail = email.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(password, 10);

    const { data: existing, error: lookupError } = await supabase
      .from("qdw_registrations")
      .select("id, registration_type")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (lookupError) {
      console.error("Sponsor account lookup error:", lookupError);
      return NextResponse.json({ error: "Failed to look up account" }, { status: 500 });
    }

    if (existing && existing.registration_type !== "sponsor_guest") {
      return NextResponse.json(
        { error: "An account with this email already exists and is not a sponsor/guest account" },
        { status: 409 }
      );
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from("qdw_registrations")
        .update({ password_hash: passwordHash })
        .eq("id", existing.id);

      if (updateError) {
        console.error("Failed to rotate sponsor account password:", updateError);
        return NextResponse.json({ error: "Failed to update sponsor account" }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Sponsor account password rotated" });
    }

    const { error: insertError } = await supabase.from("qdw_registrations").insert({
      first_name: firstName || "Government",
      last_name: lastName || "Sponsor",
      email: normalizedEmail,
      registration_type: "sponsor_guest",
      payment_status: "paid",
      agree_to_terms: true,
      password_hash: passwordHash,
      paid_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Failed to create sponsor account:", insertError);
      return NextResponse.json({ error: "Failed to create sponsor account" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Sponsor account created" });
  } catch (err) {
    console.error("Create sponsor account error:", err);
    return NextResponse.json(
      { error: "An error occurred while creating the sponsor account" },
      { status: 500 }
    );
  }
}
