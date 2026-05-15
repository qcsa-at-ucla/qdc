import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RegType =
  | "student_in_person"
  | "student_online"
  | "professional_in_person"
  | "professional_online";

const REG_TYPES: RegType[] = [
  "student_in_person",
  "student_online",
  "professional_in_person",
  "professional_online",
];

const PRICE_ENV_KEYS: Record<RegType, string> = {
  student_in_person: "STRIPE_PRICE_STUDENT_IN_PERSON",
  student_online: "STRIPE_PRICE_STUDENT_ONLINE",
  professional_in_person: "STRIPE_PRICE_PROFESSIONAL_IN_PERSON",
  professional_online: "STRIPE_PRICE_PROFESSIONAL_ONLINE",
};

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    const adminApiKey = process.env.ADMIN_API_KEY;
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }
    if (!adminApiKey) {
      return NextResponse.json({ error: "Admin access not configured" }, { status: 500 });
    }
    if (!stripeKey) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    // Verify admin credentials
    const adminEmailEnv = process.env.ADMIN_EMAIL;
    const { apiKey, adminEmail } = await request.json();

    if (!apiKey || apiKey !== adminApiKey) {
      return NextResponse.json({ error: "Unauthorized - Invalid API key" }, { status: 401 });
    }
    if (adminEmailEnv && (!adminEmail || adminEmail.toLowerCase() !== adminEmailEnv.toLowerCase())) {
      return NextResponse.json({ error: "Unauthorized - Invalid email" }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const stripe = new Stripe(stripeKey, { apiVersion: "2026-01-28.clover" as any });

    // Count paid registrations grouped by type
    const { data: rows, error } = await supabase
      .from("qdw_registrations")
      .select("registration_type")
      .eq("payment_status", "paid");

    if (error) {
      console.error("Error fetching payment stats:", error);
      return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }

    // Tally counts
    const counts: Record<string, number> = {};
    for (const row of rows ?? []) {
      const t = row.registration_type as string;
      counts[t] = (counts[t] ?? 0) + 1;
    }

    // Fetch list prices from Stripe for each known type
    const listPrices: Record<RegType, number | null> = {
      student_in_person: null,
      student_online: null,
      professional_in_person: null,
      professional_online: null,
    };

    await Promise.all(
      REG_TYPES.map(async (type) => {
        const priceId = process.env[PRICE_ENV_KEYS[type]];
        if (!priceId) return;
        try {
          const price = await stripe.prices.retrieve(priceId);
          listPrices[type] = price.unit_amount ?? null;
        } catch (err) {
          console.error(`Failed to fetch Stripe price for ${type}:`, err);
        }
      })
    );

    // Build per-type stats
    const breakdown = REG_TYPES.map((type) => {
      const count = counts[type] ?? 0;
      const unitCents = listPrices[type];
      const listPriceTotalCents = unitCents !== null ? count * unitCents : null;
      return {
        type,
        count,
        unitAmountCents: unitCents,
        listPriceTotalCents,
      };
    });

    // Totals (only where list price is available)
    const totalCount = breakdown.reduce((s, b) => s + b.count, 0);
    const totalListCents = breakdown.every((b) => b.listPriceTotalCents !== null)
      ? breakdown.reduce((s, b) => s + (b.listPriceTotalCents ?? 0), 0)
      : null;

    return NextResponse.json({
      success: true,
      breakdown,
      totals: { count: totalCount, listPriceTotalCents: totalListCents },
    });
  } catch (err) {
    console.error("Error in payment-stats API:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
