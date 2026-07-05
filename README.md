<div align="center">

# 🏥 MediCare HMS — Hospital Management System

### A Full-Stack MERN Application for Complete Hospital Operations

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Render-4ecdc4?style=for-the-badge)](https://mern-hospital-management-system-3lok.onrender.com)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-v19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-v4-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)

**A production-ready, fully responsive hospital management system with 12+ modules, 65+ REST APIs, Google OAuth, email verification, role-based access control, and a modern glassmorphism UI.**

[Live Demo](https://mern-hospital-management-system-3lok.onrender.com) · [Report Bug](https://github.com/Aadarsh-60/mern-hospital-management-system/issues) · [Request Feature](https://github.com/Aadarsh-60/mern-hospital-management-system/issues)

</div>

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Seeding](#-database-seeding)
- [Demo Credentials](#-demo-credentials)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Role-Based Access Control](#-role-based-access-control)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔐 Authentication & Security
- **JWT Authentication** with secure token-based sessions
- **Google OAuth 2.0** — Register and login with Google (role selection on signup)
- **Email Verification** — OTP-based email verification via Gmail SMTP
- **Forgot / Reset Password** — Secure token-based password recovery
- **Role-Based Access Control (RBAC)** — 5 roles: Admin, Doctor, Patient, Receptionist, Nurse
- **Helmet.js** security headers with custom CSP for Google OAuth
- **Rate Limiting** — 500 requests per 15 minutes per IP
- **CORS** protection with whitelisted origins

### 👨‍⚕️ Doctor Module
- Doctor listing with search & specialization filter
- Doctor profile with qualifications, experience & ratings
- Available appointment slots management
- View & manage assigned appointments

### 🧑 Patient Module
- Patient registration with full medical profile
- View personal medical records & prescriptions
- Book appointments with preferred doctors
- Emergency contact & allergy tracking

### 📅 Appointment Booking
- Real-time available slot checking per doctor
- One-click appointment booking for patients
- Status management: Pending → Confirmed → Completed / Cancelled
- Admin & doctor can update appointment status

### 🛏️ Bed & Ward Management
- Ward creation (General, ICU, Emergency, Maternity, Pediatric)
- Real-time bed availability dashboard with color-coded grid
- Admit / Discharge patient workflow
- Bed status: Available, Occupied, Reserved, Maintenance

### 🚑 Ambulance Tracking
- Fleet management with vehicle details & driver info
- Equipment tracking (ventilator, defibrillator, oxygen, etc.)
- Patient ambulance booking system
- Booking status management (Pending → Dispatched → Completed)

### 💊 Pharmacy & Inventory
- Medicine catalog with generic names, categories & manufacturers
- Stock management with quantity tracking
- Low stock alerts with configurable reorder levels
- Medicine dispensing with patient-linked history
- Prescription requirement tracking

### 🧪 Lab & Diagnostics
- Lab test catalog (CBC, Blood Sugar, Lipid Profile, ECG, X-Ray, etc.)
- Doctor-initiated lab test ordering
- Result entry with normal range comparison
- Report status tracking (Ordered → Processing → Completed)

### 🩸 Blood Bank
- Real-time blood group inventory (A+, A−, B+, B−, AB+, AB−, O+, O−)
- Stock update by authorized staff
- Dashboard view accessible to all authenticated users

### 👥 Staff Management
- Staff directory with department & designation
- Duty roster with shift management (Morning / Evening / Night)
- On-duty / off-duty toggle
- Department-wise filtering

### 🛡️ Admin Dashboard
- System-wide statistics (total doctors, patients, appointments, beds)
- User management — view, activate/deactivate, delete users
- Role-based data visibility
- Interactive charts (Recharts)

### 📊 Medical Records
- Doctor-created patient medical records
- Diagnosis, prescriptions, and treatment notes
- Print-ready e-prescription layout
- Patient-accessible medical history

### 🎨 UI / UX
- **Glassmorphism** design with gradient accents
- **Dark navy sidebar** with animated navigation
- **Responsive** — works on desktop, tablet & mobile
- **Micro-animations** — hover effects, floating shapes, page transitions
- **Google Fonts (Inter)** typography
- **Recharts** for interactive data visualization

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI library with functional components & hooks |
| **React Router v7** | Client-side routing & navigation |
| **Axios** | HTTP client for API communication |
| **Vite 8** | Lightning-fast build tool & dev server |
| **Recharts** | Data visualization & charts |
| **Lucide React** | Modern icon library |
| **React Hot Toast** | Toast notifications |
| **@react-oauth/google** | Google One Tap & OAuth login |
| **Vanilla CSS** | Custom design system with CSS variables |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js 18+** | JavaScript runtime |
| **Express.js 4** | Web application framework |
| **MongoDB + Mongoose 8** | NoSQL database & ODM |
| **JWT (jsonwebtoken)** | Stateless authentication |
| **bcryptjs** | Password hashing (12 salt rounds) |
| **google-auth-library** | Server-side Google OAuth verification |
| **Nodemailer** | Email service (Gmail SMTP) |
| **Helmet** | HTTP security headers |
| **express-rate-limit** | API rate limiting |
| **Morgan** | HTTP request logging (dev mode) |
| **CORS** | Cross-origin resource sharing |

### DevOps & Deployment
| Technology | Purpose |
|---|---|
| **Render** | Cloud deployment platform |
| **MongoDB Atlas** | Cloud-hosted database |
| **GitHub** | Version control & CI/CD trigger |

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                       │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌─────────────┐  │
│  │  Pages   │  │Components│  │ Context │  │  Services   │  │
│  │ (14 modules)│ (Layout) │  │(AuthCtx)│  │  (api.js)   │  │
│  └────┬─────┘  └─────┬────┘  └────┬────┘  └──────┬──────┘  │
│       └──────────────┼──────────┘          Axios  │         │
└──────────────────────┼─────────────────────────────┘        │
                       │  HTTP (REST API)                     │
┌──────────────────────┼──────────────────────────────────────┐
│                    SERVER (Express.js)                       │
│  ┌────────┐  ┌──────────────┐  ┌────────────┐              │
│  │ Routes │→ │  Controllers │→ │   Models   │→  MongoDB    │
│  │ (12)   │  │   (12)       │  │   (12)     │   Atlas      │
│  └────┬───┘  └──────────────┘  └────────────┘              │
│       │                                                     │
│  ┌────┴────────────────────────────────────┐                │
│  │  Middleware: auth.js, errorHandler.js   │                │
│  │  Utils: emailService, generateToken     │                │
│  │  Config: db.js (MongoDB connection)     │                │
│  └─────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Git**
- A **Gmail account** with [App Password](https://myaccount.google.com/apppasswords) for email features
- A **Google Cloud Console** project for OAuth (optional)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Aadarsh-60/mern-hospital-management-system.git
cd mern-hospital-management-system

# 2. Install all dependencies (root + backend + frontend)
npm run install-all

# 3. Set up environment variables (see section below)
cp hospital-backend/.env.example hospital-backend/.env
# Edit hospital-backend/.env with your values

# 4. Seed the database with demo data
cd hospital-backend && node utils/seeder.js && cd ..

# 5. Start both servers (frontend + backend)
npm run dev
```

The app will be running at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

---

## ⚙️ Environment Variables

### Backend (`hospital-backend/.env`)

```env
# ── Server ────────────────────────────────
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# ── MongoDB ───────────────────────────────
MONGO_URI=mongodb://localhost:27017/hospital_db
# For production, use MongoDB Atlas:
# MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/hospital_db

# ── JWT ───────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

# ── Email (Gmail SMTP) ────────────────────
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM=Hospital Management <your_gmail@gmail.com>

# ── Google OAuth ──────────────────────────
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### Frontend (`hospital-frontend/.env`)

```env
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
VITE_API_URL=http://localhost:5000/api
```

> **Note:** In production on Render, set `VITE_GOOGLE_CLIENT_ID` as a build-time environment variable. The frontend uses `/api` as fallback when `VITE_API_URL` is not set.

---

## 🌱 Database Seeding

Populate the database with realistic demo data:

```bash
cd hospital-backend
node utils/seeder.js
```

This creates:
| Data | Count | Details |
|---|---|---|
| **Users** | 13 | 1 Admin, 4 Doctors, 2 Patients, 1 Receptionist, 1 Nurse, 5 Staff |
| **Wards** | 5 | General, ICU, Emergency, Maternity, Pediatric |
| **Beds** | 10 | Mixed statuses (available, occupied, reserved, maintenance) |
| **Ambulances** | 4 | Advanced, Basic, ICU-Mobile types |
| **Medicines** | 10 | Various categories with stock levels |
| **Staff** | 5 | Nurse, Ward Boy, Lab Tech, Pharmacist, Receptionist |
| **Lab Tests** | 12 | CBC, Blood Sugar, Lipid Profile, ECG, X-Ray, etc. |

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| 🛡️ **Admin** | `admin@hospital.com` | `admin123` |
| 👨‍⚕️ **Doctor** | `rahul@hospital.com` | `doctor123` |
| 🧑 **Patient** | `avinash@test.com` | `patient123` |
| 📋 **Receptionist** | `meena@hospital.com` | `recep123` |
| 👩‍⚕️ **Nurse** | `sunita@hospital.com` | `nurse123` |

> Quick Demo buttons are available on the Login page for instant role-based login.

---

## 📡 API Documentation

**Base URL:** `/api`

### Authentication (`/api/auth`) — 9 endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register new user |
| `GET` | `/auth/verify-email/:token` | Public | Verify email address |
| `POST` | `/auth/resend-verification` | Public | Resend verification email |
| `POST` | `/auth/login` | Public | Login with email/password |
| `POST` | `/auth/google` | Public | Google OAuth (register/login) |
| `POST` | `/auth/forgot-password` | Public | Request password reset |
| `PUT` | `/auth/reset-password/:token` | Public | Reset password with token |
| `GET` | `/auth/me` | Protected | Get current user profile |
| `PUT` | `/auth/update-password` | Protected | Update password |

### Doctors (`/api/doctors`) — 5 endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/doctors` | Public | Get all doctors (search, filter) |
| `GET` | `/doctors/specializations` | Public | Get specialization list |
| `GET` | `/doctors/:id` | Public | Get doctor by ID |
| `GET` | `/doctors/appointments` | Doctor | Get doctor's appointments |
| `PUT` | `/doctors/profile` | Doctor | Update doctor profile |

### Patients (`/api/patients`) — 5 endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/patients` | Admin, Doctor, Staff | Get all patients |
| `GET` | `/patients/profile` | Patient | Get own profile |
| `PUT` | `/patients/profile` | Patient | Update own profile |
| `GET` | `/patients/appointments` | Patient | Get own appointments |
| `GET` | `/patients/medical-records` | Patient | Get own medical records |

### Appointments (`/api/appointments`) — 6 endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/appointments/slots/:doctorId` | Public | Get available slots |
| `POST` | `/appointments` | Patient | Book appointment |
| `GET` | `/appointments` | Admin | Get all appointments |
| `GET` | `/appointments/:id` | Protected | Get appointment details |
| `PUT` | `/appointments/:id/status` | Doctor, Admin | Update status |
| `PUT` | `/appointments/:id/cancel` | Protected | Cancel appointment |

### Beds (`/api/beds`) — 8 endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/beds/summary` | Protected | Get bed summary stats |
| `GET` | `/beds/wards` | Protected | Get all wards |
| `POST` | `/beds/wards` | Admin | Create new ward |
| `GET` | `/beds` | Protected | Get all beds |
| `POST` | `/beds` | Admin | Add new bed |
| `PUT` | `/beds/:id/admit` | Admin, Doctor | Admit patient |
| `PUT` | `/beds/:id/discharge` | Admin, Doctor | Discharge patient |
| `PUT` | `/beds/:id/status` | Admin | Update bed status |

### Ambulance (`/api/ambulance`) — 7 endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/ambulance` | Protected | Get all ambulances |
| `POST` | `/ambulance` | Admin | Add ambulance |
| `PUT` | `/ambulance/:id` | Admin | Update ambulance |
| `POST` | `/ambulance/book` | Protected | Book ambulance |
| `GET` | `/ambulance/bookings` | Admin | Get all bookings |
| `GET` | `/ambulance/my-bookings` | Protected | Get own bookings |
| `PUT` | `/ambulance/bookings/:id/status` | Admin | Update booking status |

### Pharmacy (`/api/pharmacy`) — 6 endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/pharmacy/medicines` | Protected | Get all medicines |
| `POST` | `/pharmacy/medicines` | Admin | Add medicine |
| `PUT` | `/pharmacy/medicines/:id/stock` | Admin | Update stock |
| `GET` | `/pharmacy/alerts` | Admin | Get low stock alerts |
| `POST` | `/pharmacy/dispense` | Admin | Dispense medicines |
| `GET` | `/pharmacy/dispensing` | Admin | Get dispensing history |

### Staff (`/api/staff`) — 6 endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/staff` | Admin | Get all staff |
| `POST` | `/staff` | Admin | Add staff member |
| `GET` | `/staff/duty-roster` | Admin | Get duty roster |
| `GET` | `/staff/:id` | Admin | Get staff by ID |
| `PUT` | `/staff/:id` | Admin | Update staff member |
| `PUT` | `/staff/:id/duty` | Admin | Toggle duty status |

### Lab (`/api/lab`) — 7 endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/lab/tests` | Public | Get all lab tests |
| `POST` | `/lab/tests` | Admin | Add lab test |
| `POST` | `/lab/reports` | Doctor | Order lab tests |
| `GET` | `/lab/reports` | Protected | Get lab reports |
| `GET` | `/lab/reports/:id` | Protected | Get report by ID |
| `PUT` | `/lab/reports/:id/results` | Admin | Enter test results |
| `PUT` | `/lab/reports/:id/status` | Admin | Update report status |

### Medical Records (`/api/medical-records`) — 4 endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/medical-records` | Doctor | Create record |
| `GET` | `/medical-records/patient/:patientId` | Doctor, Admin | Get patient records |
| `GET` | `/medical-records/:id` | Protected | Get record by ID |
| `PUT` | `/medical-records/:id` | Doctor | Update record |

### Blood Bank (`/api/bloodbank`) — 2 endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/bloodbank` | Protected | Get blood stock |
| `PUT` | `/bloodbank` | Admin, Receptionist, Nurse | Update stock |

### Admin (`/api/admin`) — 4 endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/admin/dashboard` | Admin, Receptionist | Get dashboard stats |
| `GET` | `/admin/users` | Admin | Get all users |
| `PUT` | `/admin/users/:id/toggle` | Admin | Toggle user active status |
| `DELETE` | `/admin/users/:id` | Admin | Delete user |

> **Total: 69 REST API endpoints**

---

## 📂 Project Structure

```
Hospital Management System/
├── hospital-backend/               # Express.js Backend
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── controllers/                # Route handlers (12 files)
│   │   ├── authController.js       # Auth + Google OAuth
│   │   ├── doctorController.js
│   │   ├── patientController.js
│   │   ├── appointmentController.js
│   │   ├── bedController.js
│   │   ├── ambulanceController.js
│   │   ├── pharmacyController.js
│   │   ├── staffController.js
│   │   ├── labController.js
│   │   ├── medicalRecordController.js
│   │   ├── bloodBankController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js                 # JWT protect + role authorize
│   │   └── errorHandler.js         # Global error handler
│   ├── models/                     # Mongoose schemas (12 files)
│   │   ├── User.js                 # Auth, roles, OAuth fields
│   │   ├── Doctor.js
│   │   ├── Patient.js
│   │   ├── Appointment.js
│   │   ├── Bed.js / Ward.js
│   │   ├── Ambulance.js
│   │   ├── Medicine.js
│   │   ├── Staff.js
│   │   ├── LabTest.js
│   │   ├── MedicalRecord.js
│   │   └── BloodBank.js
│   ├── routes/                     # Express routers (12 files)
│   ├── utils/
│   │   ├── emailService.js         # Nodemailer email templates
│   │   ├── generateToken.js        # JWT token generator
│   │   ├── generateCryptoToken.js  # Crypto token for email/reset
│   │   └── seeder.js               # Database seeder script
│   ├── server.js                   # Express app entry point
│   ├── .env.example
│   └── package.json
│
├── hospital-frontend/              # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/             # DashboardLayout (Sidebar + Topbar)
│   │   │   └── ProtectedRoute.jsx  # Auth & role guard
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Auth state management
│   │   ├── pages/                   # 14 page modules
│   │   │   ├── Auth/               # Login, Register, ForgotPassword, VerifyEmail
│   │   │   ├── Dashboard/          # Admin dashboard with stats & charts
│   │   │   ├── Doctors/            # Doctor list & detail views
│   │   │   ├── Patients/           # Patient list & profile
│   │   │   ├── Appointments/       # Appointment booking & management
│   │   │   ├── MedicalRecords/     # Medical records & prescriptions
│   │   │   ├── Beds/               # Bed grid & ward management
│   │   │   ├── Ambulance/          # Ambulance fleet & bookings
│   │   │   ├── Pharmacy/           # Medicine inventory & dispensing
│   │   │   ├── Staff/              # Staff directory & duty roster
│   │   │   ├── Lab/                # Lab tests & reports
│   │   │   ├── BloodBank/          # Blood inventory dashboard
│   │   │   ├── Admin/              # User management
│   │   │   └── Settings/           # Profile settings
│   │   ├── services/
│   │   │   └── api.js              # Axios API client (69 endpoints)
│   │   ├── App.jsx                 # Router + GoogleOAuthProvider
│   │   ├── main.jsx                # React entry point
│   │   └── index.css               # Complete design system
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── package.json                    # Root scripts (build, start, dev)
├── DEPLOYMENT_GUIDE.md
└── README.md
```

---

## 🔒 Role-Based Access Control

```
┌──────────────┬───────┬────────┬─────────┬──────────────┬───────┐
│   Module     │ Admin │ Doctor │ Patient │ Receptionist │ Nurse │
├──────────────┼───────┼────────┼─────────┼──────────────┼───────┤
│ Dashboard    │  ✅   │  ✅    │   ✅    │     ✅       │  ✅   │
│ Doctors      │  ✅   │  ✅    │   ✅    │     ✅       │  ✅   │
│ Patients     │  ✅   │  ✅    │   ❌    │     ✅       │  ✅   │
│ Appointments │  ✅   │  ✅    │   ✅    │     ❌       │  ❌   │
│ Med Records  │  ✅   │  ✅    │   ✅    │     ❌       │  ❌   │
│ Beds         │  ✅   │  ✅    │   ❌    │     ✅       │  ✅   │
│ Ambulance    │  ✅   │  ❌    │   ✅    │     ✅       │  ❌   │
│ Pharmacy     │  ✅   │  ❌    │   ❌    │     ❌       │  ❌   │
│ Staff        │  ✅   │  ❌    │   ❌    │     ✅       │  ❌   │
│ Lab Reports  │  ✅   │  ✅    │   ❌    │     ❌       │  ❌   │
│ Blood Bank   │  ✅   │  ✅    │   ✅    │     ✅       │  ✅   │
│ User Mgmt    │  ✅   │  ❌    │   ❌    │     ❌       │  ❌   │
│ Settings     │  ✅   │  ✅    │   ✅    │     ✅       │  ✅   │
└──────────────┴───────┴────────┴─────────┴──────────────┴───────┘
```

---

## 🚀 Deployment

This project is configured for **single-service deployment on Render.com**. The Express backend serves the built React frontend in production.

### Quick Deploy to Render

1. **Push to GitHub**
2. **Create a Web Service on [Render.com](https://render.com)**
3. **Configure:**
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
4. **Add Environment Variables** (see table below)
5. **Deploy!**

### Production Environment Variables on Render

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGO_URI` | Your MongoDB Atlas URI |
| `JWT_SECRET` | A strong random secret |
| `JWT_EXPIRE` | `7d` |
| `CLIENT_URL` | `https://your-app.onrender.com` |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | Your Gmail address |
| `EMAIL_PASS` | Gmail App Password |
| `EMAIL_FROM` | `Hospital <your@gmail.com>` |
| `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth Client Secret |
| `GOOGLE_CALLBACK_URL` | `https://your-app.onrender.com/api/auth/google/callback` |
| `VITE_GOOGLE_CLIENT_ID` | Same as GOOGLE_CLIENT_ID |

> **Important:** Add your Render URL to Google Cloud Console → Credentials → OAuth Client → **Authorized JavaScript Origins** and **Authorized Redirect URIs**.

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed step-by-step instructions.

---

## 🤝 Contributing

Contributions are welcome! Follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Aadarsh**

- GitHub: [@Aadarsh-60](https://github.com/Aadarsh-60)

---

<div align="center">

**⭐ Star this repo if you found it useful!**

Made with ❤️ using the MERN Stack

</div>
