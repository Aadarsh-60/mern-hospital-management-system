import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

const demoCredentials = {
  admin: { email: 'admin@hospital.com', password: 'admin123' },
  doctor: { email: 'rahul@hospital.com', password: 'doctor123' },
  patient: { email: 'avinash@test.com', password: 'patient123' },
  receptionist: { email: 'meena@hospital.com', password: 'recep123' },
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const { login, setAuthData } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const { googleAuthAPI } = await import('../../services/api');
      const res = await googleAuthAPI({ idToken: credentialResponse.credential, role: 'patient' });
      toast.success('Google Login successful!');
      setAuthData(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google Login failed');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowResend(false);
    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
      if (msg.toLowerCase().includes('verify')) {
        setShowResend(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      const { resendVerificationAPI } = await import('../../services/api');
      await resendVerificationAPI({ email });
      toast.success('Verification email resent! Check your inbox.');
      setShowResend(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend email');
    }
  };

  const handleDemo = (role) => {
    setEmail(demoCredentials[role].email);
    setPassword(demoCredentials[role].password);
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="floating-shapes">
          <div className="shape"></div>
          <div className="shape"></div>
          <div className="shape"></div>
        </div>
        <div className="login-logo">
          <span className="login-logo-icon">🏥</span>
          MediCare HMS
        </div>
        <h1 className="login-title">
          Hospital<br /><span>Management System</span>
        </h1>
        <p className="login-subtitle">
          Streamlining patient care, appointments, beds, and lab — all in one place.
        </p>
        <ul className="login-features">
          <li><span className="feat-icon">👨‍⚕️</span>Doctor & Patient Management</li>
          <li><span className="feat-icon">📅</span>Appointment Booking System</li>
          <li><span className="feat-icon">🛏️</span>Real-time Bed Availability</li>
          <li><span className="feat-icon">🚑</span>Ambulance Tracking</li>
          <li><span className="feat-icon">💊</span>Pharmacy Inventory</li>
          <li><span className="feat-icon">🧪</span>Lab Reports & Results</li>
        </ul>
      </div>

      <div className="login-right">
        <div className="login-form-box">
          <div className="login-welcome-icon">🔐</div>
          <h2>Welcome Back</h2>
          <p className="sub">Sign in to your account</p>

          <div className="quick-demo">
            <p>Quick Demo Login:</p>
            <div className="quick-demo-btns">
              <button className="demo-btn admin" onClick={() => handleDemo('admin')}>Admin</button>
              <button className="demo-btn doctor" onClick={() => handleDemo('doctor')}>Doctor</button>
              <button className="demo-btn patient" onClick={() => handleDemo('patient')}>Patient</button>
              <button className="demo-btn receptionist" onClick={() => handleDemo('receptionist')}>Receptionist</button>
            </div>
          </div>
          <div className="or-divider">or enter manually</div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrap">
                <Mail size={16} className="icon" />
                <input type="email" placeholder="you@hospital.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="input-wrap">
                <Lock size={16} className="icon" />
                <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="forgot-link">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={18} />
            </button>
            {showResend && (
              <button type="button" className="btn mt-16" onClick={handleResend} style={{ width: '100%', background: '#f1f5f9', color: '#1e293b', border: '1px solid #cbd5e1', marginTop: '10px' }}>
                ✉️ Resend Verification Email
              </button>
            )}
          </form>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', width: '100%' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google Login Failed')}
              theme="filled_blue"
              shape="rectangular"
              size="large"
              text="continue_with_google"
              width="300px"
            />
          </div>
          <p className="login-footer">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
