import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Menu, Search, Bell } from 'lucide-react';

const pageTitles = {
  '/dashboard': ['Dashboard', 'Welcome back! Here\'s your overview'],
  '/doctors': ['Doctors', 'Manage doctor profiles & appointments'],
  '/patients': ['Patients', 'View and manage patient records'],
  '/appointments': ['Appointments', 'Schedule and track appointments'],
  '/medical-records': ['Medical Records', 'Patient diagnosis & prescriptions'],
  '/beds': ['Bed Management', 'Real-time bed availability & admissions'],
  '/ambulance': ['Ambulance', 'Fleet management & bookings'],
  '/pharmacy': ['Pharmacy', 'Medicine inventory & dispensing'],
  '/staff': ['Staff', 'Staff management & duty roster'],
  '/lab': ['Lab Reports', 'Lab tests & report management'],
  '/users': ['User Management', 'Manage all system users'],
  '/settings': ['Settings', 'Update your profile & password'],
};

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const basePath = '/' + location.pathname.split('/')[1];
  const [title, subtitle] = pageTitles[basePath] || ['Page', ''];

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <header className="topbar">
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={22}/></button>
            <div className="topbar-left">
              <h2>{title}</h2>
              <p>{subtitle}</p>
            </div>
          </div>
          <div className="topbar-right">
            <div className="topbar-search">
              <Search size={16} color="#94a3b8"/>
              <input placeholder="Search..." />
            </div>
            <button style={{background:'none',position:'relative',color:'#64748b'}}><Bell size={20}/></button>
          </div>
        </header>
        <main className="page-content">
          <div className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
