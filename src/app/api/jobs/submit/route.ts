import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { companyName, contactEmail, jobTitle, jobDescription, jobLocation, jobType, category, companyWebsite } = body;

    // Validate required fields
    if (!companyName || !contactEmail || !jobTitle || !jobDescription || !jobLocation) {
      return NextResponse.json(
        { error: 'Missing required fields: companyName, contactEmail, jobTitle, jobDescription, jobLocation' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

    const res = await fetch(`${supabaseUrl}/rest/v1/job_submissions`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        company_name: companyName,
        contact_email: contactEmail,
        job_title: jobTitle,
        job_description: jobDescription,
        job_location: jobLocation,
        job_type: jobType || 'Full-time',
        category: category || 'industry',
        company_website: companyWebsite || null,
        status: 'pending',
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Supabase insert error:', text);
      return NextResponse.json(
        { error: 'Failed to submit job posting' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Job posting submitted for review' });
  } catch (err) {
    console.error('Job submission error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
