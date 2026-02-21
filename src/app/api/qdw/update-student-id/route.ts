import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Update student registration with student ID photo URL
 * 
 * This is called after uploading the student ID to storage
 * to store the reference in the database
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await request.json();
    const { email, studentIdPhotoUrl } = body;

    if (!email || !studentIdPhotoUrl) {
      return NextResponse.json(
        { error: 'Email and studentIdPhotoUrl are required' },
        { status: 400 }
      );
    }

    // Update the registration record with student ID photo URL
    const { data, error } = await supabase
      .from('qdw_registrations')
      .update({
        student_id_photo_url: studentIdPhotoUrl,
      })
      .eq('email', email.toLowerCase())
      .select()
      .single();

    if (error) {
      console.error('Error updating student ID URL:', error);
      return NextResponse.json(
        { error: 'Failed to update registration with student ID URL' },
        { status: 500 }
      );
    }

    console.log('✅ Updated registration with student ID URL:', {
      email,
      studentIdPhotoUrl,
    });

    return NextResponse.json({
      success: true,
      registration: data,
    });

  } catch (error) {
    console.error('Error in update-student-id:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
