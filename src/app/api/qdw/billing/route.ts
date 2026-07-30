import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type BillingReceipt = {
  id: string;
  created: string;
  amountCents: number | null;
  currency: string | null;
  status: string | null;
  description: string;
  receiptUrl: string;
  invoiceId: string | null;
};

type BillingInvoice = {
  id: string;
  number: string | null;
  created: string;
  status: string | null;
  paid: boolean;
  amountDueCents: number | null;
  amountPaidCents: number | null;
  currency: string | null;
  description: string;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
  receiptUrl: string | null;
};

type RegistrationRow = {
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
};

function getStripe(): Stripe {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  return new Stripe(stripeSecret, {
    apiVersion: "2026-01-28.clover" as any,
  });
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toIsoFromUnix(ts: number): string {
  return new Date(ts * 1000).toISOString();
}

function sanitizeLikeInput(value: string): string {
  return value.replace(/%/g, "\\%").replace(/_/g, "\\_");
}

function emailsMatch(normalizedTarget: string, candidate?: string | null): boolean {
  if (!candidate) return false;
  return candidate.trim().toLowerCase() === normalizedTarget;
}

function invoiceDescription(invoice: Stripe.Invoice): string {
  if (invoice.description) return invoice.description;
  if (invoice.number) return `Invoice ${invoice.number}`;
  return "Invoice";
}

function chargeDescription(charge: Stripe.Charge): string {
  if (charge.description) return charge.description;
  return "Payment Receipt";
}

async function retrieveCharge(
  stripe: Stripe,
  chargeId: string,
  chargeCache: Map<string, Stripe.Charge>
): Promise<Stripe.Charge | null> {
  const cached = chargeCache.get(chargeId);
  if (cached) return cached;

  try {
    const charge = await stripe.charges.retrieve(chargeId);
    chargeCache.set(charge.id, charge);
    return charge;
  } catch (err) {
    console.error(`Failed to retrieve charge ${chargeId}:`, err);
    return null;
  }
}

async function retrievePaymentIntent(
  stripe: Stripe,
  paymentIntentId: string,
  paymentIntentCache: Map<string, Stripe.PaymentIntent>
): Promise<Stripe.PaymentIntent | null> {
  const cached = paymentIntentCache.get(paymentIntentId);
  if (cached) return cached;

  try {
    // Expand latest_charge so we get the receipt_url in one round trip
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ["latest_charge"],
    });
    paymentIntentCache.set(paymentIntent.id, paymentIntent);
    return paymentIntent;
  } catch (err) {
    console.error(`Failed to retrieve payment intent ${paymentIntentId}:`, err);
    return null;
  }
}

