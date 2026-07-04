import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { verifyEmailAPI } from '../../services/api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email address...');
  const hasCalled = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }

    if (hasCalled.current) return;
    hasCalled.current = true;

    const verifyToken = async () => {
      try {
        const res = await verifyEmailAPI(token);
        setStatus('success');
        setMessage(res.data?.message || 'Email verified successfully! Your account is now active.');
        setTimeout(() => {
          navigate('/login');
        }, 4000);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Email verification failed. The link may have expired or is invalid.');
      }
    };

    verifyToken();
  }, [token, navigate]);

  return (
    <div className="login-page">
      <div className="login-right" style={{ width: '100%', maxWidth: '600px', margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
        <div className="login-form-box" style={{ textAlign: 'center', padding: '40px' }}>
          
          {status === 'verifying' && (
            <div style={{ padding: '40px 0' }}>
              <Loader2 size={48} className="icon" style={{ animation: 'spin 1s linear infinite', color: '#2563eb', margin: '0 auto 20px' }} />
              <h2>Verifying Email</h2>
              <p className="sub">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div style={{ padding: '40px 0' }}>
              <CheckCircle size={56} style={{ color: '#16a34a', margin: '0 auto 20px' }} />
              <h2 style={{ color: '#16a34a' }}>Verification Complete</h2>
              <p className="sub" style={{ marginBottom: '20px' }}>{message}</p>
              <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Redirecting you to login...</p>
              <button className="btn btn-primary mt-16" onClick={() => navigate('/login')}>Go to Login Now</button>
            </div>
          )}

          {status === 'error' && (
            <div style={{ padding: '40px 0' }}>
              <XCircle size={56} style={{ color: '#dc2626', margin: '0 auto 20px' }} />
              <h2 style={{ color: '#dc2626' }}>Verification Failed</h2>
              <p className="sub" style={{ marginBottom: '20px' }}>{message}</p>
              <button className="btn btn-primary mt-16" onClick={() => navigate('/register')}>Register Again</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
