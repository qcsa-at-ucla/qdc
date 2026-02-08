# Quantum Device Consortium Website

The official website for the Quantum Device Consortium (QDC) - an open association for pioneers of the quantum device design and simulation community. This modern, responsive website showcases our tools, research partners, hosts the annual Quantum Device Workshop (QDW), and provides ways for the community to connect and collaborate.

## About QDC

The Quantum Device Consortium is a collaborative group of research scientists dedicated to advancing quantum device science with a focus on superconducting systems. Supported by the Quantum Computing Student Association (QCSA) at UCLA and USC, we maintain and extend open-source tools for quantum device design and simulation, enabling researchers and developers worldwide to design, simulate, and optimize superconducting quantum devices more efficiently.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) 14.2.35 with App Router
- **Language**: TypeScript 5.x
- **UI Library**: React 18.3.1
- **Styling**: Tailwind CSS 3.4.4
- **Animations**: Framer Motion 12.23.24
- **Payments**: Stripe with Express Checkout Element (Apple Pay, Google Pay)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage + Google Drive (poster uploads)
- **Image Optimization**: Next.js Image Component
- **Deployment**: Optimized for Vercel

## Project Structure

```
qdc-website/
├── public/                          # Static assets
│   └── images/
│       ├── partners/                # Partner/organization logos
│       └── tools/                   # Tool logos/screenshots
├── scripts/
│   └── supabase-schema.sql          # Database schema for Supabase
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── api/
│   │   │   ├── quantum-news/        # Quantum news aggregation
│   │   │   │   └── route.ts
│   │   │   ├── register/            # QDW registration (deferred save)
│   │   │   │   └── route.ts
│   │   │   ├── stripe/
│   │   │   │   ├── checkout/        # Create Stripe checkout session
│   │   │   │   │   └── route.ts
│   │   │   │   ├── create-payment-intent/  # For Express Checkout Element
│   │   │   │   │   └── route.ts
│   │   │   │   └── webhook/         # Handle payment success events
│   │   │   │       └── route.ts
│   │   │   ├── submit-join/         # General join form submission
│   │   │   │   └── route.ts
│   │   │   └── upload-poster/       # Poster PDF upload to Supabase/Drive
│   │   │       └── route.ts
│   │   ├── contact/
│   │   │   └── page.tsx             # Contact form page
│   │   ├── design-tools/
│   │   │   └── page.tsx             # Tools showcase page
│   │   ├── join/
│   │   │   └── page.tsx             # Membership options page
│   │   ├── qdw/                     # Quantum Device Workshop
│   │   │   ├── 2025/
│   │   │   │   └── page.tsx         # QDW 2025 archive
│   │   │   └── 2026/
│   │   │       ├── layout.tsx       # QDW-specific layout (Stripe.js)
│   │   │       ├── faq/
│   │   │       │   └── page.tsx     # FAQ page
│   │   │       ├── info/
│   │   │       │   └── page.tsx     # Event information & interest form
│   │   │       ├── payment/
│   │   │       │   ├── page.tsx     # Payment with Express Checkout
│   │   │       │   ├── success/     # Payment success page
│   │   │       │   │   └── page.tsx
│   │   │       │   └── cancel/      # Payment cancelled page
│   │   │       │       └── page.tsx
│   │   │       ├── registration/
│   │   │       │   └── page.tsx     # Full registration form
│   │   │       └── terms/
│   │   │           └── page.tsx     # Terms & Conditions
│   │   ├── globals.css              # Global styles & Tailwind
│   │   ├── layout.tsx               # Root layout with metadata
│   │   └── page.tsx                 # Homepage
│   └── components/
│       ├── about_us.tsx             # About section with mission
│       ├── AnimatedSection.tsx      # Scroll animation wrapper
│       ├── Footer.tsx               # Site footer
│       ├── Header.tsx               # Hero section
│       ├── InputField.tsx           # Reusable form input
│       ├── Join.tsx                 # Join CTA component
│       ├── MeetingCalendar.tsx      # Meeting schedule component
│       ├── Navbar.tsx               # Navigation with dropdowns
│       ├── Opportunity.tsx          # Opportunities section
│       ├── quantum_news.tsx         # Quantum news feed
│       └── research_partners.tsx    # Partner logos carousel
├── .env.example                     # Environment variables template
├── eslint.config.mjs                # ESLint configuration
├── next.config.js                   # Next.js configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Dependencies & scripts
└── README.md                        # This file
```