async function resolveInvoiceReceiptUrl(
  stripe: Stripe,
  invoice: Stripe.Invoice,
  chargeCache: Map<string, Stripe.Charge>,
  paymentIntentCache: Map<string, Stripe.PaymentIntent>
): Promise<string | null> {
  // Resolve via payment intent stored on the invoice
  const rawPaymentIntentId = (invoice as any).payment_intent as string | null | undefined;
  if (rawPaymentIntentId && typeof rawPaymentIntentId === "string") {
    const paymentIntent = await retrievePaymentIntent(stripe, rawPaymentIntentId, paymentIntentCache);
    if (paymentIntent) {
      if (typeof paymentIntent.latest_charge === "string") {
        const charge = await retrieveCharge(stripe, paymentIntent.latest_charge, chargeCache);
        if (charge?.receipt_url) return charge.receipt_url;
      } else if (paymentIntent.latest_charge?.receipt_url) {
        return paymentIntent.latest_charge.receipt_url;
      }
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const { email } = (await request.json()) as { email?: string };

    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = normalizeEmail(email);
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: memberRows, error: memberError } = await supabase
      .from("qdw_registrations")
      .select("stripe_checkout_session_id, stripe_payment_intent_id")
      .ilike("email", sanitizeLikeInput(normalizedEmail))
      .eq("payment_status", "paid");

    if (memberError) {
      console.error("Billing access check failed:", memberError);
      return NextResponse.json({ error: "Failed to verify access" }, { status: 500 });
    }

    const paidRows = (memberRows || []) as RegistrationRow[];
    if (paidRows.length === 0) {
      return NextResponse.json(
        { error: "Billing records are only available to paid attendees" },
        { status: 401 }
      );
    }

    const stripe = getStripe();

    const checkoutSessionIds = new Set<string>();
    const paymentIntentIds = new Set<string>();
    const customerIds = new Set<string>();

    for (const row of paidRows) {
      if (row.stripe_checkout_session_id) checkoutSessionIds.add(row.stripe_checkout_session_id);
      if (row.stripe_payment_intent_id) paymentIntentIds.add(row.stripe_payment_intent_id);
    }

    const chargeCache = new Map<string, Stripe.Charge>();
    const paymentIntentCache = new Map<string, Stripe.PaymentIntent>();
    const receiptMap = new Map<string, BillingReceipt>();
    const invoiceMap = new Map<string, BillingInvoice>();

    const upsertReceipt = (charge: Stripe.Charge) => {
      if (!charge.receipt_url) return;

      receiptMap.set(charge.id, {
        id: charge.id,
        created: toIsoFromUnix(charge.created),
        amountCents: charge.amount,
        currency: charge.currency || null,
        status: charge.status || null,
        description: chargeDescription(charge),
        receiptUrl: charge.receipt_url,
        invoiceId: null,
      });
    };

    for (const sessionId of Array.from(checkoutSessionIds)) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        // customer can be string or object
        if (typeof session.customer === "string" && session.customer) {
          customerIds.add(session.customer);
        } else if (session.customer && typeof session.customer === "object") {
          customerIds.add((session.customer as Stripe.Customer).id);
        }
        // payment_intent can be string or object depending on API version
        if (typeof session.payment_intent === "string" && session.payment_intent) {
          paymentIntentIds.add(session.payment_intent);
        } else if (session.payment_intent && typeof session.payment_intent === "object") {
          paymentIntentIds.add((session.payment_intent as Stripe.PaymentIntent).id);
        }
      } catch (err) {
        console.error(`Failed to retrieve checkout session ${sessionId}:`, err);
      }
    }

    for (const paymentIntentId of Array.from(paymentIntentIds)) {
      const paymentIntent = await retrievePaymentIntent(stripe, paymentIntentId, paymentIntentCache);
      if (!paymentIntent) continue;

      if (typeof paymentIntent.customer === "string") customerIds.add(paymentIntent.customer);

      let charge: Stripe.Charge | null = null;
      if (typeof paymentIntent.latest_charge === "string") {
        charge = await retrieveCharge(stripe, paymentIntent.latest_charge, chargeCache);
      } else if (paymentIntent.latest_charge) {
        charge = paymentIntent.latest_charge;
        chargeCache.set(charge.id, charge);
      }

      if (charge) {
        upsertReceipt(charge);
      }
    }

    try {
      const customerMatches = await stripe.customers.list({ email: normalizedEmail, limit: 10 });
      for (const customer of customerMatches.data) {
        customerIds.add(customer.id);
      }
    } catch (err) {
      console.error("Failed to list customers by email:", err);
    }

    for (const customerId of Array.from(customerIds)) {
      try {
        const charges = await stripe.charges.list({ customer: customerId, limit: 100 });
        for (const charge of charges.data) {
          chargeCache.set(charge.id, charge);
          upsertReceipt(charge);
        }
      } catch (err) {
        console.error(`Failed to list charges for customer ${customerId}:`, err);
      }

      try {
        const invoices = await stripe.invoices.list({ customer: customerId, limit: 100 });
        for (const invoice of invoices.data) {
          const receiptUrl = await resolveInvoiceReceiptUrl(
            stripe,
            invoice,
            chargeCache,
            paymentIntentCache
          );

          invoiceMap.set(invoice.id, {
            id: invoice.id,
            number: invoice.number || null,
            created: toIsoFromUnix(invoice.created),
            status: invoice.status || null,
            paid: invoice.status === "paid",
            amountDueCents: invoice.amount_due,
            amountPaidCents: invoice.amount_paid,
            currency: invoice.currency || null,
            description: invoiceDescription(invoice),
            hostedInvoiceUrl: invoice.hosted_invoice_url || null,
            invoicePdf: invoice.invoice_pdf || null,
            receiptUrl,
          });
        }
      } catch (err) {
        console.error(`Failed to list invoices for customer ${customerId}:`, err);
      }
    }

    // Stripe Search API does not support email-based queries for charges or invoices.
    // Fall back to listing recent records and matching by email in memory.
    try {
      const recentCharges = await stripe.charges.list({ limit: 100 });
      for (const charge of recentCharges.data) {
        const matchesReceiptEmail = emailsMatch(normalizedEmail, charge.receipt_email);
        const matchesBillingEmail = emailsMatch(normalizedEmail, charge.billing_details?.email);
        if (!matchesReceiptEmail && !matchesBillingEmail) continue;

        chargeCache.set(charge.id, charge);
        upsertReceipt(charge);
      }
    } catch (err) {
      console.error("Failed to list recent charges for email fallback:", err);
    }

    try {
      const recentInvoices = await stripe.invoices.list({ limit: 100 });
      for (const invoice of recentInvoices.data) {
        if (!emailsMatch(normalizedEmail, invoice.customer_email)) continue;

        const receiptUrl = await resolveInvoiceReceiptUrl(
          stripe,
          invoice,
          chargeCache,
          paymentIntentCache
        );

        invoiceMap.set(invoice.id, {
          id: invoice.id,
          number: invoice.number || null,
          created: toIsoFromUnix(invoice.created),
          status: invoice.status || null,
          paid: invoice.status === "paid",
          amountDueCents: invoice.amount_due,
          amountPaidCents: invoice.amount_paid,
          currency: invoice.currency || null,
          description: invoiceDescription(invoice),
          hostedInvoiceUrl: invoice.hosted_invoice_url || null,
          invoicePdf: invoice.invoice_pdf || null,
          receiptUrl,
        });
      }
    } catch (err) {
      console.error("Failed to list recent invoices for email fallback:", err);
    }

    const receipts = Array.from(receiptMap.values()).sort((a, b) =>
      b.created.localeCompare(a.created)
    );
    const invoices = Array.from(invoiceMap.values()).sort((a, b) =>
      b.created.localeCompare(a.created)
    );

    return NextResponse.json({
      success: true,
      receipts,
      invoices,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error loading billing records:", error);
    return NextResponse.json({ error: "Failed to load billing records" }, { status: 500 });
  }
}