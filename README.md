# SIEC Certification Portal 🎓

> **Official E-Certificate Generation & Distribution Platform**  
> Built by **Student Industry Engagement Community (SIEC)** — GIT Gurugram

A high-performance, secure, full-stack certificate automation platform that enables administrators to visually design, batch-generate, and distribute verified e-certificates to event participants — complete with ZIP bulk downloads, spam-proof email delivery, and one-click LinkedIn certification sharing.

🌐 **Live:** [siec-certification-portal.vercel.app](https://siec-certification-portal.vercel.app)  
📧 **Support:** [teamskillsetu@gitmgurgaon.com](mailto:teamskillsetu@gitmgurgaon.com)

---

## ✨ Key Features

### 🎨 Visual Certificate Designer
- **Interactive Drag-and-Drop Canvas**: Place and customize text elements directly onto certificate templates.
- **Dynamic Variable Binding**: Bind roster columns (e.g., `{{Name}}`, `{{Role}}`, `{{Date}}`, `{{CertificateId}}`) dynamically.
- **Custom Typography & Formatting**: Full control over font family, font size, color palette, and alignment per element.
- **Multi-Template Support**: Upload custom high-res background templates (PNG/JPG) or select from built-in SIEC presets.

### 📊 Flexible Participant Management & CSV Normalization
- **Smart CSV/Excel Parser**: Automatic header normalization supporting case-insensitive column names (`name`, `Name`, `email`, `Email`, `role`, `Role`).
- **Bulk Role Assignment**: Apply roles across entire uploaded batches with a single click.
- **Manual Participant Management**: Add, edit, or remove participants inline without reloading spreadsheets.
- **Zero-PII Public Listings**: Student rosters remain strictly private in the database and are never leaked to public client bundles.

### 🔗 Public Verification & Participant Self-Service Portal
- **Instant Certificate Lookup**: Participants find certificates by entering their registered email.
- **Event-Scoped & Cross-Event Search**: Filter by a specific event or search across all published community events.
- **Download All Certificates (.ZIP)**: One-click bulk export bundling all verified certificates into a single `.zip` file using `JSZip`.
- **Multi-Format Exports**: Individual high-resolution PNG, print-ready PDF, and direct **Add to LinkedIn Profile** integration.
- **Sub-Second Performance**: Two-phase in-memory server caching for fast verification responses without database lag.

### 📬 Spam-Proof Email Delivery System
- **Spam-Compliant HTML Template**: Clean, low-formatted HTML strictly engineered to bypass modern spam and promotional filters.
- **Hyperlinked Access**: Direct verification link embedded within the official certificate notice.
- **SMTP with Nodemailer**: Powered by Gmail SMTP with App Passwords; includes safe simulation mode for local development.

### 🔐 Multi-Tenant Admin Isolation & Row-Level Security (RLS)
- **Role-Based Admin Protection**: Client-side `<AdminGuard>` coupled with organization secret key validation.
- **Strict Creator Isolation**: Admin dashboards only display and allow management of events created by the authenticated admin (`admin_id = auth.uid()`).
- **Database Row-Level Security**: Comprehensive Supabase RLS policies (`supabase_rls_security_patch.sql`) blocking unauthorized anonymous access to raw participant tables.
- **Public Portal Accessibility**: The public portal (`/`) always lists all published events across all organizers so participants can verify certificates without restriction.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, React 19) |
| **Styling** | Vanilla CSS + [Tailwind CSS](https://tailwindcss.com/) |
| **Authentication** | [Firebase Authentication](https://firebase.google.com/) |
| **Database & Storage** | [Supabase](https://supabase.com/) (PostgreSQL + RLS + Storage) |
| **Email Service** | [Nodemailer](https://nodemailer.com/) (Gmail SMTP) |
| **Rendering & Canvas** | HTML5 Canvas, [html2canvas](https://html2canvas.hertzen.com/), [jsPDF](https://github.com/parallax/jsPDF) |
| **File Archiving** | [JSZip](https://stuk.github.io/jszip/), [FileSaver](https://github.com/eligrey/FileSaver.js/) |
| **Roster Parsing** | [PapaParse](https://www.papaparse.com/), [SheetJS (xlsx)](https://sheetjs.com/) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ 
- A [Firebase](https://console.firebase.google.com/) project (Email/Password Auth)
- A [Supabase](https://supabase.com/) project (PostgreSQL database & storage)
- A Gmail account with an **App Password** for sending emails

---

### 1. Clone & Install

```bash
git clone https://github.com/Manav200/siec-certification-portal.git
cd siec-certification-portal
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# ── Firebase Authentication ────────────────────────────────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# ── Supabase (Database & Storage) ──────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# ── Authorization & Admin Registration ─────────────────────────────────────
NEXT_PUBLIC_ADMIN_EMAILS=admin@siec.edu,organizer@example.com
NEXT_PUBLIC_ADMIN_REGISTRATION_KEY=your_organization_secret_passcode

# ── Email Dispatch (Gmail SMTP) ────────────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=certificate.siecportal@gmail.com
SMTP_PASS=your_16_character_app_password
SMTP_FROM="Student Industry Engagement Community (SIEC)" <certificate.siecportal@gmail.com>
```

> ⚠️ **Never commit `.env.local` to Git.**

### 3. Supabase Database & Security Patch

Run the SQL patch provided in `supabase_rls_security_patch.sql` inside the Supabase SQL Editor to enable Row-Level Security (RLS) and protect participant records:

```sql
-- Enables RLS and grants creator-only CRUD access
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:4000](http://localhost:4000) in your browser.

---

## 📁 Project Architecture

```
src/
├── app/
│   ├── page.tsx                           # Public Certificate Verification Portal
│   ├── layout.tsx                         # Root Layout with Analytics & Providers
│   ├── admin/
│   │   ├── page.tsx                       # Admin Events Dashboard (Isolated by Creator)
│   │   ├── login/page.tsx                 # Clean Admin Authentication & Registration
│   │   └── editor/page.tsx                # Visual Certificate Designer & Canvas
│   └── api/
│       ├── certificates/verify/route.ts   # Secure 2-Phase Cached Certificate Lookup
│       ├── events/route.ts                # Lightweight Public Events Listing (Zero PII)
│       └── send-certificates/route.ts     # Batch Email Dispatch Route
├── components/
│   ├── admin/                             # Admin Modals, Event Grids, Header Bars
│   ├── auth/                              # AdminGuard with Auto-Redirect Protection
│   ├── editor/                            # Canvas Importers, Dynamic Text Controls
│   ├── portal/                            # Lookup Form, Certificate Viewer, ZIP Download
│   └── SiecLogo.tsx                       # Official SIEC Community Vector Branding
├── lib/
│   ├── firebase.ts                        # Firebase Auth Client Initialization
│   ├── supabase.ts                        # Supabase Client & Storage Helpers
│   └── emailService.ts                    # Ultra-Minimal Anti-Spam Email Generator
├── store/                                 # Global Isolated Event State (useEventStore)
├── context/                               # AuthContext (Firebase User & Admin Roles)
├── types/                                 # Core TypeScript Definitions & Event Schemas
└── utils/                                 # Certificate Renderer, Formats, ZIP Utilities
```

---

## 🛡️ Security Architecture

1. **Zero Client-Side Roster Leaks**: Roster spreadsheets (`csv_data`) are never delivered to the client during public browsing.
2. **Server-Side Verification**: Email verification queries are processed exclusively server-side via `/api/certificates/verify`, returning only the individual matching certificate.
3. **Sliding-Window Rate Limiting**: The verification API implements IP rate-limiting to prevent brute-force dictionary attacks.
4. **Creator Isolation**: Multi-tenant admin architecture ensures each organizer can only access, edit, and delete their own events.

---

## 📄 License

Maintained by **Student Industry Engagement Community (SIEC)** — GIT Gurugram.  
For questions or support, reach out to [teamskillsetu@gitmgurgaon.com](mailto:teamskillsetu@gitmgurgaon.com).
