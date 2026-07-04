# 🏥 Hospital Management System - Backend

**Stack:** Node.js + Express.js + MongoDB (Mongoose) + JWT Auth

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env and add your MongoDB URI + JWT secret

# 3. Seed sample data (optional)
node utils/seeder.js

# 4. Start server
npm run dev       # Development (nodemon)
npm start         # Production
```

---

## 🔐 Default Test Credentials (after seeding)

| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | admin@hospital.com     | admin123    |
| Doctor  | rahul@hospital.com     | doctor123   |
| Patient | aadarsh@test.com       | patient123  |

---

## 📋 API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint               | Access  | Description          |
|--------|------------------------|---------|----------------------|
| POST   | /register              | Public  | Register user        |
| POST   | /login                 | Public  | Login                |
| GET    | /me                    | Private | Get own profile      |
| PUT    | /update-password       | Private | Change password      |

### Doctors (`/api/doctors`)
| Method | Endpoint               | Access        | Description              |
|--------|------------------------|---------------|--------------------------|
| GET    | /                      | Public        | Get all doctors (search/filter) |
| GET    | /specializations       | Public        | List all specializations |
| GET    | /:id                   | Public        | Get doctor by ID         |
| PUT    | /profile               | Doctor        | Update own profile       |
| GET    | /appointments          | Doctor        | Get own appointments     |

### Patients (`/api/patients`)
| Method | Endpoint               | Access        | Description              |
|--------|------------------------|---------------|--------------------------|
| GET    | /                      | Admin         | Get all patients         |
| GET    | /profile               | Patient       | Get own profile          |
| PUT    | /profile               | Patient       | Update own profile       |
| GET    | /appointments          | Patient       | Get own appointments     |
| GET    | /medical-records       | Patient       | Get own medical records  |

### Appointments (`/api/appointments`)
| Method | Endpoint               | Access        | Description              |
|--------|------------------------|---------------|--------------------------|
| GET    | /slots/:doctorId       | Public        | Check available slots    |
| POST   | /                      | Patient       | Book appointment         |
| GET    | /                      | Admin         | Get all appointments     |
| GET    | /:id                   | Private       | Get appointment details  |
| PUT    | /:id/status            | Doctor/Admin  | Update status + notes    |
| PUT    | /:id/cancel            | Patient/Admin | Cancel appointment       |

### Medical Records (`/api/medical-records`)
| Method | Endpoint               | Access        | Description              |
|--------|------------------------|---------------|--------------------------|
| POST   | /                      | Doctor        | Create record            |
| GET    | /patient/:patientId    | Doctor/Admin  | Get patient's records    |
| GET    | /:id                   | Private       | Get single record        |
| PUT    | /:id                   | Doctor        | Update record            |

### Admin (`/api/admin`)
| Method | Endpoint               | Access  | Description          |
|--------|------------------------|---------|----------------------|
| GET    | /dashboard             | Admin   | Stats + analytics    |
| GET    | /users                 | Admin   | All users            |
| PUT    | /users/:id/toggle      | Admin   | Activate/Deactivate  |
| DELETE | /users/:id             | Admin   | Delete user          |

---

## 🏗️ Project Structure

```
hospital-backend/
├── config/
│   └── db.js               # MongoDB connection
├── controllers/
│   ├── authController.js
│   ├── doctorController.js
│   ├── patientController.js
│   ├── appointmentController.js
│   ├── medicalRecordController.js
│   └── adminController.js
├── middleware/
│   ├── auth.js             # JWT protect + authorize
│   └── errorHandler.js
├── models/
│   ├── User.js
│   ├── Doctor.js
│   ├── Patient.js
│   ├── Appointment.js
│   └── MedicalRecord.js
├── routes/
│   ├── authRoutes.js
│   ├── doctorRoutes.js
│   ├── patientRoutes.js
│   ├── appointmentRoutes.js
│   ├── medicalRecordRoutes.js
│   └── adminRoutes.js
├── utils/
│   ├── generateToken.js
│   └── seeder.js
├── .env.example
├── server.js
└── package.json
```

---

## 🔑 Auth Header Format

```
Authorization: Bearer <your_jwt_token>
```

---

## 📦 Register Body Examples

**Patient:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "pass123",
  "role": "patient",
  "phone": "9876543210"
}
```

**Doctor:**
```json
{
  "name": "Dr. Smith",
  "email": "smith@hospital.com",
  "password": "pass123",
  "role": "doctor",
  "specialization": "Cardiology",
  "qualification": "MD",
  "consultationFee": 800
}
```
