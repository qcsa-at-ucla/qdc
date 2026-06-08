import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { voterEmail, posterId, feedback } = body;

    if (!voterEmail || !posterId || !feedback?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: registration, error: registrationError } = await supabase
      .from('qdw_registrations')
      .select('id, payment_status')
      .ilike('email', voterEmail)
      .single();

    if (registrationError || !registration || registration.payment_status !== 'paid') {
      return NextResponse.json({ error: 'You must be a paid registered attendee to submit feedback' }, { status: 403 });
    }

    const { error } = await supabase.from('qdw_poster_feedback').insert({
      voter_email: voterEmail,
      poster_id: posterId,
      feedback: feedback.trim(),
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error saving poster feedback:', error);
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error in poster feedback API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}