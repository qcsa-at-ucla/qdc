import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SIGNED_URL_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7;

type PaidRegistration = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  designation: string | null;
  location: string | null;
  registration_type: string | null;
  dietary_restriction: string | null;
  wants_qdc_membership: boolean | null;
  agree_to_terms: boolean | null;
  project_title: string | null;
  project_description: string | null;
  poster_url: string | null;
  cv_url: string | null;
  student_id_photo_url: string | null;
  payment_status: string | null;
  approval_status: string | null;
  approved_at: string | null;
  paid_at: string | null;
  amount_paid_cents: number | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  created_at: string | null;
  updated_at: string | null;
};

function csvCell(value: string | number | boolean | null | undefined): string {
  const stringValue = value === null || value === undefined ? "" : String(value);
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function dateCell(value: string | null): string {
  return value ? new Date(value).toISOString() : "";
}

function storagePathFromReference(storageReference: string | null, bucketName: string): string | null {
  if (!storageReference) return null;

  const objectMarker = `/storage/v1/object/${bucketName}/`;
  const publicObjectMarker = `/storage/v1/object/public/${bucketName}/`;

  if (storageReference.includes(publicObjectMarker)) {
    return storageReference.split(publicObjectMarker)[1] || null;
  }

  if (storageReference.includes(objectMarker)) {
    return storageReference.split(objectMarker)[1] || null;
  }

  if (storageReference.startsWith(`${bucketName}/`)) {
    return storageReference.slice(bucketName.length + 1);
  }

  if (storageReference.startsWith("cvs/")) {
    return storageReference;
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    const adminApiKey = process.env.ADMIN_API_KEY;
    const adminEmailEnv = process.env.ADMIN_EMAIL;
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "posters";

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    if (!adminApiKey) {
      return NextResponse.json({ error: "Admin access not configured" }, { status: 500 });
    }

    const { apiKey, adminEmail } = await request.json();

    if (!apiKey || apiKey !== adminApiKey) {
      return NextResponse.json({ error: "Unauthorized - Invalid API key" }, { status: 401 });
    }

    if (adminEmailEnv && (!adminEmail || adminEmail.toLowerCase() !== adminEmailEnv.toLowerCase())) {
      return NextResponse.json({ error: "Unauthorized - Invalid email" }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("qdw_registrations")
      .select(
        "id, first_name, last_name, email, designation, location, registration_type, dietary_restriction, wants_qdc_membership, agree_to_terms, project_title, project_description, poster_url, cv_url, student_id_photo_url, payment_status, approval_status, approved_at, paid_at, amount_paid_cents, stripe_checkout_session_id, stripe_payment_intent_id, created_at, updated_at"
      )
      .eq("payment_status", "paid")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching paid attendee export:", error);
      return NextResponse.json({ error: "Failed to fetch paid attendees" }, { status: 500 });
    }

    const registrations = (data || []) as PaidRegistration[];

    const rows = await Promise.all(
      registrations.map(async (registration) => {
        const cvStoragePath = storagePathFromReference(registration.cv_url, bucketName);
        let cvSignedUrl = "";
        let cvLinkStatus = registration.cv_url ? "unavailable" : "not_uploaded";

        if (cvStoragePath) {
          const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(cvStoragePath, SIGNED_URL_EXPIRES_IN_SECONDS);

          if (signedUrlError || !signedUrlData?.signedUrl) {
            console.error("Error creating signed CV URL:", signedUrlError);
          } else {
            cvSignedUrl = signedUrlData.signedUrl;
            cvLinkStatus = "signed_url_created";
          }
        }

        return [
          registration.id,
          registration.first_name,
          registration.last_name,
          registration.email,
          registration.registration_type,
          registration.designation,
          registration.location,
          registration.dietary_restriction,
          registration.wants_qdc_membership,
          registration.agree_to_terms,
          registration.project_title,
          registration.project_description,
          registration.payment_status,
          registration.approval_status,
          dateCell(registration.approved_at),
          dateCell(registration.paid_at),
          registration.amount_paid_cents,
          registration.stripe_checkout_session_id,
          registration.stripe_payment_intent_id,
          dateCell(registration.created_at),
          dateCell(registration.updated_at),
          registration.cv_url,
          cvStoragePath,
          cvSignedUrl,
          cvLinkStatus,
          registration.poster_url,
          registration.student_id_photo_url,
        ];
      })
    );

    const headers = [
      "Registration ID",
      "First Name",
      "Last Name",
      "Email",
      "Registration Type",
      "Designation",
      "Location",
      "Dietary Restriction",
      "Wants QDC Membership",
      "Agreed To Terms",
      "Project Title",
      "Project Description",
      "Payment Status",
      "Approval Status",
      "Approved At",
      "Paid At",
      "Amount Paid Cents",
      "Stripe Checkout Session ID",
      "Stripe Payment Intent ID",
      "Created At",
      "Updated At",
      "CV Storage Reference",
      "CV Storage Path",
      "CV Signed URL (expires in 7 days)",
      "CV Link Status",
      "Poster Storage Reference",
      "Student ID Storage Reference",
    ];

    const csv = [
      headers.map(csvCell).join(","),
      ...rows.map((row) => row.map(csvCell).join(",")),
    ].join("\n");

    const filename = `qdw-2026-paid-attendees-${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(`\uFEFF${csv}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error exporting paid attendees:", error);
    return NextResponse.json(
      { error: "Failed to export paid attendees" },
      { status: 500 }
    );
  }
}
