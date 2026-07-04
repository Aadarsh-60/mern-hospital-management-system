import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Stethoscope, Users, CalendarDays, FileText, BedDouble, Ambulance, Pill, UserCog, FlaskConical, Droplet, Settings, ShieldCheck, LogOut } from 'lucide-react';

const allLinks = [
  { section: 'Main', items: [
    { to: '/dashboard', icon: <LayoutDashboard size={18}/>, label: 'Dashboard', roles: ['admin','doctor','patient','receptionist','nurse'] },
  ]},
  { section: 'Management', items: [
    { to: '/doctors', icon: <Stethoscope size={18}/>, label: 'Doctors', roles: ['admin','doctor','patient','receptionist','nurse'] },
    { to: '/patients', icon: <Users size={18}/>, label: 'Patients', roles: ['admin','doctor','receptionist','nurse'] },
    { to: '/appointments', icon: <CalendarDays size={18}/>, label: 'Appointments', roles: ['admin','doctor','patient','receptionist'] },
    { to: '/medical-records', icon: <FileText size={18}/>, label: 'Medical Records', roles: ['admin','doctor','patient'] },
  ]},
  { section: 'Hospital', items: [
    { to: '/beds', icon: <BedDouble size={18}/>, label: 'Bed Management', roles: ['admin','doctor','receptionist','nurse'] },
    { to: '/ambulance', icon: <Ambulance size={18}/>, label: 'Ambulance', roles: ['admin','patient','receptionist'] },
    { to: '/pharmacy', icon: <Pill size={18}/>, label: 'Pharmacy', roles: ['admin'] },
    { to: '/staff', icon: <UserCog size={18}/>, label: 'Staff', roles: ['admin'] },
    { to: '/lab', icon: <FlaskConical size={18}/>, label: 'Lab Reports', roles: ['admin','doctor','patient'] },
    { to: '/blood-bank', icon: <Droplet size={18}/>, label: 'Blood Bank', roles: ['admin','doctor','patient','receptionist','nurse'] },
  ]},
  { section: 'System', items: [
    { to: '/users', icon: <ShieldCheck size={18}/>, label: 'User Management', roles: ['admin'] },
    { to: '/settings', icon: <Settings size={18}/>, label: 'Settings', roles: ['admin','doctor','patient','receptionist','nurse'] },
  ]},
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.3)',zIndex:99,display:'none'}}/>}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span className="logo-icon">🏥</span>
          <h1>MediCare HMS<span>Hospital Management</span></h1>
        </div>
        <nav className="sidebar-nav">
          {allLinks.map((section) => {
            const visibleItems = section.items.filter(item => item.roles.includes(user?.role));
            if (!visibleItems.length) return null;
            return (
              <div key={section.section}>
                <div className="nav-section">{section.section}</div>
                {visibleItems.map((item) => (
                  <NavLink key={item.to} to={item.to} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                    <span className="nav-icon">{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{user?.name?.charAt(0)}</div>
            <div className="sidebar-user-info">
              <div className="name">{user?.name}</div>
              <div className="role">{user?.role}</div>
            </div>
            <button className="logout-btn" onClick={logout} title="Logout"><LogOut size={18}/></button>
          </div>
        </div>
      </aside>
    </>
  );
}