## Features

### **Modern Design**

- Fully responsive layout optimized for mobile, tablet, and desktop
- Smooth animations using Framer Motion
- Interactive hover effects and transitions
- Custom gradient backgrounds and shadows
- Accessibility-compliant (ARIA labels, keyboard navigation)

### **Design & Simulation Tools**

The website showcases essential quantum device design tools:

- **Qiskit Metal** - Chip-layout design for superconducting quantum hardware
- **AWS Palace** - Cloud-based large-scale quantum hardware simulation
- **SQUAADS** - Systematic design exploration and optimization
- **scqubits** - Quantum-level modeling of superconducting qubits
- **SuperQubit** - Comprehensive quantum device design resources

Each tool features:
- Detailed descriptions and use cases
- Direct links to GitHub repositories or websites
- Alternating left-right layout for visual interest
- Anchor links for easy navigation

## **QDW 2026 Event Registration System**

The website includes a full-featured event registration and payment system for the Quantum Device Workshop 2026.

### **Key Features**

#### **Multi-Tier Registration**
- Student (In-Person / Online)
- Professional (In-Person / Online)
- Poster/project submissions (optional PDF upload)
- QDC membership interest tracking

#### **Stripe Payment Integration**
- **Express Checkout Element**: Apple Pay, Google Pay, Link (instant checkout)
- **Hosted Checkout**: Traditional card payment fallback
- Real-time payment processing
- Automatic receipt emails

#### **Deferred Save Architecture**
Registration data is **only saved to the database after successful payment**:
1. User fills registration form → data stored in `sessionStorage`
2. Redirects to payment page → data passed to Stripe metadata
3. Payment processed → Stripe webhook fires
4. Webhook saves registration to Supabase with `payment_status: 'paid'`
5. **If payment is cancelled**: No data is saved to database

This prevents abandoned registrations cluttering your database and ensures data integrity.

#### **Poster Upload System**
- PDF upload support (max 15MB)
- Dual storage: Supabase Storage + Google Drive backup
- File validation and error handling
- Links stored with registration data

#### **Admin Dashboard Ready**
- Admin API endpoint: `GET /api/register` (requires `ADMIN_API_KEY`)
- Filter by QDC membership interest
- Export capabilities for registration management

### **Payment Flow**

```
┌─────────────────┐
│  Registration   │
│  Form Filled    │
└────────┬────────┘
         │ sessionStorage
         ▼
┌─────────────────┐
│  Payment Page   │  ◄── Express Checkout (Apple/Google Pay)
│  (ECE mounted)  │  ◄── OR Hosted Checkout (traditional)
└────────┬────────┘
         │ Payment Intent/Session created
         ▼
┌─────────────────┐
│  Stripe Popup   │
│                 │
└────────┬────────┘
         │ Payment succeeds
         ▼
┌─────────────────┐
│ Webhook Fires   │
│ payment_intent. │
│ succeeded  OR   │
│ checkout.       │
│ session.        │
│ completed       │
└────────┬────────┘
         │ Extract metadata
         ▼
┌─────────────────┐
│ INSERT to       │
│ Supabase        │
│ qdw_registra-   │
│ tions table     │
└─────────────────┘
```

### **Database Schema**

The system uses Supabase (PostgreSQL) with the following key tables:

**`qdw_registrations`**
- User information (name, email, designation, location)
- Registration type and pricing tier
- Project/poster details
- Payment tracking (status, Stripe IDs, timestamps)
- QDC membership interest flag

**`quantum_news_cache`**
- Cached quantum physics news articles
- Automated fetching and refresh

**`api_rate_limits`**
- API endpoint protection
- IP-based request throttling

### **Research Partners**

- Infinite scrolling carousel of partner logos
- Respects user's reduced motion preferences
- Features partners including:
  - University of Oregon
  - USC
  - Northwestern University
  - Google AI Quantum
  - Niels Bohr Institute
  - QCSA (Quantum Computing Student Association)

### **Contact & Engagement**

- Contact form with validation
- Member interest form integration
- Join page with multiple engagement options
- API endpoint for form submissions

### **Navigation**

- Sticky navigation bar with backdrop blur
- Dropdown menus for Tools and Resources
- Mobile-responsive hamburger menu
- Smooth scrolling to anchor sections

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm, yarn, or pnpm package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd qdc-website
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open in browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to see the site

   The page will auto-reload when you edit files in the `src/` directory.

