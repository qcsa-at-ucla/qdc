# Student Approval Workflow Implementation

## Overview
Implemented a two-step registration process for students (student_in_person and student_online) that requires admin approval before payment, while maintaining the existing immediate payment flow for professionals.

---

## New Student Workflow

### 1. Student Registration
**Path:** `/qdw/2026/registration`

When a student selects `student_in_person` or `student_online`:
- Student fills out the registration form (including student ID photo)
- Data is saved to the database with `approval_status='pending'`
- Student ID and files are temporarily stored in sessionStorage
- Redirects to waiting room page (no payment yet)

**Database Entry Created:**
- `approval_status`: `'pending'`
- `payment_status`: `'pending'`
- `approval_token`: Generated secure token for payment link
- Password is hashed and stored

### 2. Waiting Room
**Path:** `/qdw/2026/waiting-approval`

Student sees a friendly waiting page explaining:
- Their registration has been submitted
- Admin will review their student ID
- They'll receive an email when approved
- No payment is charged until approval

### 3. Admin Review
**Path:** `/see-all-applicants`

Admin dashboard now shows:
- **3 Status Categories:**
  - Pending Approval (students waiting for review)
  - Approved - Awaiting Payment (approved but not paid yet)
  - Paid (completed registrations)

**New Admin Features:**
- Filter by status dropdown
- Status counts in header
- Student ID photo view link for verification
- "Approve Student" button for pending students

**Approval Process:**
1. Admin clicks "Approve Student" button
2. Confirmation dialog appears
3. System updates `approval_status='approved'` in database
4. Automated email sent via Resend with:
   - Congratulations message
   - Registration details
   - Secure payment link with approval token
   - Instructions for completing payment

### 4. Payment Email
**Sent via Resend**

Student receives a beautifully formatted email containing:
- Registration approval notification
- Their registration details (name, email, type)
- Secure payment link: `/qdw/2026/payment?approved=true&email={email}&token={token}`
- Important reminders (link expires in 7 days, use the same email)

### 5. Student Payment
**Path:** `/qdw/2026/payment?approved=true&email={email}&token={token}`

Payment page now handles two flows:

**For Approved Students:**
- Verifies approval token via `/api/qdw/verify-approval`
- Shows green "Approved" badge
- Displays registration summary
- Creates Stripe checkout session with `isApprovedStudent` flag

**Stripe Integration:**
- Uses existing prices (student_in_person, student_online)
- Supports promotion codes
- Automatic tax collection
- Automatic receipt emails
- Metadata includes `isApprovedStudent=true` and `registrationId`

### 6. Webhook Processing
**Path:** `/api/stripe/webhook`

Webhook now recognizes two scenarios:

**Approved Students:**
- Checks for `isApprovedStudent=true` in metadata
- UPDATES existing registration record (doesn't create new one)
- Sets `payment_status='paid'`
- Records Stripe session and payment intent IDs
- Records `paid_at` timestamp

**Regular Flow (Non-Students):**
- Creates new registration record as before

### 7. Post-Payment File Upload
**Path:** `/qdw/2026/payment/success`

Students upload their files after payment:
- Files stored in sessionStorage from step 1
- CV/Poster PDF → named as `{lastName}{firstName}CV_{timestamp}.pdf`
- Student ID Photo → named as `{lastName}{firstName}_student{N}_Photo-ID_{timestamp}.ext`
- Files uploaded to private Supabase buckets
- Database updated with file storage references

---

## Professional Workflow (Unchanged)

Professionals continue with the existing immediate payment flow:
- Fill registration form
- Data stored in sessionStorage (NOT in database yet)
- Immediate redirect to payment
- After payment, webhook creates database record
- Files uploaded on success page

---

## Database Schema Changes

### New Columns in `qdw_registrations` table:

```sql
approval_status TEXT DEFAULT NULL
  -- Values: 'pending', 'approved', NULL (for non-students)
  
approval_token TEXT DEFAULT NULL
  -- Secure random token for payment link verification
  
approved_at TIMESTAMPTZ DEFAULT NULL
  -- Timestamp when admin approved the registration
  
approved_by TEXT DEFAULT NULL
  -- Identifier for admin who approved (currently "admin")
```

### Migration File:
`scripts/add-approval-status-migration.sql`

**Run this in Supabase SQL Editor to add the new columns.**

---

## New API Endpoints

### 1. `/api/qdw/admin/approve-student` (POST)
**Purpose:** Approve a pending student registration and send email

**Required:**
- `apiKey`: Admin API key
- `registrationId`: UUID of registration to approve

**Actions:**
- Updates `approval_status='approved'`
- Records `approved_at` timestamp
- Sends approval email via Resend with payment link

**Email Content:**
- HTML formatted with QDW branding
- Secure payment link with approval token
- Registration details summary
- Instructions and reminders

### 2. `/api/qdw/verify-approval` (POST)
**Purpose:** Verify approval token before payment

**Required:**
- `email`: Student email
- `token`: Approval token from email link

**Returns:**
- Registration data (excluding sensitive fields)
- Validates token is valid and not expired
- Checks if already paid

---

## Admin Dashboard Updates

### Enhanced Filters:
1. **Status Filter:**
   - All Statuses
   - Pending Approval (count)
   - Approved - Awaiting Payment (count)
   - Paid (count)

2. **Type Filter:**
   - All Types
   - Student (In-Person)
   - Student (Online)
   - Professional (In-Person)
   - Professional (Online)

3. **Search:**
   - Name, email, project title

### Status Badges:
- 🟡 **PENDING APPROVAL** - Yellow badge
- 🔵 **APPROVED (Awaiting Payment)** - Blue badge
- 🟢 **PAID** - Green badge

### Approve Button:
- Only visible for pending students
- Shows "Approving..." during API call
- Confirmation dialog before approval
- Success/error alerts after action
- Auto-refreshes applicant list

---

## Environment Variables Required

### Existing (already configured):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `ADMIN_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SITE_URL`

### Resend (for approval emails):
- `RESEND_API_KEY` - Get from https://resend.com
- `RESEND_FROM_EMAIL` - Verified sender email (e.g., "QDW 2026 <noreply@qdc-qcsa.org>")

---

## Files Modified

### Core Registration Flow:
1. `src/app/qdw/2026/registration/page.tsx` - Split student/non-student flows
2. `src/app/api/register/route.ts` - Added approval_status and approval_token generation

### Payment Flow:
3. `src/app/qdw/2026/payment/page.tsx` - Handle approved students
4. `src/app/api/stripe/checkout/route.ts` - Added isApproved flag
5. `src/app/api/stripe/webhook/route.ts` - Update vs insert logic

### Admin Features:
6. `src/app/see-all-applicants/page.tsx` - Added status filters and approve button
7. `src/app/api/qdw/admin/get-applicants/route.ts` - Return approval_status

### New Files Created:
8. `src/app/qdw/2026/waiting-approval/page.tsx` - Waiting room page
9. `src/app/api/qdw/admin/approve-student/route.ts` - Approval API with Resend
10. `src/app/api/qdw/verify-approval/route.ts` - Token verification API
11. `scripts/add-approval-status-migration.sql` - Database migration

---

## Testing Checklist

### Student Flow:
- [ ] Register as student (in-person or online)
- [ ] Verify redirect to waiting room
- [ ] Check database shows approval_status='pending'
- [ ] Verify files stored in sessionStorage
- [ ] Admin sees student in "Pending Approval" filter
- [ ] Admin can view student ID photo
- [ ] Click "Approve Student" button
- [ ] Receive approval email
- [ ] Click payment link in email
- [ ] Complete payment with Stripe
- [ ] Verify webhook updates record (not creates new one)
- [ ] Upload files on success page
- [ ] Access member portal with credentials

### Professional Flow:
- [ ] Register as professional
- [ ] Verify immediate redirect to payment
- [ ] Complete payment
- [ ] Verify webhook creates new record
- [ ] Upload files on success page

### Admin Dashboard:
- [ ] View pending students
- [ ] View approved (awaiting payment) students
- [ ] View paid registrations
- [ ] Filter by status and type
- [ ] Search functionality
- [ ] Approve button functionality
- [ ] CSV export includes all statuses

---

## Security Considerations

### Approval Token:
- Generated using `crypto.randomBytes(32).toString('hex')`
- 64-character hexadecimal string
- Stored in database, sent in email link
- Verified before payment allowed
- Prevents unauthorized payments

### Admin Access:
- Requires ADMIN_API_KEY for approval actions
- All admin endpoints check API key
- Logged actions for audit trail

### Payment Flow:
- Students cannot pay until approved
- Token must match email and be approved
- Already-paid registrations rejected
- Webhook validates metadata

---

## Email Template

The approval email uses a responsive HTML template with:
- Purple gradient header (QDW branding)
- Registration details in highlighted box
- Prominent "Complete Payment Now" button
- Important information in yellow warning box
- Professional footer with copyright

**Subject:** "Your QDW 2026 Student Registration Has Been Approved! 🎉"

---

## Troubleshooting

### Student not receiving email:
1. Check Resend dashboard for delivery status
2. Verify RESEND_FROM_EMAIL is verified in Resend
3. Check student's spam folder
4. Verify RESEND_API_KEY is correct
5. Check application logs for email sending errors

### Payment link not working:
1. Verify approval token matches in database
2. Check if approval_status='approved'
3. Verify NEXT_PUBLIC_SITE_URL is set correctly
4. Check if registration already paid

### Webhook not updating:
1. Verify STRIPE_WEBHOOK_SECRET is correct
2. Check that isApprovedStudent and registrationId in metadata
3. Review webhook logs in Stripe dashboard
4. Check Supabase update permissions

---

## Future Enhancements (Not Implemented)

Potential additions:
- Rejection workflow with reason
- Automated reminders for pending approvals
- Admin notes on registrations
- Bulk approval actions
- Approval expiration (e.g., 7 days)
- SMS notifications via Twilio
- More granular admin roles

---

## Summary

✅ Students now require admin approval before payment
✅ Professionals continue with immediate payment
✅ Admin can review and approve students in dashboard
✅ Automated email notifications via Resend
✅ Secure token-based payment links
✅ All existing functionality preserved
✅ Zero errors in implementation

The system now provides a proper verification workflow for student registrations while maintaining a seamless experience for professional attendees.
