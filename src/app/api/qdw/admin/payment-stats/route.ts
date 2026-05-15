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

    // Fetch all paid registrations — include amount_paid_cents from DB
    const { data: rows, error } = await supabase
      .from("qdw_registrations")
      .select("id, first_name, last_name, email, registration_type, stripe_checkout_session_id, stripe_payment_intent_id, amount_paid_cents")
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

    // Split rows: those already have a stored amount vs those that need Stripe lookup (old records).
    type AmountResult = {
      id: string;
      firstName: string; lastName: string; email: string; type: string;
      actualCents: number; noStripeRecord: boolean;
      stripeSessionId: string | null; stripePaymentIntentId: string | null;
    };

    const amountResults: AmountResult[] = [];
    const needsLookup: typeof eligible = [];

    for (const row of eligible) {
      if (row.amount_paid_cents !== null && row.amount_paid_cents !== undefined) {
        // Amount already stored in DB — use it directly, no Stripe call needed
        amountResults.push({
          id: row.id as string,
          firstName: row.first_name as string,
          lastName: row.last_name as string,
          email: row.email as string,
          type: row.registration_type as string,
          actualCents: row.amount_paid_cents as number,
          noStripeRecord: false,
          stripeSessionId: row.stripe_checkout_session_id as string | null,
          stripePaymentIntentId: row.stripe_payment_intent_id as string | null,
        });
      } else {
        needsLookup.push(row);
      }
    }

    // For old records without a stored amount, look up Stripe and backfill the DB.
    // Batch 20 at a time to stay within Stripe's rate limits.
    const BATCH_SIZE = 20;

    const fetchAmount = async (row: typeof eligible[0]): Promise<AmountResult> => {
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
          noStripeRecord = true; // 100% coupon — no Stripe record
        }
      } catch (err) {
        console.error("Failed to retrieve Stripe amount for", row.email, err);
        throw err; // let caller retry
      }

      // Backfill the DB so this lookup never needs to happen again
      if (!noStripeRecord) {
        supabase
          .from("qdw_registrations")
          .update({ amount_paid_cents: actualCents })
          .eq("id", row.id)
          .then(({ error: e }) => {
            if (e) console.error("Failed to backfill amount_paid_cents for", row.email, e);
          });
      }

      return {
        id: row.id as string,
        firstName: row.first_name as string,
        lastName: row.last_name as string,
        email: row.email as string,
        type: row.registration_type as string,
        actualCents,
        noStripeRecord,
        stripeSessionId: row.stripe_checkout_session_id as string | null,
        stripePaymentIntentId: row.stripe_payment_intent_id as string | null,
      };
    };

    for (let i = 0; i < needsLookup.length; i += BATCH_SIZE) {
      const batch = needsLookup.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (row) => {
          try {
            return await fetchAmount(row);
          } catch {
            try {
              return await fetchAmount(row); // one retry
            } catch (err2) {
              console.error("Stripe lookup failed after retry for", row.email, err2);
              return {
                id: row.id as string,
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
