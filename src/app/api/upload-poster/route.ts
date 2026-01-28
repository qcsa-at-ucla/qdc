import { NextRequest, NextResponse } from 'next/server';

// Configure max file size (15MB)
const MAX_FILE_SIZE = 15 * 1024 * 1024;

/**
 * Supabase Storage for PDF uploads
 *
 * Required environment variables:
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_KEY
 *   - SUPABASE_STORAGE_BUCKET (default: 'posters')
 */

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'posters';

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Storage not configured' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const email = formData.get('email') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 15MB limit' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedEmail = email?.replace(/[^a-zA-Z0-9]/g, '_') || 'unknown';
    const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${sanitizedEmail}_${sanitizedOriginalName}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();

    // Upload to Supabase Storage
    const uploadResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/${bucketName}/${filename}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/pdf',
          'x-upsert': 'true',
        },
        body: bytes,
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Supabase upload error:', errorText);
      throw new Error('Failed to upload file');
    }

    // Get public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filename}`;

    return NextResponse.json({
      url: publicUrl,
      filename: filename,
      size: file.size,
    });
  } catch (error) {
    console.error('Error uploading poster:', error);
    return NextResponse.json(
      { error: 'Failed to upload file. Please try again.' },
      { status: 500 }
    );
  }
}
