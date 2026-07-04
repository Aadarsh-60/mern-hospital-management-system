import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updatePasswordAPI } from '../../services/api';
import { Lock, User, Mail, Phone, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfileSettings() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try { await updatePasswordAPI({ currentPassword, newPassword }); toast.success('Password updated!'); setCurrentPassword(''); setNewPassword(''); } catch(err) { toast.error(err.response?.data?.message||'Failed'); } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="profile-header">
        <div className="profile-avatar">{user?.name?.charAt(0)}</div>
        <div className="profile-info"><h2>{user?.name}</h2><p>{user?.email}</p></div>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><h3>👤 Profile Information</h3></div>
          <div className="card-body">
            <div className="detail-grid">
              <div className="detail-item"><label>Full Name</label><span>{user?.name}</span></div>
              <div className="detail-item"><label>Email</label><span>{user?.email}</span></div>
              <div className="detail-item"><label>Phone</label><span>{user?.phone || '—'}</span></div>
              <div className="detail-item"><label>Role</label><span className={`role-badge role-${user?.role}`}>{user?.role}</span></div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>🔒 Change Password</h3></div>
          <div className="card-body">
            <form onSubmit={handleChangePassword}>
              <div className="form-group"><label>Current Password</label><div className="input-wrap"><Lock size={16} className="icon"/><input type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} placeholder="Enter current password" required/></div></div>
              <div className="form-group"><label>New Password</label><div className="input-wrap"><Lock size={16} className="icon"/><input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="Enter new password" required minLength={6}/></div></div>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
