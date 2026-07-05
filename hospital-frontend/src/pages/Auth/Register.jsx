import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, Stethoscope, DollarSign, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'patient', phone:'', specialization:'', qualification:'', consultationFee:'' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const set = (k,v) => setForm(f => ({...f,[k]:v}));

  const handleGoogleRegister = async (credentialResponse) => {
    try {
      setLoading(true);
      const { googleAuthAPI } = await import('../../services/api');
      const res = await googleAuthAPI({ idToken: credentialResponse.credential, role: form.role, mode: 'register' });

      if (res.data.isNewUser) {
        toast.success(`✅ ${res.data.message}`, { duration: 5000 });
        navigate('/login');
      } else {
        // Already registered — tell them to login
        toast('This email is already registered. Please login instead.', { icon: 'ℹ️', duration: 4000 });
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google registration failed');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await register(form);
      toast.success(res.message || 'Registration successful!');
      navigate('/login');
    } catch(err) { toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="floating-shapes"><div className="shape"></div><div className="shape"></div><div className="shape"></div></div>
        <div className="login-logo"><span className="login-logo-icon">🏥</span>MediCare HMS</div>
        <h1 className="login-title">Join Our<br/><span>Healthcare Network</span></h1>
        <p className="login-subtitle">Create your account to access the complete hospital management system.</p>
        <ul className="login-features">
          <li><span className="feat-icon">✅</span>Instant appointment booking</li>
          <li><span className="feat-icon">📋</span>Digital medical records</li>
          <li><span className="feat-icon">🔔</span>Real-time notifications</li>
          <li><span className="feat-icon">🔒</span>Secure & HIPAA compliant</li>
        </ul>
      </div>
      <div className="login-right">
        <div className="login-form-box">
          <div className="login-welcome-icon">👤</div>
          <h2>Create Account</h2>
          <p className="sub">Fill in your details to get started</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>I am a</label>
              <div className="input-wrap">
                <User size={16} className="icon"/>
                <select value={form.role} onChange={e => set('role',e.target.value)} style={{paddingLeft:42}}>
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="receptionist">Receptionist</option>
                </select>
              </div>
            </div>
            <div className="form-group"><label>Full Name</label><div className="input-wrap"><User size={16} className="icon"/><input placeholder="John Doe" value={form.name} onChange={e=>set('name',e.target.value)} required/></div></div>
            <div className="form-group"><label>Email</label><div className="input-wrap"><Mail size={16} className="icon"/><input type="email" placeholder="you@example.com" value={form.email} onChange={e=>set('email',e.target.value)} required/></div></div>
            <div className="form-group"><label>Phone</label><div className="input-wrap"><Phone size={16} className="icon"/><input placeholder="9876543210" value={form.phone} onChange={e=>set('phone',e.target.value)}/></div></div>
            <div className="form-group"><label>Password</label><div className="input-wrap"><Lock size={16} className="icon"/><input type={showPass?'text':'password'} placeholder="••••••••" value={form.password} onChange={e=>set('password',e.target.value)} required minLength={6}/><button type="button" className="eye-btn" onClick={()=>setShowPass(!showPass)}>{showPass?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></div>
            {form.role === 'doctor' && (<>
              <div className="form-group"><label>Specialization</label><div className="input-wrap"><Stethoscope size={16} className="icon"/><input placeholder="Cardiology" value={form.specialization} onChange={e=>set('specialization',e.target.value)} required/></div></div>
              <div className="form-group"><label>Qualification</label><div className="input-wrap"><GraduationCap size={16} className="icon"/><input placeholder="MD / MBBS" value={form.qualification} onChange={e=>set('qualification',e.target.value)} required/></div></div>
              <div className="form-group"><label>Consultation Fee (₹)</label><div className="input-wrap"><DollarSign size={16} className="icon"/><input type="number" placeholder="500" value={form.consultationFee} onChange={e=>set('consultationFee',e.target.value)} required/></div></div>
            </>)}
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Account'} <ArrowRight size={18}/></button>
          </form>
          <div className="or-divider">or register with Google</div>
          <div className="google-auth-section">
            <p style={{ fontSize: '.8rem', color: '#64748b', marginBottom: '4px' }}>
              You will be registered as <strong style={{ textTransform: 'capitalize', color: '#1e293b' }}>{form.role}</strong>
            </p>
            <GoogleLogin
              onSuccess={handleGoogleRegister}
              onError={() => toast.error('Google Registration Failed')}
              theme="filled_blue"
              shape="rectangular"
              size="large"
              text="signup_with"
              width="300"
            />
          </div>
          <p className="login-footer">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