## Available Scripts

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Create optimized production build
npm start        # Start production server
npm run lint     # Run ESLint for code quality checks
```

## Key Pages

### Homepage (`/`)

- Hero section with animated call-to-action
- "What We Do" mission statement
- "About Us" with team information
- Research partners carousel
- Responsive design with smooth transitions

### Design Tools (`/design-tools`)

- Tool descriptions
- Visual tool presentations
- GitHub/website links for each tool
- Anchor-linked navigation from navbar

### Join (`/join`)

- Multiple engagement options
- Links to member interest form
- Contact page integration
- Clear call-to-action buttons

### Contact (`/contact`)

- Form with fields: First Name, Last Name, Email, Designation, Location
- Client-side validation
- API integration for form submission
- Success/error feedback

## API Routes

### **General Endpoints**

#### `POST /api/submit-join`
Submit membership interest form.

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "designation": "string",
  "location": "string"
}
```

**Response:**
- `200 OK` - Form submitted successfully
- `400 Bad Request` - Invalid form data
- `500 Internal Server Error` - Server error

#### `GET /api/quantum-news`
Fetch latest quantum physics news articles (cached).

**Response:**
```json
{
  "articles": [
    {
      "title": "string",
      "url": "string",
      "source": "string",
      "publishedAt": "string"
    }
  ]
}
```

### **QDW 2026 Registration Endpoints**

#### `POST /api/upload-poster`
Upload poster PDF to Supabase Storage and Google Drive (soon).

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: PDF file (max 15MB)
- `email`: User email for file naming

**Response:**
```json
{
  "url": "https://supabase-storage-url/path/to/file.pdf"
}
```

**Requirements:**
- Environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_STORAGE_BUCKET`
- Optional: Google Drive OAuth credentials for backup

#### `GET /api/register`
**Admin only** - Retrieve registrations from database.

**Headers:**
```
Authorization: Bearer {ADMIN_API_KEY}
```

**Query Parameters:**
- `qdc_members=true` - Filter for QDC membership interest only

**Response:**
```json
{
  "registrations": [
    {
      "id": "uuid",
      "first_name": "string",
      "last_name": "string",
      "email": "string",
      "registration_type": "student_in_person|student_online|professional_in_person|professional_online",
      "payment_status": "paid",
      "created_at": "timestamp",
      ...
    }
  ]
}
```

### **Stripe Payment Endpoints**

#### `POST /api/stripe/create-payment-intent`
Create a PaymentIntent for Express Checkout Element (Apple Pay, Google Pay, etc.).

**Request Body:**
```json
{
  "registrationType": "student_in_person|student_online|professional_in_person|professional_online",
  "email": "user@example.com",
  "registrationData": {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "designation": "string",
    "location": "string",
    "projectTitle": "string",
    "projectDescription": "string",
    "posterUrl": "string",
    "wantsQdcMembership": boolean,
    "agreeToTerms": boolean
  }
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx"
}
```

**Pricing:**
- `student_in_person`: $30.00
- `student_online`: $15.00
- `professional_in_person`: $100.00
- `professional_online`: $50.00

#### `POST /api/stripe/checkout`
Create a Stripe Checkout Session (hosted checkout fallback).

**Request Body:** Same as create-payment-intent

**Response:**
```json
{
  "url": "https://checkout.stripe.com/c/pay/xxx"
}
```

#### `POST /api/stripe/webhook`
**Stripe webhook handler** - Must be configured in Stripe Dashboard.

**Events Handled:**
- `payment_intent.succeeded` - Express Checkout payment confirmed
- `checkout.session.completed` - Hosted Checkout payment confirmed

**Webhook Actions:**
1. Extracts registration data from Stripe metadata
2. INSERTs new row into `qdw_registrations` table
3. Sets `payment_status: 'paid'` and records Stripe IDs
4. Returns success response

**Configuration:**
- Set webhook endpoint in Stripe Dashboard: `https://yourdomain.com/api/stripe/webhook`
- Select events: `payment_intent.succeeded`, `checkout.session.completed`
- Copy webhook secret to `STRIPE_WEBHOOK_SECRET` environment variable

## 🔌 API Routes

### `/api/submit-join`

**Method:** POST  
**Content-Type:** application/json

**Request Body:**

```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "designation": "string",
  "location": "string"
}
```

**Response:**

- `200 OK` - Form submitted successfully
- `400 Bad Request` - Invalid form data
- `500 Internal Server Error` - Server error

