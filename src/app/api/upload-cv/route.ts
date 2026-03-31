import { NextRequest, NextResponse } from 'next/server';

// Configure max file size (15MB)
const MAX_FILE_SIZE = 15 * 1024 * 1024;

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
    const firstName = formData.get('firstName') as string | null;
    const lastName = formData.get('lastName') as string | null;

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

    // Generate filename: cvs/[Last_name][First_name]CV_[timestamp].pdf
    let filename: string;
    if (firstName && lastName) {
      const sanitizedLastName = lastName.replace(/[^a-zA-Z0-9]/g, '');
      const sanitizedFirstName = firstName.replace(/[^a-zA-Z0-9]/g, '');
      const timestamp = Date.now();
      filename = `cvs/${sanitizedLastName}${sanitizedFirstName}CV_${timestamp}.pdf`;
    } else {
      const timestamp = Date.now();
      const sanitizedEmail = email?.replace(/[^a-zA-Z0-9]/g, '_') || 'unknown';
      const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      filename = `cvs/${timestamp}_${sanitizedEmail}_${sanitizedOriginalName}`;
    }

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
      console.error('Supabase CV upload error:', errorText);
      throw new Error('Failed to upload CV');
    }

    const storageReference = `/storage/v1/object/${bucketName}/${filename}`;

    return NextResponse.json({
      url: storageReference,
      filename: filename,
      size: file.size,
    });
  } catch (error) {
    console.error('Error uploading CV:', error);
    return NextResponse.json(
      { error: 'Failed to upload CV. Please try again.' },
      { status: 500 }
    );
  }
}
