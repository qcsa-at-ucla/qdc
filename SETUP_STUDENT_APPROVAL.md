# Quick Setup Guide - Student Approval Workflow

## Step 1: Database Migration
Run this SQL in your Supabase SQL Editor:

```sql
-- Copy and paste from: scripts/add-approval-status-migration.sql
```

This adds the new columns:
- `approval_status`
- `approval_token`
- `approved_at`
- `approved_by`

## Step 2: Configure Resend (Email Service)

1. Go to https://resend.com and create an account (if not already done)
2. Get your API key from the dashboard
3. Verify your sending domain (or use test mode for development)

## Step 3: Add Environment Variables

Add these to your `.env.local` file:

```env
# Resend Configuration (for approval emails)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=QDW 2026 <noreply@qdc-qcsa.org>
```

**Note:** All other required environment variables should already be configured:
- SUPABASE_URL ✓
- SUPABASE_SERVICE_KEY ✓
- ADMIN_API_KEY ✓
- STRIPE_SECRET_KEY ✓
- STRIPE_WEBHOOK_SECRET ✓
- NEXT_PUBLIC_SITE_URL ✓

## Step 4: Test the Workflow

### Test Student Registration:
1. Go to `/qdw/2026/registration`
2. Select "Student — In Person" or "Student — Online"
3. Fill out the form completely (including student ID photo)
4. Click "Register and Continue"
5. You should be redirected to `/qdw/2026/waiting-approval`

### Test Admin Approval:
1. Go to `/see-all-applicants`
2. Enter your ADMIN_API_KEY
3. Select "Pending Approval" from the status filter
4. You should see the student you just registered
5. Click "View Student ID" to verify the ID photo
6. Click "✓ Approve Student"
7. Confirm the approval

### Test Payment Link:
1. Check the student's email (the one used in registration)
2. Look for email with subject "Your QDW 2026 Student Registration Has Been Approved!"
3. Click the "Complete Payment Now" button
4. You'll be taken to the payment page with verified student status
5. Click "Continue to Checkout"
6. Complete payment with Stripe test card: `4242 4242 4242 4242`
7. After payment, upload files on the success page
8. Verify registration is now marked as "PAID" in admin dashboard

### Test Professional Registration (Unchanged Flow):
1. Go to `/qdw/2026/registration`
2. Select "Professional — In Person" or "Professional — Online"
3. Fill out the form
4. You should be redirected directly to payment (no waiting room)
5. Complete payment as normal

## Step 5: Verify Everything Works

### Check Database:
- Students show `approval_status='pending'` after registration
- After admin approval, `approval_status='approved'`
- After payment, `payment_status='paid'`

### Check Admin Dashboard:
- Pending students appear in "Pending Approval" filter
- Approved students appear in "Approved - Awaiting Payment" filter
- Paid registrations appear in "Paid" filter
- Counts are correct in the header
- Approve button works and sends email

### Check Email Delivery:
- Go to Resend dashboard
- View email logs
- Verify email was sent successfully
- Check email formatting looks correct

## Common Issues & Solutions

### Issue: Email not sending
**Solution:** Check Resend dashboard, verify FROM_EMAIL is verified, check API key

### Issue: Payment link gives error
**Solution:** Verify NEXT_PUBLIC_SITE_URL is set correctly, check approval token in database

### Issue: Student can't pay immediately after registration
**Solution:** This is correct! Students must wait for admin approval first

### Issue: Professional gets waiting room
**Solution:** Check that they selected professional type, not student type

### Issue: Webhook not updating student record
**Solution:** Check Stripe webhook logs, verify isApprovedStudent flag in metadata

## Quick Reference

### Student Flow:
1. Register → 2. Wait → 3. Admin approves → 4. Email → 5. Pay → 6. Upload files

### Professional Flow:
1. Register → 2. Pay → 3. Upload files

### Admin Actions:
1. Login to dashboard
2. Filter to "Pending Approval"
3. Review student ID
4. Click "Approve"
5. System sends email automatically

## Need Help?

- Check `STUDENT_APPROVAL_WORKFLOW.md` for detailed documentation
- Review application logs for errors
- Check Supabase logs for database issues
- Check Stripe dashboard for payment issues
- Check Resend dashboard for email delivery issues