## Styling Guide

The project uses **Tailwind CSS** for styling with custom configurations:

- **Colors**: Custom gradients (indigo-purple theme)
- **Responsive Breakpoints**: `sm`, `md`, `lg`, `xl`
- **Animations**: Framer Motion for complex animations
- **Typography**: System fonts optimized for performance
- **Dark Mode**: Optimized for dark backgrounds with white text

### Custom Components

**AnimatedSection**: Wraps content for scroll-triggered animations

```tsx
<AnimatedSection direction="fade|up|down|left|right" delay={0.1}>
  {/* Your content */}
</AnimatedSection>
```

**InputField**: Reusable form input with consistent styling

```tsx
<InputField 
  id="field-id" 
  name="fieldName" 
  label="Label Text" 
  type="text|email" 
  required 
/>
```

## Deployment

### Vercel (Recommended)

The easiest deployment method for Next.js applications:

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Vercel will auto-detect Next.js and configure settings
   - Click "Deploy"

3. **Environment Variables** (if needed)
   - Add any required environment variables in Vercel dashboard
   - Redeploy if variables are added after initial deployment

### Production Build

To create a production build locally:

```bash
npm run build    # Creates optimized .next folder
npm start        # Runs production server on port 3000
```

## Development Tips

### Hot Reload

- Edit any file in `src/app/` or `src/components/`
- Browser automatically refreshes with changes
- Check terminal for build errors

### TypeScript

- All files use `.tsx` for components with JSX
- Type checking during development
- Run `npm run lint` to check for issues

### Image Optimization

- Always use Next.js `<Image>` component
- Images are automatically optimized
- Specify `width`, `height`, or use `fill` for dynamic sizing

### Adding New Pages

1. Create new folder in `src/app/new-page/`
2. Add `page.tsx` file
3. Export default component
4. Update navbar links if needed

### Adding New Tools

1. Add tool logo to `public/images/tools/` or use existing from `partners/`
2. Update `tools` array in `src/app/design-tools/page.tsx`
3. Add navigation link in `src/components/Navbar.tsx` toolsLinks

## Contributing

We welcome contributions from the community! Here's how you can help:

### Reporting Issues

- Use GitHub Issues to report bugs
- Include screenshots for UI issues
- Provide steps to reproduce

### Submitting Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test thoroughly
5. Commit with clear messages: `git commit -m "Add: new feature description"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Open a Pull Request

### Code Style

- Follow existing TypeScript/React patterns
- Use Tailwind CSS for styling
- Ensure responsive design works on all breakpoints
- Add comments for complex logic
- Run `npm run lint` before committing

### Adding Content

- **New Tools**: Update design-tools page and navbar
- **New Partners**: Add logo to `public/images/partners/` and update research_partners component
- **New Pages**: Follow Next.js App Router conventions

## Learn More

### Next.js Resources

- [Next.js Documentation](https://nextjs.org/docs) - Features and API
- [Learn Next.js](https://nextjs.org/learn) - Interactive tutorial
- [Next.js GitHub](https://github.com/vercel/next.js) - Source code

### Related Tools
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Guide](https://www.framer.com/motion/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Quantum Device Resources
- [Qiskit Metal](https://github.com/Qiskit/qiskit-metal)
- [AWS Palace](https://github.com/awslabs/palace)
- [SQuADDS](https://github.com/LFL-Lab/SQuADDS)
- [scqubits](https://github.com/scqubits/scqubits)
- [SuperQubit](https://superqubit.wordpress.com/my-works/)

## License

See [LICENSE](LICENSE) file for details.

## Contact

For questions about the website or QDC:

- Visit our [Contact Page](https://qdc-qcsa.org/contact)
- Fill out the [Member Interest Form](https://docs.google.com/forms/d/e/1FAIpQLSdIjYlL-Bc9mDbAtzYaoFJJMZwLFPZx048jhwuIz_rvDkCbrw/viewform)

## Acknowledgments

QDC is supported by the Quantum Computing Student Association (QCSA) at UCLA and USC, with collaborators from:

- Google Quantum AI (Zlatko Minev, Murat Can Sarihan)
- USC (Eli Levenson-Falk, Shanto)
- Chapman University (Abhishek)
- Northwestern University (Jens Koch)
- University of Oregon (Nik Zhelev)
- Niels Bohr Institute

---

**Built with ❤️ by the Quantum Device Consortium**
# trigger new commit with correct author
