# SIEC Certification Portal 🎓

> **Official E-Certificate Generation & Distribution Platform**  
> Built by **Student Industry Engagement Community (SIEC)** — GIT Gurugram

A modern, full-stack certificate automation platform that lets administrators visually design, generate, and distribute personalized e-certificates to event participants — with one-click LinkedIn sharing and automated email delivery.

🌐 **Live:** [siec-certification-portal.vercel.app](https://siec-certification-portal.vercel.app)  
📧 **Support:** [teamskillsetu@gitmgurgaon.com](mailto:teamskillsetu@gitmgurgaon.com)

---

## ✨ Features

### 🎨 Visual Certificate Designer
- Drag-and-drop text elements onto the certificate canvas
- Custom font family, size, weight, color, and alignment per element
- Real-time preview with zoom, pan, and snap-to-grid alignment
- Upload your own certificate background (PNG/JPG) or choose a built-in preset template
- Place **dynamic variables** from your spreadsheet directly onto the canvas (Name, Email, Role, Date, Certificate ID, or any custom column)

### 📊 Participant Management
- Upload participant rosters via **Excel (`.xlsx`/`.xls`)** or **CSV**
- Automatically parses all columns — map any column onto the certificate
- **Add participants manually** via a clean modal form (blank fields, no auto-fill)
- **Edit existing participant details** (Name, Email, Role, Issue Date) inline with the Edit button
- Remove participants individually from the roster

### 📬 Automated Email Notifications
- On event publish, automatically dispatches personalized certificate notification emails to all participants
- Responsive HTML email template with SIEC branding
- Direct claim link pre-filled with participant's email
- Falls back to **simulation mode** gracefully if SMTP credentials are not configured (safe for local development)
- Powered by **Nodemailer** with Gmail SMTP (App Password)

### 🔗 Participant Self-Service Portal
- Participants visit the portal and enter their registered email to find their certificate
- One-click **high-resolution PNG download**
- One-click **PDF download** (print-quality)
- **Add to LinkedIn Profile** button — automatically populates LinkedIn's Add Certification flow with event name, organization, issue date, certificate ID, and verification URL

### 🔐 Admin Authentication & Authorization
- **Firebase Authentication** (Email & Password)
- Admins self-register using a secret **organization passcode** (`NEXT_PUBLIC_ADMIN_REGISTRATION_KEY`)
- Role-based access: only pre-authorized admin emails can access editor and dashboard
- All admin routes are protected client-side with an `AdminAuthGuard`

### 📈 Analytics
- Vercel Analytics integrated for production traffic insights

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| UI | [React 19](https://react.dev/), Vanilla CSS + Tailwind CSS |
| Authentication | [Firebase Auth](https://firebase.google.com/) (Email/Password) |
| Database & Storage | [Supabase](https://supabase.com/) (PostgreSQL + File Storage) |
| Email Dispatch | [Nodemailer](https://nodemailer.com/) via Gmail SMTP |
| Certificate Rendering | [html2canvas](https://html2canvas.hertzen.com/), [jsPDF](https://github.com/parallax/jsPDF) |
| CSV/Excel Parsing | [PapaParse](https://www.papaparse.com/), [SheetJS (xlsx)](https://sheetjs.com/) |
| Analytics | [Vercel Analytics](https://vercel.com/analytics) |
| Deployment | [Vercel](https://vercel.com/) |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- A [Firebase](https://console.firebase.google.com/) project (Authentication only)
- A [Supabase](https://supabase.com/) project (Database + Storage)
- A Gmail account with an **App Password** (for email dispatch)

---

### 1. Clone the Repository

```bash
git clone https://github.com/Manav200/siec-certification-portal.git
cd siec-certification-portal
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the sample environment file:

```bash
cp .env.example .env.local
```

Then open `.env.local` and fill in your values:

```env
# ── Firebase (Authentication) ──────────────────────────────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# ── Supabase (Database + Storage) ──────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# ── Authorization ───────────────────────────────────────────────────────────
# Comma-separated list of emails that are granted admin access
NEXT_PUBLIC_ADMIN_EMAILS=admin@yourorg.edu,you@example.com

# Secret passcode admins must enter during self-registration
NEXT_PUBLIC_ADMIN_REGISTRATION_KEY=change_me_to_a_strong_passcode

# ── Email Notifications (Nodemailer / Gmail SMTP) ───────────────────────────
# If omitted, the system runs in simulation mode (no emails sent)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password      # 16-char Gmail App Password
SMTP_FROM="Student Industry Engagement Community (SIEC)" <teamskillsetu@gitmgurgaon.com>
```

> ⚠️ **Never commit `.env.local` to Git.** It is already in `.gitignore`.

---

### 4. Firebase Setup

1. Go to **Firebase Console → Build → Authentication**
2. Click **Get Started** and enable **Email/Password** sign-in
3. Go to **Project Settings → General → Your Apps → Web App** to get your config values

### 5. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → API** to get your URL and anon key
3. Create the required tables for event and participant data (refer to the schema in `/src/config/`)

### 6. Gmail App Password (for Email Dispatch)

1. Enable **2-Step Verification** on your Google Account
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Create an App Password for **Mail**
4. Use the generated 16-character code as `SMTP_PASS`

> Without SMTP credentials, the email system runs in **simulation mode** — events can still be published and certificates accessed, but no emails are sent.

---

### 7. Run Locally

```bash
npm run dev
```

Visit [http://localhost:4000](http://localhost:4000)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                   # Public participant certificate portal
│   ├── layout.tsx                 # Root layout with Analytics
│   ├── admin/
│   │   ├── page.tsx               # Admin dashboard (event list)
│   │   ├── login/page.tsx         # Admin login & self-registration
│   │   └── editor/page.tsx        # Certificate editor
│   └── api/
│       └── send-certificates/     # Email dispatch API route
├── components/
│   ├── admin/                     # Admin UI (modals, event cards, toolbar)
│   ├── editor/                    # Certificate designer (canvas, importers, formatting)
│   ├── portal/                    # Participant-facing views
│   └── Header.tsx                 # Site header with SIEC logo
├── lib/
│   └── emailService.ts            # Nodemailer email service + HTML template
├── store/                         # Global event state (useEventStore)
├── context/                       # Firebase Auth context
├── config/                        # Supabase client config
├── types/                         # TypeScript interfaces
└── utils/                         # Preset templates, helpers
```

---

## 🌍 Deployment (Vercel)

1. Push your code to GitHub
2. Import the repository on [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.example` in **Vercel → Project → Settings → Environment Variables**
4. Deploy — Vercel auto-deploys on every push to `main`

To add environment variables via CLI:
```bash
npx vercel link
npx vercel env add SMTP_USER production
```

---

## 🛡️ Security

- All private keys and credentials are stored in `.env.local` — excluded from Git via `.gitignore`
- Admin routes are protected by Firebase Auth + email allowlist
- Self-registration requires a secret organization passcode
- SMTP credentials are stored as **Vercel Secrets** (encrypted, never exposed in dashboard)

---

## 📄 License

This project is proprietary and maintained by **Student Industry Engagement Community (SIEC)**.  
For inquiries, contact [teamskillsetu@gitmgurgaon.com](mailto:teamskillsetu@gitmgurgaon.com).
