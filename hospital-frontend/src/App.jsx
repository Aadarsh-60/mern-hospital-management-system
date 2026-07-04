import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/Layout/DashboardLayout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import VerifyEmail from './pages/Auth/VerifyEmail';
import Dashboard from './pages/Dashboard/Dashboard';
import DoctorList from './pages/Doctors/DoctorList';
import DoctorDetail from './pages/Doctors/DoctorDetail';
import PatientList from './pages/Patients/PatientList';
import PatientProfile from './pages/Patients/PatientProfile';
import AppointmentList from './pages/Appointments/AppointmentList';
import MedicalRecords from './pages/MedicalRecords/MedicalRecords';
import BedManagement from './pages/Beds/BedManagement';
import AmbulanceModule from './pages/Ambulance/AmbulanceModule';
import PharmacyModule from './pages/Pharmacy/PharmacyModule';
import StaffModule from './pages/Staff/StaffModule';
import LabModule from './pages/Lab/LabModule';
import UserManagement from './pages/Admin/UserManagement';
import ProfileSettings from './pages/Settings/ProfileSettings';
import BloodBank from './pages/BloodBank/BloodBank';

import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '278744247180-805f7c4q0ugpmj0pemvnbak6ebua0q2q.apps.googleusercontent.com';
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <BrowserRouter>
        <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '10px', background: '#1e293b', color: '#fff', fontSize: '.875rem' } }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="doctors" element={<DoctorList />} />
            <Route path="doctors/:id" element={<DoctorDetail />} />
            <Route path="patients" element={<ProtectedRoute roles={['admin','doctor','receptionist','nurse']}><PatientList /></ProtectedRoute>} />
            <Route path="patient-profile" element={<ProtectedRoute roles={['patient']}><PatientProfile /></ProtectedRoute>} />
            <Route path="appointments" element={<AppointmentList />} />
            <Route path="medical-records" element={<MedicalRecords />} />
            <Route path="beds" element={<ProtectedRoute roles={['admin','doctor','receptionist','nurse']}><BedManagement /></ProtectedRoute>} />
            <Route path="ambulance" element={<ProtectedRoute roles={['admin','patient','receptionist']}><AmbulanceModule /></ProtectedRoute>} />
            <Route path="pharmacy" element={<ProtectedRoute roles={['admin']}><PharmacyModule /></ProtectedRoute>} />
            <Route path="staff" element={<ProtectedRoute roles={['admin','receptionist']}><StaffModule /></ProtectedRoute>} />
            <Route path="lab" element={<ProtectedRoute roles={['admin','doctor','lab-technician']}><LabModule /></ProtectedRoute>} />
            <Route path="blood-bank" element={<BloodBank />} />
            <Route path="users" element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>} />
            <Route path="settings" element={<ProfileSettings />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
