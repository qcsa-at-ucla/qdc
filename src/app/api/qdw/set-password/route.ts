import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
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

    // Verify user exists and has paid
    const { data: user, error: fetchError } = await supabase
      .from("qdw_registrations")
      .select("id, email, password_hash")
      .eq("email", email.toLowerCase())
      .eq("payment_status", "paid")
      .single();

    if (fetchError || !user) {
      return NextResponse.json(
        { error: "User not found or payment not verified" },
        { status: 404 }
      );
    }

    // Check if password already set
    if (user.password_hash) {
      return NextResponse.json(
        { error: "Password already set. Please use login." },
        { status: 400 }
      );
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Update user with password hash
    const { error: updateError } = await supabase
      .from("qdw_registrations")
      .update({ password_hash: passwordHash })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to set password:", updateError);
      return NextResponse.json(
        { error: "Failed to set password" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Password set successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Set password error:", err);
    return NextResponse.json(
      { error: "An error occurred while setting password" },
      { status: 500 }
    );
  }
}
