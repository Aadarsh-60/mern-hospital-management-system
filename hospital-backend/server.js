import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes
import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import medicalRecordRoutes from './routes/medicalRecordRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import bedRoutes from './routes/bedRoutes.js';
import ambulanceRoutes from './routes/ambulanceRoutes.js';
import pharmacyRoutes from './routes/pharmacyRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import labRoutes from './routes/labRoutes.js';
import bloodBankRoutes from './routes/bloodBankRoutes.js';

connectDB();

const app = express();

// ── Security ───────────────────────────────────────────
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin === process.env.CLIENT_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // preflight for all routes
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://accounts.google.com",
        "https://apis.google.com",
        "https://www.gstatic.com",
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://accounts.google.com",
        "https://fonts.googleapis.com",
      ],
      frameSrc: [
        "'self'",
        "https://accounts.google.com",
        "https://www.google.com",
      ],
      connectSrc: [
        "'self'",
        "https://accounts.google.com",
        "https://oauth2.googleapis.com",
        "https://www.googleapis.com",
      ],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
    },
  },
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500, message: 'Too many requests, try again later.' }));

// ── General ────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ── API Health Check ───────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🏥 Hospital Management API v3.0 — ESModules + OAuth + Email Verification',
    modules: ['auth', 'doctors', 'patients', 'appointments', 'medical-records', 'admin', 'beds', 'ambulance', 'pharmacy', 'staff', 'lab'],
    totalAPIs: 62,
  });
});

// ── Routes ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/ambulance', ambulanceRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/bloodbank', bloodBankRoutes);

// ── Serve Frontend ─────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../hospital-frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../hospital-frontend', 'dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running... please run frontend separately in dev mode.');
  });
}

// ── 404 (For APIs only, as frontend catches others) ────
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Error Handler ──────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🏥 Hospital Management Backend v3.0`);
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📦 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 Auth: JWT + Google OAuth + Email Verification\n`);
});
