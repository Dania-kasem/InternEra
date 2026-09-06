import { useTheme } from '../../context/ThemeContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { globalStyles, getTheme } from '../../theme';
import CompanyNavbar from '../../components/CompanyNavbar';
import API from '../../api/api';
function generateOTP() {

  return Math.floor(100000 + Math.random() * 900000).toString();
}

function CompanyRegister() {
  const { isDark } = useTheme();
  const t = getTheme(isDark);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sentOTP, setSentOTP] = useState('');
  const [enteredOTP, setEnteredOTP] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    company_name: '', email: '', password: '', confirm_password: '',
    industry: '', location: '', phone_number: ''
  });

  const handleChange = e => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const industries = [
    'Technology', 'Software Development', 'IT Services', 'Finance & FinTech',
    'Healthcare & MedTech', 'E-Commerce', 'Education & EdTech', 'Media & Marketing', 'Other'
  ];

  const handleSendOTP = () => {
    if (!form.company_name || !form.email || !form.password || !form.industry) {
      setError('Please fill in all required fields.'); return;
    }
    if (form.password !== form.confirm_password) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    const otp = generateOTP();
    setSentOTP(otp);
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(2); }, 900);
  };

  const handleVerify = async () => {
    if (enteredOTP !== sentOTP) {
      setError('Incorrect code. Please try again.');
      return;
    }
    setLoading(true);

    try {
      // 1. إنشاء حساب الشركة
      await API.post('/auth/register/company', {
        email: form.email,
        password: form.password,
        company_name: form.company_name,
        industry: form.industry,
        location: form.location,
        phone_number: form.phone_number
      });

      // 2. الدخول تلقائياً
      const loginRes = await API.post('/auth/login', {
        email: form.email,
        password: form.password
      });

      login({ email: form.email, role: 'company', name: form.company_name }, loginRes.data.access_token);
      navigate('/company/dashboard');
    } catch (err) {
      setError(err.userMessage || 'Registration failed. Email might already exist.');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ show }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {show ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );

  const styles = `
    ${globalStyles(isDark)}
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Sora', sans-serif; background: #f0f4f8; }

    .cr-page {
      min-height: 100vh;
      background: ${isDark
      ? 'linear-gradient(160deg, #0a0f1e 0%, #0d1322 60%, #080d18 100%)'
      : 'linear-gradient(160deg, #e8f0f8 0%, #f0f4f8 60%, #e4ecf5 100%)'
    };
      display: flex; flex-direction: column;
    }
    .cr-nav {
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 48px;
      background: ${isDark ? 'rgba(10,15,30,0.92)' : 'rgba(240,244,248,0.92)'};
      backdrop-filter: blur(12px);
      border-bottom: 1px solid ${t.border};
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    }
    .cr-logo {
      font-family: 'DM Serif Display', serif;
      font-size: 22px; color: ${t.textPrimary}; cursor: pointer;
    }
    .cr-logo span { font-style: italic; color: ${t.accent}; }
    .cr-signin {
      background: transparent; color: ${t.textPrimary};
      padding: 8px 20px; border-radius: 8px;
      font-size: 14px; font-weight: 600; border: 1px solid #b8d0e8;
      cursor: pointer; font-family: 'Sora', sans-serif;
      transition: all 0.2s;
    }
    .cr-signin:hover { background: #1a3a5c; color: #fff; }

    .cr-wrap {
      flex: 1; display: flex; align-items: center;
      justify-content: center; padding: 100px 24px 60px;
    }
    .cr-box { width: 100%; max-width: 520px; }

    .steps-indicator { display: flex; gap: 8px; align-items: center; margin-bottom: 28px; }
    .step-dot { width: 8px; height: 8px; border-radius: 50%; background: #dde3ec; transition: all 0.3s; }
    .step-dot.active { background: #2b6cb0; width: 24px; border-radius: 4px; }
    .step-dot.done { background: #38a169; }
    .step-label { font-size: 12px; color: #7a90a8; margin-left: 4px; }

    .cr-badge {
      display: inline-block;
      background: #dcfce7; border: 1px solid #86efac;
      color: #166534; font-size: 11px; font-weight: 700;
      letter-spacing: 1.5px; text-transform: uppercase;
      padding: 5px 14px; border-radius: 100px; margin-bottom: 16px;
    }
    .cr-title {
      font-family: 'DM Serif Display', serif;
      font-size: 34px; color: ${t.textPrimary}; margin-bottom: 28px;
    }
    .cr-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    .cr-label {
      display: block; font-size: 13px; font-weight: 600;
      color: ${t.textSecondary}; margin-bottom: 8px;
    }
    .cr-input-group { margin-bottom: 18px; }
    .cr-input {
      width: 100%; padding: 13px 16px;
      background: ${t.inputBg}; border: 1px solid ${t.inputBorder};
      border-radius: 10px; color: ${t.textPrimary};
      font-family: 'Sora', sans-serif; font-size: 15px;
      outline: none; transition: border-color 0.2s;
    }
    .cr-input:focus { border-color: ${t.accent}; box-shadow: 0 0 0 3px rgba(43,108,176,0.1); }
    .cr-input::placeholder { color: #94a3b8; }

    .cr-select {
      width: 100%; padding: 13px 16px;
      background: ${t.inputBg}; border: 1px solid ${t.inputBorder};
      border-radius: 10px; color: ${t.textPrimary};
      font-family: 'Sora', sans-serif; font-size: 15px;
      outline: none; -webkit-appearance: none; cursor: pointer;
      transition: border-color 0.2s;
    }
    .cr-select:focus { border-color: ${t.accent}; }
    .cr-select option { color: ${t.textPrimary}; }

    .pass-wrap { position: relative; }
    .eye-btn {
      position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
      background: none; border: none;
      color: #cbd5e1;
      cursor: pointer; padding: 4px;
      display: flex; align-items: center; justify-content: center;
      transition: color 0.2s;
    }
    .eye-btn:hover { color: #94a3b8; }

    .cr-btn {
      width: 100%; padding: 14px; border-radius: 10px;
      font-family: 'Sora', sans-serif; font-size: 15px; font-weight: 600;
      border: none; cursor: pointer; transition: all 0.2s;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .cr-btn-primary { background: #1a3a5c; color: #fff; }
    .cr-btn-primary:hover { background: #2b6cb0; }
    .cr-btn-primary:disabled { background: #94a3b8; cursor: not-allowed; }
    .cr-btn-ghost {
      background: transparent; color: ${t.textSecondary};
      border: 1px solid #dde3ec; margin-top: 10px;
    }
    .cr-btn-ghost:hover { border-color: ${t.accent}; color: ${t.accent}; }

    .cr-error {
      background: #fef2f2; border: 1px solid #fecaca;
      color: #dc2626; font-size: 14px;
      padding: 12px 16px; border-radius: 10px; margin-bottom: 18px;
    }

    .otp-input {
      width: 100%; padding: 16px;
      background: ${t.inputBg}; border: 1px solid ${t.inputBorder};
      border-radius: 10px; color: ${t.textPrimary};
      font-family: 'Sora', sans-serif;
      font-size: 28px; font-weight: 700; letter-spacing: 14px;
      text-align: center; outline: none;
      transition: border-color 0.2s;
    }
    .otp-input:focus { border-color: ${t.accent}; box-shadow: 0 0 0 3px rgba(43,108,176,0.1); }

    .resend-btn {
      background: none; border: none; color: ${t.accent};
      font-size: 13px; cursor: pointer; font-family: 'Sora', sans-serif;
    }
    .resend-btn:hover { text-decoration: underline; }

    .success-circle {
      width: 80px; height: 80px; border-radius: 50%;
      background: #dcfce7; border: 2px solid #86efac;
      display: flex; align-items: center; justify-content: center;
      font-size: 36px; margin: 0 auto 24px; color: #166534;
    }

    @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    .fade { animation: fadeUp 0.4s ease forwards; }
    .fade-2 { animation: fadeUp 0.4s 0.08s ease both; }
    .fade-3 { animation: fadeUp 0.4s 0.16s ease both; }

    @keyframes spin { to { transform: rotate(360deg); } }
    .spinner {
      width: 18px; height: 18px; border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
      animation: spin 0.7s linear infinite;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="cr-page">
        <CompanyNavbar>
          <button className="cr-signin" onClick={() => navigate('/company/login')}>Sign In</button>
        </CompanyNavbar>

        <div className="cr-wrap">
          <div className="cr-box">

            {/* Step indicator */}
            <div className="steps-indicator fade">
              {[1, 2, 3].map(n => (
                <div key={n} className={`step-dot ${step === n ? 'active' : step > n ? 'done' : ''}`} />
              ))}
              <span className="step-label">Step {step} of 3</span>
            </div>

            {/* STEP 1 — Company info */}
            {step === 1 && (
              <>
                <div className="cr-badge fade">Company</div>
                <h1 className="cr-title fade-2">Register your company</h1>
                {error && <div className="cr-error fade">{error}</div>}

                <div className="fade-3">
                  <div className="cr-input-group">
                    <label className="cr-label">Company Name *</label>
                    <input className="cr-input" name="company_name"
                      placeholder="e.g. TechCo Jordan"
                      value={form.company_name} onChange={handleChange} />
                  </div>

                  <div className="cr-input-group">
                    <label className="cr-label">Company Email *</label>
                    <input className="cr-input" name="email" type="email"
                      placeholder="hr@company.com"
                      value={form.email} onChange={handleChange} />
                  </div>

                  <div className="cr-row">
                    <div className="cr-input-group">
                      <label className="cr-label">Industry *</label>
                      <select className="cr-select" name="industry"
                        value={form.industry} onChange={handleChange}>
                        <option value="">Select industry</option>
                        {industries.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                    <div className="cr-input-group">
                      <label className="cr-label">Location</label>
                      <input className="cr-input" name="location"
                        placeholder="Amman, Jordan"
                        value={form.location} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="cr-input-group">
                    <label className="cr-label">Phone Number</label>
                    <input className="cr-input" name="phone_number"
                      placeholder="+962 6 xxx xxxx"
                      value={form.phone_number} onChange={handleChange} />
                  </div>

                  <div className="cr-row">
                    <div className="cr-input-group">
                      <label className="cr-label">Password *</label>
                      <div className="pass-wrap">
                        <input className="cr-input" name="password"
                          type={showPass ? 'text' : 'password'}
                          placeholder="Min. 8 characters"
                          value={form.password} onChange={handleChange}
                          style={{ paddingRight: '44px' }} />
                        <button className="eye-btn" onClick={() => setShowPass(!showPass)} type="button">
                          <EyeIcon show={showPass} />
                        </button>
                      </div>
                    </div>
                    <div className="cr-input-group">
                      <label className="cr-label">Confirm Password *</label>
                      <div className="pass-wrap">
                        <input className="cr-input" name="confirm_password"
                          type={showConfirm ? 'text' : 'password'}
                          placeholder="Repeat password"
                          value={form.confirm_password} onChange={handleChange}
                          style={{ paddingRight: '44px' }} />
                        <button className="eye-btn" onClick={() => setShowConfirm(!showConfirm)} type="button">
                          <EyeIcon show={showConfirm} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button className="cr-btn cr-btn-primary" onClick={handleSendOTP} disabled={loading}>
                    {loading ? <><span className="spinner" /> Sending code...</> : 'Continue →'}
                  </button>
                </div>
              </>
            )}

            {/* STEP 2 — OTP */}
            {step === 2 && (
              <>
                <div className="cr-badge fade">Verify Email</div>
                <h1 className="cr-title fade-2">Check your inbox</h1>
                <p style={{ fontSize: '14px', color: '#7a90a8', marginBottom: '24px', textAlign: 'center' }} className="fade-3">
                  We sent a 6-digit code to{' '}
                  <strong style={{ color: '#2b6cb0' }}>{form.email}</strong>
                  <br />
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    (Dev mode: check browser console for the code)
                  </span>
                </p>
                {error && <div className="cr-error">{error}</div>}
                <div className="fade-3">
                  <input className="otp-input" maxLength={6} placeholder="······"
                    value={enteredOTP}
                    onChange={e => { setEnteredOTP(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }} />
                  <button className="cr-btn cr-btn-primary" style={{ marginTop: '20px' }}
                    onClick={handleVerify} disabled={loading}>
                    {loading ? <><span className="spinner" /> Verifying...</> : 'Verify & Create Account'}
                  </button>
                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <button className="resend-btn" onClick={() => {
                      const otp = generateOTP(); setSentOTP(otp);
                    }}>Didn't receive it? Resend code</button>
                  </div>
                  <button className="cr-btn cr-btn-ghost"
                    onClick={() => { setStep(1); setError(''); setEnteredOTP(''); }}>
                    ← Back to form
                  </button>
                </div>
              </>
            )}

            {/* STEP 3 — Success (auto-redirects, shown briefly) */}
            {step === 3 && (
              <div style={{ textAlign: 'center' }} className="fade">
                <div className="success-circle">✓</div>
                <h1 className="cr-title" style={{ textAlign: 'center' }}>
                  Welcome, {form.company_name}!
                </h1>
                <p style={{ color: '#7a90a8', fontSize: '15px', marginBottom: '8px' }}>
                  Your account has been created successfully.
                </p>
                <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '32px' }}>
                  Redirecting you to your dashboard...
                </p>
                <button className="cr-btn cr-btn-primary"
                  onClick={() => navigate('/company/dashboard')}>
                  Go to Dashboard →
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}

export default CompanyRegister;