import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const { data, error } = await supabase
      .from('qdw_poster_votes')
      .select('poster_id, updated_at, created_at')
      .ilike('voter_email', email)
      .single();

    if (error || !data) {
      return NextResponse.json({ success: true, vote: null });
    }

    return NextResponse.json({ success: true, vote: data });
  } catch (error) {
    console.error('Error in poster vote GET API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { voterEmail, posterId } = body;

    if (!voterEmail || !posterId) {
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
      return NextResponse.json({ error: 'You must be a paid registered attendee to vote' }, { status: 403 });
    }

    const { error } = await supabase.from('qdw_poster_votes').upsert(
      {
        voter_email: voterEmail,
        poster_id: posterId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'voter_email' }
    );

    if (error) {
      console.error('Error saving poster vote:', error);
      return NextResponse.json({ error: 'Failed to save vote' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Poster vote saved successfully' });
  } catch (error) {
    console.error('Error in poster vote API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}