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

// Domains to exclude from all stats (QCF sponsors, comped entries, etc.)
const EXCLUDED_DOMAINS = ["qcsa-ucla.org"];

function isExcluded(email: string): boolean {
  const lower = email.toLowerCase();
  return EXCLUDED_DOMAINS.some((d) => lower.endsWith(`@${d}`));
}

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

    // Fetch all paid registrations with Stripe IDs
    const { data: rows, error } = await supabase
      .from("qdw_registrations")
      .select("first_name, last_name, email, registration_type, stripe_checkout_session_id, stripe_payment_intent_id")
      .eq("payment_status", "paid");

    if (error) {
      console.error("Error fetching payment stats:", error);
      return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }

    // Filter out excluded domains (QCF sponsors)
    const eligible = (rows ?? []).filter((r) => !isExcluded(r.email ?? ""));
    const excludedCount = (rows ?? []).length - eligible.length;

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

    // Resolve actual amount charged for each registration via Stripe.
    // Process in batches of 20 to avoid hitting Stripe's rate limits.
    // (Firing all 200+ requests concurrently causes random throttle failures
    //  which silently default to $0, making paid users look comped.)
    const BATCH_SIZE = 20;

    async function fetchAmount(row: typeof eligible[0]): Promise<{
      firstName: string; lastName: string; email: string; type: string;
      actualCents: number; noStripeRecord: boolean;
      stripeSessionId: string | null; stripePaymentIntentId: string | null;
    }> {
      let actualCents = 0;
      let noStripeRecord = false;
      try {
        if (row.stripe_checkout_session_id) {
          const session = await stripe.checkout.sessions.retrieve(
            row.stripe_checkout_session_id
          );
          actualCents = session.amount_total ?? 0;
        } else if (row.stripe_payment_intent_id) {
          const pi = await stripe.paymentIntents.retrieve(row.stripe_payment_intent_id);
          actualCents = pi.amount_received ?? 0;
        } else {
          noStripeRecord = true; // 100% coupon with no Stripe record
        }
      } catch (err) {
        console.error("Failed to retrieve Stripe amount for", row.email, err);
        // Re-throw so the batch retries rather than silently returning $0
        throw err;
      }
      return {
        firstName: row.first_name as string,
        lastName: row.last_name as string,
        email: row.email as string,
        type: row.registration_type as string,
        actualCents,
        noStripeRecord,
        stripeSessionId: row.stripe_checkout_session_id as string | null,
        stripePaymentIntentId: row.stripe_payment_intent_id as string | null,
      };
    }

    const amountResults: Awaited<ReturnType<typeof fetchAmount>>[] = [];
    for (let i = 0; i < eligible.length; i += BATCH_SIZE) {
      const batch = eligible.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (row) => {
          // Retry once on failure before giving up
          try {
            return await fetchAmount(row);
          } catch {
            try {
              return await fetchAmount(row);
            } catch (err2) {
              console.error("Stripe lookup failed after retry for", row.email, err2);
              // Only fall back to $0 after both attempts fail
              return {
                firstName: row.first_name as string,
                lastName: row.last_name as string,
                email: row.email as string,
                type: row.registration_type as string,
                actualCents: -1, // sentinel: lookup failed
                noStripeRecord: false,
                stripeSessionId: row.stripe_checkout_session_id as string | null,
                stripePaymentIntentId: row.stripe_payment_intent_id as string | null,
              };
            }
          }
        })
      );
      amountResults.push(...batchResults);
    }

    // Aggregate per type
    const countMap: Record<string, number> = {};
    const actualRevenueMap: Record<string, number> = {};
    const discountedCountMap: Record<string, number> = {}; // genuinely paid $0
    const failedLookupCount: Record<string, number> = {};  // Stripe fetch failed

    for (const { type, actualCents } of amountResults) {
      countMap[type] = (countMap[type] ?? 0) + 1;
      if (actualCents === -1) {
        // Stripe lookup failed — don't count toward revenue or comped
        failedLookupCount[type] = (failedLookupCount[type] ?? 0) + 1;
      } else {
        actualRevenueMap[type] = (actualRevenueMap[type] ?? 0) + actualCents;
        if (actualCents === 0) {
          discountedCountMap[type] = (discountedCountMap[type] ?? 0) + 1;
        }
      }
    }

    // Build per-type stats
    const breakdown = REG_TYPES.map((type) => {
      const count = countMap[type] ?? 0;
      const discountedCount = discountedCountMap[type] ?? 0;
      const failedCount = failedLookupCount[type] ?? 0;
      const paidCount = count - discountedCount - failedCount;
      const unitCents = listPrices[type];
      const actualRevenueCents = actualRevenueMap[type] ?? 0;
      return {
        type,
        count,
        paidCount,
        discountedCount,
        failedCount,
        unitAmountCents: unitCents,
        actualRevenueCents,
      };
    });

    const totalCount = breakdown.reduce((s, b) => s + b.count, 0);
    const totalActualRevenueCents = breakdown.reduce((s, b) => s + b.actualRevenueCents, 0);
    const totalFailedCount = breakdown.reduce((s, b) => s + b.failedCount, 0);

    // Full per-registration detail (sorted: comped first within each type, then by name)
    const registrationDetails = amountResults
      .sort((a, b) => {
        if (a.type !== b.type) return a.type.localeCompare(b.type);
        if (a.actualCents !== b.actualCents) return a.actualCents - b.actualCents; // comped ($0) first
        return a.lastName.localeCompare(b.lastName);
      })
      .map(({ firstName, lastName, email, type, actualCents, noStripeRecord, stripeSessionId, stripePaymentIntentId }) => ({
        firstName,
        lastName,
        email,
        type,
        actualCents,
        noStripeRecord,
        stripeSessionId,
        stripePaymentIntentId,
      }));

    return NextResponse.json({
      success: true,
      breakdown,
      totals: {
        count: totalCount,
        actualRevenueCents: totalActualRevenueCents,
        failedCount: totalFailedCount,
      },
      excludedCount,
      registrationDetails,
    });
  } catch (err) {
    console.error("Error in payment-stats API:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
