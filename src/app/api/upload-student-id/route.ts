import { NextRequest, NextResponse } from 'next/server';

// Configure max file size (5MB for images)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

/**
 * Upload Student ID Photo to Supabase Storage
 * 
 * Files are renamed as: [last_name][first_name][student #X]Photo-ID
 * where X is an incrementing number based on existing student registrations
 * 
 * Required environment variables:
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_KEY
 */

async function getNextStudentNumber(supabaseUrl: string, supabaseKey: string): Promise<number> {
  try {
    // Count existing student registrations
    const response = await fetch(
      `${supabaseUrl}/rest/v1/qdw_registrations?select=id&registration_type=in.(student_in_person,student_online)`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: 'count=exact',
        },
      }
    );

    // Get the count from the content-range header
    const contentRange = response.headers.get('content-range');
    if (contentRange) {
      // Format is like "0-9/100" or "*/100" for count only
      const match = contentRange.match(/\/(\d+)$/);
      if (match) {
        return parseInt(match[1], 10) + 1;
      }
    }

    // Fallback: count the returned items
    const data = await response.json();
    return (Array.isArray(data) ? data.length : 0) + 1;
  } catch (error) {
    console.error('Error getting student count:', error);
    // Start at 1 if we can't get the count
    return 1;
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    const bucketName = 'student-ids';

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Storage not configured' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const firstName = formData.get('firstName') as string | null;
    const lastName = formData.get('lastName') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    // Validate file type
    const isImage = ALLOWED_TYPES.includes(file.type) || 
      ALLOWED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isImage) {
      return NextResponse.json(
        { error: 'Only image files (JPG, PNG, WebP) are allowed' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Get the file extension
    const originalExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase() || '.jpg';
    const extension = ALLOWED_EXTENSIONS.includes(originalExt) ? originalExt : '.jpg';

    // Get next student number
    const studentNumber = await getNextStudentNumber(supabaseUrl, supabaseKey);

    // Generate filename: [last_name][first_name][student #X]Photo-ID
    // Using underscores instead of brackets/special chars for URL safety
    const sanitizedLastName = lastName.replace(/[^a-zA-Z0-9]/g, '');
    const sanitizedFirstName = firstName.replace(/[^a-zA-Z0-9]/g, '');
    const timestamp = Date.now();
    const filename = `${sanitizedLastName}_${sanitizedFirstName}_student${studentNumber}_Photo-ID_${timestamp}${extension}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();

    // Determine content type
    let contentType = file.type;
    if (!contentType || contentType === 'application/octet-stream') {
      if (extension === '.png') contentType = 'image/png';
      else if (extension === '.webp') contentType = 'image/webp';
      else contentType = 'image/jpeg';
    }

    // Upload to Supabase Storage
    const uploadResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/${bucketName}/${filename}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': contentType,
          'x-upsert': 'true',
        },
        body: bytes,
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Supabase upload error:', errorText);
      console.error('Upload URL:', `${supabaseUrl}/storage/v1/object/${bucketName}/${filename}`);
      console.error('Content-Type:', contentType);
      
      // Return detailed error for debugging
      return NextResponse.json(
        { error: `Storage upload failed: ${errorText}` },
        { status: 500 }
      );
    }

    // Store a reference that our proxy can parse (not a real public URL)
    const storageReference = `/storage/v1/object/student-ids/${filename}`;

    return NextResponse.json({
      url: storageReference,
      filename: filename,
      size: file.size,
      studentNumber: studentNumber,
    });
  } catch (error) {
    console.error('Error uploading student ID:', error);
    return NextResponse.json(
      { error: 'Failed to upload file. Please try again.' },
      { status: 500 }
    );
  }
}
