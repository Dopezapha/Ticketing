# 🥂 Digital Luxe: Wedding Ticketing & Guest Management Platform

A premium, production-ready event management platform designed specifically for high-profile weddings. It provides a seamless, luxurious digital experience for guests while offering robust, real-time analytics and access control for event organizers.

Built for **Amarachi & Kingsley's Royal Wedding**.

---

## ✨ Key Features

*   **Virtual Envelope Experience**: A stunning, glassmorphic landing page featuring cinematic animations (Framer Motion) and custom gold-dust particle effects.
*   **Secure Invitation Codes**: Unique, single-use codes (e.g., `WED-A1B2C3`) prevent unauthorized registrations. Generates in batches of 250 via the Admin dashboard.
*   **Automated Seat Allocation**: Intelligently assigns table and seat numbers dynamically based on custom guest categories (FGC Classmates, Asoebi, Men on Suit, etc.) with a 10-seats-per-block limit.
*   **Intelligent Text Normalization**: Custom category text inputs are aggressively normalized (e.g., "AGC Youth", "agc youth", "youth ag" all map to "Ag Youth") to ensure clean data analytics.
*   **Digital Tickets & QR Codes**: Instantly generates a personalized digital permit with a scannable QR code for fast venue check-in.
*   **Automated Email Confirmations**: Integrates with the Resend API (via secure Vercel Serverless Functions) to trigger branded email confirmations upon successful registration.
*   **Real-Time Admin Dashboard**: Password-protected (`wedding2026`) command center to monitor live arrival rates, manage categories, generate codes, and scan guests in.
*   **Offline Support (PWA)**: Includes a Service Worker for progressive web app capabilities, ensuring the scanner and core pages load even in poor venue network conditions.

---

## 🛠️ Technology Stack

*   **Frontend**: React 18, Vite, React Router DOM
*   **Styling**: Pure CSS (`index.css`) utilizing modern glassmorphism, CSS variables, and responsive design.
*   **Animations**: Framer Motion
*   **Database**: Supabase (PostgreSQL)
*   **Email Service**: Resend API
*   **Deployment**: Vercel (with Serverless Functions)
*   **QR Scanning**: `html5-qrcode`

---

## 🚀 Getting Started (Local Development)

### Prerequisites
*   Node.js (v18+)
*   Supabase Account
*   Resend Account

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/wedding-ticketing.git
cd wedding-ticketing
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory and add the following:
```env
# Supabase Credentials
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Email Credentials (Resend)
VITE_RESEND_API_KEY=your_resend_api_key

# Admin Security
VITE_ADMIN_PASSWORD=wedding2026
```

### 3. Database Setup (Supabase)
Run the following SQL in your Supabase SQL Editor to set up the schema and bypass RLS for ease of event-day use:

```sql
CREATE TABLE guests (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  category TEXT NOT NULL,
  category_name TEXT NOT NULL,
  table_number INTEGER NOT NULL,
  seat_number INTEGER NOT NULL,
  checked_in BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE invite_codes (
  code TEXT PRIMARY KEY,
  is_used BOOLEAN DEFAULT false,
  used_by UUID REFERENCES guests(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE settings (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Disable RLS for fast production deployment
ALTER TABLE guests DISABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
```

### 4. Run the Development Server
Because this project utilizes a Vercel Serverless Function (`api/email.js`) to securely hide the Resend API key, it is recommended to test using the Vercel CLI locally:
```bash
npx vercel dev
```
*(Alternatively, use `npm run dev` if you do not need to test the email sending functionality locally).*

---

## 🌍 Deployment to Vercel

This application is configured for seamless deployment to Vercel, utilizing `vercel.json` for SPA routing and the `api/` directory for secure backend logic.

1. Connect your GitHub repository to Vercel.
2. In the Vercel project settings, add the Environment Variables listed above.
3. Deploy!

---

## 📸 Usage Workflow

1. **Setup**: The Admin logs into `/admin` and clicks **"Generate 250 Codes"**.
2. **Distribution**: The Admin securely shares these unique codes with invited guests.
3. **Registration**: Guests visit the homepage, enter their code, and fill out their details.
4. **Confirmation**: Guests receive an on-screen QR Ticket and an automated email.
5. **Event Day**: Security uses the `/admin` dashboard on their mobile devices to scan QR codes and update the live "Checked-In" analytics.

---
*Crafted with precision for a once-in-a-lifetime celebration.*
