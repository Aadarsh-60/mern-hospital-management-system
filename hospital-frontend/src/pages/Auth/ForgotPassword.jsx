import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { forgotPasswordAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await forgotPasswordAPI({ email });
      toast.success(res.data.message);
      setSent(true);
    } catch(err) { toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="floating-shapes"><div className="shape"></div><div className="shape"></div><div className="shape"></div></div>
        <div className="login-logo"><span className="login-logo-icon">🏥</span>MediCare HMS</div>
        <h1 className="login-title">Reset Your<br/><span>Password</span></h1>
        <p className="login-subtitle">We'll send you a secure link to reset your password via email.</p>
      </div>
      <div className="login-right">
        <div className="login-form-box">
          <div className="login-welcome-icon">🔑</div>
          <h2>Forgot Password</h2>
          <p className="sub">Enter your email to receive a reset link</p>
          {sent ? (
            <div className="empty-state" style={{padding:20}}>
              <div className="empty-icon">📧</div>
              <h3>Check your email!</h3>
              <p>If an account exists with that email, we've sent a reset link.</p>
              <Link to="/login" className="btn btn-primary btn-sm" style={{marginTop:16,width:'auto',display:'inline-flex'}}><ArrowLeft size={16}/> Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Email Address</label><div className="input-wrap"><Mail size={16} className="icon"/><input type="email" placeholder="you@hospital.com" value={email} onChange={e=>setEmail(e.target.value)} required/></div></div>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Sending...' : 'Send Reset Link'} <ArrowRight size={18}/></button>
            </form>
          )}
          <p className="login-footer"><Link to="/login"><ArrowLeft size={14} style={{verticalAlign:'middle'}}/> Back to Login</Link></p>
        </div>
      </div>
    </div>
  );
}
