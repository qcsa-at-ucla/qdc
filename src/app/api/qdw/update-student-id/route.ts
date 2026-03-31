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
    const { email, studentIdPhotoUrl, cvUrl } = body;

    if (!email || (!studentIdPhotoUrl && !cvUrl)) {
      return NextResponse.json(
        { error: 'Email and at least one file URL are required' },
        { status: 400 }
      );
    }

    // Build update object
    const updateFields: Record<string, any> = {};
    if (studentIdPhotoUrl) {
      updateFields.student_id_photo_url = studentIdPhotoUrl;
      // If approval_status is "rejected", reset it to "pending" for re-review
      updateFields.approval_status = 'pending';
      updateFields.approved_at = null;
      updateFields.approved_by = null;
    }
    if (cvUrl) {
      updateFields.cv_url = cvUrl;
    }

    // Update the registration record
    const { data, error } = await supabase
      .from('qdw_registrations')
      .update(updateFields)
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
