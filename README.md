#  Appointment Booking Platform

A full-featured healthcare appointment booking platform built with **Next.js**, **TypeScript**, and **Tailwind CSS**. It features a complete authentication flow with OTP verification, doctor discovery, appointment booking, medical records management, and a responsive dashboard.

---

##  Live Demo

**Deployed on Vercel:** [https://pearlthoughts-loginpage.vercel.app/](https://pearlthoughts-loginpage.vercel.app/)

---

### Demo Credentials

| Field    | Value         |
| -------- | ------------- |
| Email    | `demo@gmail.com` |
| Password | `Demo@123`    |
| OTP      | `123456`      |
---

### login Page
| login Page                                | 
| ---------------------------------------------------- | 
| ![login Page](https://github.com/user-attachments/assets/716cc4bb-97ee-42e2-b74e-f99e369139ce) 
---
##  Features

- **Modern Aesthetic**: Clean, centered card layout with a Cyan/Indigo color scheme.
- **Responsive Design**: Fully responsive layout that looks great on mobile, tablet, and desktop.
- **Interactive Elements**:
  - Focus states for input fields.
  - Password visibility toggle (Eye/EyeOff icons).
  - Loading state on the "Login" button.
  - "Remember Me" checkbox with custom styling.
- **Social Login Options**:
  - Google Login button.
  - Apple Login button.
- **Validation**:
  - Frontend validation for empty fields.
  - Success/Error alerts 

## 🛠️ Technologies Used

- **Framework**: [Next.js 15+](https://nextjs.org/) 
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Alerts**: [SweetAlert2](https://sweetalert2.github.io/)

## 📦 Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/prathamesonar/pearlthoughts.git
   cd pearlthoughts
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

##  Authentication Flow

```
Login Page (email + password)
    │
    ▼ (credentials validated, no session set)
OTP Verification (6-digit code)
    │
    ▼ (session created ONLY after correct OTP)
Dashboard
```

- OTP is required **every time** a user logs in — not just the first time.
- Session is stored in `localStorage` as `schedula_current_user`.
- Dashboard has an **auth guard** — unauthenticated users are redirected to login.

---

##  Responsive Design

- **Desktop**: Sidebar navigation with full labels
- **Mobile**: Bottom tab navigation bar with icons
- All pages are fully responsive and mobile-friendly

---
