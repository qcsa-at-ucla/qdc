# Forgot Password Implementation

## Overview
This document describes the forgot password feature that has been implemented for the QDW 2026 member portal.

## Flow
1. User clicks "Forgot password?" link on the login page
2. User enters their email address
3. System generates a secure reset token and sends an email with a reset link
4. User clicks the link in the email
5. User is redirected to the reset password page
6. User enters and confirms their new password
7. Password is hashed and saved to Supabase
8. User is redirected back to login

## Components Created

### 1. Database Schema (`scripts/supabase-schema.sql`)
Added a new table `password_reset_tokens` to store temporary reset tokens:
- Tokens expire after 1 hour
- Tokens can only be used once
- Foreign key relationship to `qdw_registrations` table
- Automatic cleanup function for expired tokens

### 2. API Routes

#### `/api/qdw/forgot-password/route.ts`
- Accepts email address
- Validates user exists and has paid
- Generates secure random token
- Stores token in database
- Sends password reset email using Resend
- Returns success regardless of user existence (security best practice)

#### `/api/qdw/reset-password/route.ts`
- Accepts reset token and new password
- Validates token is valid, not expired, and not used
- Validates password strength (minimum 8 characters)
- Hashes new password using bcrypt
- Updates user password in database
- Marks token as used

### 3. UI Components

#### Updated: `/app/qdw/2026/member-only/page.tsx`
- Added "Forgot password?" link below password field
- Added forgot password form with email input
- Added success message after submitting forgot password request
- Toggle between login and forgot password views

#### New: `/app/qdw/2026/reset-password/page.tsx`
- Standalone page for password reset
- Extracts token from URL query parameter
- Form with password and confirm password fields
- Validation for password match and strength
- Success message with auto-redirect to login

## Setup Required

### 1. Update Supabase Database
Run the updated SQL schema in your Supabase SQL Editor:
```bash
# The schema is located in:
scripts/supabase-schema.sql
```

Execute the new password reset tokens section in your Supabase dashboard.

### 2. Install Dependencies
The Resend package has been installed:
```bash
npm install resend
```

### 3. Environment Variables
Add these environment variables to your `.env.local`:

```env
# Resend API Key (get from https://resend.com)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx

# From email address (must be verified in Resend)
RESEND_FROM_EMAIL=QDW <noreply@yourdomain.com>

# Base URL for reset links (update for production)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Resend Setup
1. Create an account at https://resend.com
2. Verify your domain or use their test domain
3. Get your API key from the dashboard
4. Add the API key to your environment variables

## Security Features

1. **Token Security**
   - Uses cryptographically secure random tokens (32 bytes)
   - Tokens expire after 1 hour
   - Tokens can only be used once
   - SQL injection protection via parameterized queries

2. **Email Enumeration Prevention**
   - Always returns success message regardless of whether email exists
   - Prevents attackers from discovering valid email addresses

3. **Password Requirements**
   - Minimum 8 characters
   - Passwords are hashed using bcrypt with 10 salt rounds
   - Password confirmation required

4. **Rate Limiting**
   - Existing rate limiting infrastructure can be extended to forgot password endpoint

## Testing

### Local Testing
1. Ensure all environment variables are set
2. Run the development server: `npm run dev`
3. Navigate to http://localhost:3000/qdw/2026/member-only
4. Click "Forgot password?"
5. Enter a registered email address
6. Check your email for the reset link
7. Click the link and set a new password

### Test Email Providers
For development, you can use:
- Resend's test mode (doesn't require domain verification)
- Your own verified email domain

## Future Enhancements

1. **Rate Limiting**
   - Add specific rate limits for forgot password endpoint
   - Limit password reset requests per email address

2. **Email Templates**
   - Create branded HTML email templates
   - Add company logo and styling

3. **Security Improvements**
   - Add CAPTCHA to prevent automated attacks
   - Implement device fingerprinting
   - Add 2FA support

4. **User Experience**
   - Email password reset confirmation
   - Show password strength meter
   - Remember last used email

## Troubleshooting

### Email Not Received
1. Check spam folder
2. Verify RESEND_API_KEY is set correctly
3. Check Resend dashboard for delivery status
4. Verify FROM_EMAIL is verified in Resend

### Invalid Token Error
1. Token may have expired (1 hour limit)
2. Token may have already been used
3. Request a new password reset

### Database Errors
1. Ensure Supabase schema has been updated
2. Check Supabase service key is correct
3. Verify RLS policies allow service role access

## Files Modified/Created

### Created:
- `src/app/api/qdw/forgot-password/route.ts`
- `src/app/api/qdw/reset-password/route.ts`
- `src/app/qdw/2026/reset-password/page.tsx`

### Modified:
- `scripts/supabase-schema.sql`
- `src/app/qdw/2026/member-only/page.tsx`
- `package.json` (added resend dependency)

## Support
For issues or questions, contact the development team or open an issue in the repository.
