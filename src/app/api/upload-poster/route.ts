import { NextRequest, NextResponse } from 'next/server';

// Configure max file size (15MB)
const MAX_FILE_SIZE = 15 * 1024 * 1024;

/**
 * Supabase Storage + Google Drive for PDF uploads
 *
 * Required environment variables:
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_KEY
 *   - SUPABASE_STORAGE_BUCKET (default: 'posters')
 *   - GOOGLE_CLIENT_ID (OAuth client ID)
 *   - GOOGLE_CLIENT_SECRET (OAuth client secret)
 *   - GOOGLE_REFRESH_TOKEN (refresh token from OAuth playground)
 *   - GOOGLE_DRIVE_FOLDER_ID (folder ID from Google Drive URL)
 */

/**
 * Get Google Drive access token using OAuth refresh token
 */
async function getGoogleAccessToken(): Promise<string | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    console.warn('Google Drive OAuth credentials not configured:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasRefreshToken: !!refreshToken,
    });
    return null;
  }

  try {
    // Exchange refresh token for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Google OAuth error:', errorText);
      return null;
    }

    const tokenData = await tokenResponse.json();
    return tokenData.access_token;
  } catch (error) {
    console.error('Error getting Google access token:', error);
    return null;
  }
}

/**
 * Upload file to Google Drive
 */
async function uploadToGoogleDrive(
  fileBuffer: ArrayBuffer,
  filename: string,
  mimeType: string
): Promise<{ success: boolean; fileId?: string; webViewLink?: string }> {
  const accessToken = await getGoogleAccessToken();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!accessToken) {
    console.warn('Skipping Google Drive upload - no access token');
    return { success: false };
  }

  if (!folderId) {
    console.warn('Skipping Google Drive upload - no folder ID configured (GOOGLE_DRIVE_FOLDER_ID)');
    return { success: false };
  }

  console.log('Uploading to Google Drive folder:', folderId);

  try {
    // Create multipart form data for Google Drive API
    const metadata = {
      name: filename,
      parents: [folderId],
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadataPart =
      `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      JSON.stringify(metadata);

    const mediaHeader =
      `${delimiter}Content-Type: ${mimeType}\r\n\r\n`;

    // Convert ArrayBuffer -> Buffer
    const fileBufferNode = Buffer.from(fileBuffer);

    // Join metadata + headers + binary + closing boundary
    const preamble = Buffer.from(metadataPart + mediaHeader, 'utf8');
    const epilogue = Buffer.from(closeDelimiter, 'utf8');

    const requestBody = Buffer.concat([preamble, fileBufferNode, epilogue]);

    const uploadResponse = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink&supportsAllDrives=true',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: requestBody,
      }
    );


    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Google Drive upload error:', errorText);
      return { success: false };
    }

    const result = await uploadResponse.json();
    console.log('Successfully uploaded to Google Drive:', result.id);

    return {
      success: true,
      fileId: result.id,
      webViewLink: result.webViewLink,
    };
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    return { success: false };
  }
}

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

    // Get public URL from Supabase
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filename}`;

    // Also upload to Google Drive (non-blocking - don't fail registration if this fails)
    const googleDriveResult = await uploadToGoogleDrive(bytes, filename, 'application/pdf');
    if (googleDriveResult.success) {
      console.log(`Poster also uploaded to Google Drive: ${googleDriveResult.fileId}`);
    } else {
      console.warn('Google Drive upload failed, but Supabase upload succeeded');
    }

    return NextResponse.json({
      url: publicUrl,
      filename: filename,
      size: file.size,
      googleDriveFileId: googleDriveResult.fileId,
      googleDriveLink: googleDriveResult.webViewLink,
    });
  } catch (error) {
    console.error('Error uploading poster:', error);
    return NextResponse.json(
      { error: 'Failed to upload file. Please try again.' },
      { status: 500 }
    );
  }
}
