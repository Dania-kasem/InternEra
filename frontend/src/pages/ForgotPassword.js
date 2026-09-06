import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { globalStyles, getTheme } from '../theme';

const validateEmail = (email) => {
  const value = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) && value.length <= 254;
};

const validatePhone = (phone) => {
  const value = phone.trim();
  const allowedCharacters = /^\+?[0-9\s()-]+$/.test(value);
  const digitsOnly = value.replace(/\D/g, '');

  return allowedCharacters && digitsOnly.length >= 8 && digitsOnly.length <= 15;
};

function ForgotPassword() {
  const { isDark } = useTheme();
  const t = getTheme(isDark);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const handleSubmit = async () => {
    const email = form.email.trim();
    const phone = form.phone.trim();

    if (!email || !phone) {
      setError('Please fill in all fields.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!validatePhone(phone)) {
      setError('Please enter a valid phone number using 8 to 15 digits.');
      return;
    }

    setForm({ email, phone });
    setLoading(true);
    // Simulate sending to admin
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  const styles = `
    ${globalStyles(isDark)}
    .forgot-wrap {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      padding: 60px 24px;
    }
    .forgot-box {
      width: 100%; max-width: 480px;
      background: ${t.sidebarBg};
      border: 1px solid ${t.border};
      border-radius: 24px;
      padding: 48px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }
    .forgot-title {
      font-family: 'DM Serif Display', serif;
      font-size: 32px; color: ${t.textPrimary}; margin-bottom: 12px; text-align: center;
    }
    .forgot-sub {
      font-size: 14px; color: ${t.textMuted}; text-align: center; margin-bottom: 32px;
      line-height: 1.6;
    }
    .success-box {
      text-align: center;
    }
    .success-icon {
      width: 64px; height: 64px; border-radius: 50%;
      background: rgba(72, 187, 120, 0.1);
      color: #48bb78;
      display: flex; align-items: center; justify-content: center;
      font-size: 32px; margin: 0 auto 24px;
    }
    .back-btn {
      background: none; border: none; color: ${t.accentLight}; cursor: pointer;
      font-family: 'Sora', sans-serif; font-size: 14px; margin-top: 24px;
    }
    .back-btn:hover { text-decoration: underline; }
    .logo-container {
      display: flex; justify-content: center; margin-bottom: 32px;
    }
    .logo-img {
      height: 100px; width: auto;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="ie-page">
        <div className="ie-bg" /><div className="ie-grid" />
        <div className="forgot-wrap">
          <div className="forgot-box ie-animate">
            <div className="logo-container">
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '42px' }}>
                <span style={{ color: t.intern || '#1a2e42', fontWeight: 700 }}>Intern</span>
                <span style={{ color: t.era || '#2b6cb0', fontStyle: 'italic' }}>Era</span>
              </div>
            </div>

            {!success ? (
              <>
                <h1 className="forgot-title">Forgot Password?</h1>
                <p className="forgot-sub">
                  Enter your email and phone number. Our admin will verify your details and send you a password reset link.
                </p>

                {error && <div className="ie-error" style={{ marginBottom: '24px' }}>{error}</div>}

                <div className="ie-input-group">
                  <label className="ie-label">Email Address</label>
                  <input
                    className="ie-input"
                    name="email"
                    type="email"
                    placeholder="sara@example.com"
                    autoComplete="email"
                    maxLength={254}
                    value={form.email}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                  />
                </div>

                <div className="ie-input-group">
                  <label className="ie-label">Phone Number</label>
                  <input
                    className="ie-input"
                    name="phone"
                    type="tel"
                    placeholder="+962 7X XXX XXXX"
                    autoComplete="tel"
                    maxLength={20}
                    value={form.phone}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                  />
                </div>

                <button
                  className="ie-btn ie-btn-primary"
                  style={{ width: '100%', marginTop: '8px' }}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? <><span className="ie-spinner" /> Submitting...</> : 'Send Request'}
                </button>

                <div style={{ textAlign: 'center' }}>
                  <button className="back-btn" onClick={() => navigate(-1)}>
                    ← Back to Login
                  </button>
                </div>
              </>
            ) : (
              <div className="success-box ie-animate">
                <div className="success-icon">✓</div>
                <h2 className="forgot-title">Request Sent!</h2>
                <p className="forgot-sub">
                  We've received your request. An admin will contact you via email or phone with your password reset instructions shortly.
                </p>
                <button
                  className="ie-btn ie-btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => navigate('/')}
                >
                  Back to Home
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;
