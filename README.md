# SIEC Certification Portal 🎓

A modern, full-stack Certificate Generation & Verification platform built with **Next.js 15**, **React 19**, **Tailwind CSS**, and **Firebase Authentication**.

---

## 🌟 Key Features

- **Interactive Visual Certificate Designer**:
  - Drag-and-drop customizable elements (Participant Name, Event Title, Date, Certificate ID, Signatures, and custom Excel columns).
  - Custom font selection, sizing, alignments, and color palettes.
  - Real-time preview with zoom, pan, and snap alignment controls.
  
- **Dynamic Excel Field Mapping**:
  - Upload Excel (`.xlsx`, `.xls`) or CSV participant rosters.
  - Automatically parse all columns; administrators can choose any spreadsheet column to map onto certificate badges.

- **Participant Self-Service Portal**:
  - Participants search certificates simply by entering their registered email address.
  - One-click instant high-resolution PDF download and preview.

- **Enterprise Security & Role-Based Access**:
  - Firebase Authentication with Email & Password.
  - Role-based authorization: only approved administrator emails (`NEXT_PUBLIC_ADMIN_EMAILS`) can access administrative controls and editor tools.
  - Sensitive environment variables are kept local and protected from git tracking.

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)
- A [Firebase](https://console.firebase.google.com/) project

### 2. Environment Setup
1. Copy the sample environment file:
   ```bash
   cp .env.example .env.local
   ```
2. Open `.env.local` and add your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Authorized Admin Emails (comma-separated)
   NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,your-email@gmail.com
   ```

> ⚠️ **IMPORTANT**: Never commit `.env.local` to GitHub. It is included in `.gitignore` to prevent leaking private keys.

### 3. Firebase Console Configuration
1. Go to **Firebase Console** -> **Build** -> **Authentication**.
2. Click **Get Started** and enable the **Email/Password** sign-in provider.
3. Add your web application under **Project Settings** -> **General** -> **Your apps** to obtain your config values.

### 4. Install Dependencies & Run
```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit [http://localhost:4000](http://localhost:4000) (or the port shown in your terminal).

---

## 🛡️ Security
All private credentials, environment variables, local build caches, and sensitive service account keys are excluded using `.gitignore`.
