import { useTheme } from '../../context/ThemeContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { globalStyles, getTheme } from '../../theme';
import StudentNavbar from '../../components/StudentNavbar';
import API from '../../api/api';
function generateOTP() {

  return Math.floor(100000 + Math.random() * 900000).toString();
}

function StudentRegister() {
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
    full_name: '', email: '', password: '', confirm_password: '',
    major: '', phone: ''
  });

  const handleChange = e => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const handleSendOTP = () => {
    if (!form.full_name || !form.email || !form.password || !form.major) {
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
      // 1. إنشاء الحساب
      await API.post('/auth/register/student', {
        email: form.email,
        password: form.password,
        full_name: form.full_name,
        major: form.major,
        phone_number: form.phone // تم ربطها كما يتوقع الباك إند
      });

      // 2. تسجيل الدخول تلقائياً بعد نجاح الإنشاء
      const loginRes = await API.post('/auth/login', {
        email: form.email,
        password: form.password
      });

      login({ email: form.email, role: 'student', name: form.full_name }, loginRes.data.access_token);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.userMessage || 'Registration failed. Email might already exist.');
      setStep(1); // إرجاع المستخدم للخطوة الأولى في حال وجود خطأ
    } finally {
      setLoading(false);
    }
  };

  const getStrength = (pw) => {
    if (!pw) return { width: '0%', color: 'transparent', label: '' };
    if (pw.length < 6) return { width: '25%', color: '#ef4444', label: 'Weak' };
    if (pw.length < 8) return { width: '50%', color: '#f59e0b', label: 'Fair' };
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) return { width: '100%', color: '#22c55e', label: 'Strong' };
    return { width: '75%', color: '#3b82f6', label: 'Good' };
  };
  const strength = getStrength(form.password);

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

    .sr-page {
      min-height: 100vh;
      background: ${isDark
      ? 'linear-gradient(160deg, #0a0f1e 0%, #0d1322 60%, #080d18 100%)'
      : 'linear-gradient(160deg, #e8f0f8 0%, #f0f4f8 60%, #e4ecf5 100%)'
    };
      display: flex; flex-direction: column;
    }
    .sr-nav {
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 48px;
      background: ${isDark ? 'rgba(10,15,30,0.92)' : 'rgba(240,244,248,0.92)'};
      backdrop-filter: blur(12px);
      border-bottom: 1px solid ${t.border};
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    }
    .sr-logo {
      font-family: 'DM Serif Display', serif;
      font-size: 22px; color: ${t.textPrimary}; cursor: pointer;
    }
    .sr-logo span { font-style: italic; color: ${t.accent}; }
    .sr-signin {
      background: transparent; color: ${t.textPrimary};
      padding: 8px 20px; border-radius: 8px;
      font-size: 14px; font-weight: 600; border: 1px solid #b8d0e8;
      cursor: pointer; font-family: 'Sora', sans-serif; transition: all 0.2s;
    }
    .sr-signin:hover { background: #1a3a5c; color: #fff; }

    .sr-wrap {
      flex: 1; display: flex; align-items: center;
      justify-content: center; padding: 100px 24px 60px;
    }
    .sr-box { width: 100%; max-width: 480px; }

    .steps-indicator { display: flex; gap: 8px; align-items: center; margin-bottom: 28px; }
    .step-dot { width: 8px; height: 8px; border-radius: 50%; background: #dde3ec; transition: all 0.3s; }
    .step-dot.active { background: #2b6cb0; width: 24px; border-radius: 4px; }
    .step-dot.done { background: #22c55e; }
    .step-label { font-size: 12px; color: #7a90a8; margin-left: 4px; }

    .sr-badge {
      display: inline-block;
      background: #dbeafe; border: 1px solid #93c5fd;
      color: #1d4ed8; font-size: 11px; font-weight: 700;
      letter-spacing: 1.5px; text-transform: uppercase;
      padding: 5px 14px; border-radius: 100px; margin-bottom: 16px;
    }
    .sr-title {
      font-family: 'DM Serif Display', serif;
      font-size: 34px; color: ${t.textPrimary}; margin-bottom: 28px;
    }
    .sr-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    .sr-label { display: block; font-size: 13px; font-weight: 600; color: ${t.textSecondary}; margin-bottom: 8px; }
    .sr-input-group { margin-bottom: 18px; }
    .sr-input {
      width: 100%; padding: 13px 16px;
      background: ${t.inputBg}; border: 1px solid ${t.inputBorder};
      border-radius: 10px; color: ${t.textPrimary};
      font-family: 'Sora', sans-serif; font-size: 15px;
      outline: none; transition: border-color 0.2s;
    }
    .sr-input:focus { border-color: ${t.accent}; box-shadow: 0 0 0 3px rgba(43,108,176,0.1); }
    .sr-input::placeholder { color: #94a3b8; }

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

    .strength-bar-wrap { height: 4px; background: #e2e8f0; border-radius: 2px; margin-top: 6px; overflow: hidden; }
    .strength-bar { height: 100%; border-radius: 2px; transition: width 0.3s, background 0.3s; }
    .strength-label { font-size: 11px; margin-top: 4px; }

    .sr-btn {
      width: 100%; padding: 14px; border-radius: 10px;
      font-family: 'Sora', sans-serif; font-size: 15px; font-weight: 600;
      border: none; cursor: pointer; transition: all 0.2s;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .sr-btn-primary { background: #1a3a5c; color: #fff; }
    .sr-btn-primary:hover { background: #2b6cb0; }
    .sr-btn-primary:disabled { background: #94a3b8; cursor: not-allowed; }
    .sr-btn-ghost { background: transparent; color: ${t.textSecondary}; border: 1px solid #dde3ec; margin-top: 10px; }
    .sr-btn-ghost:hover { border-color: ${t.accent}; color: ${t.accent}; }

    .sr-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; font-size: 14px; padding: 12px 16px; border-radius: 10px; margin-bottom: 18px; }

    .otp-input {
      width: 100%; padding: 16px;
      background: ${t.inputBg}; border: 1px solid ${t.inputBorder};
      border-radius: 10px; color: ${t.textPrimary};
      font-family: 'Sora', sans-serif;
      font-size: 28px; font-weight: 700; letter-spacing: 14px;
      text-align: center; outline: none; transition: border-color 0.2s;
    }
    .otp-input:focus { border-color: ${t.accent}; box-shadow: 0 0 0 3px rgba(43,108,176,0.1); }

    .resend-btn { background: none; border: none; color: ${t.accent}; font-size: 13px; cursor: pointer; font-family: 'Sora', sans-serif; }
    .resend-btn:hover { text-decoration: underline; }

    .success-circle {
      width: 80px; height: 80px; border-radius: 50%;
      background: #dbeafe; border: 2px solid #93c5fd;
      display: flex; align-items: center; justify-content: center;
      font-size: 36px; margin: 0 auto 24px; color: #1d4ed8;
    }

    @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    .fade { animation: fadeUp 0.4s ease forwards; }
    .fade-2 { animation: fadeUp 0.4s 0.08s ease both; }
    .fade-3 { animation: fadeUp 0.4s 0.16s ease both; }

    @keyframes spin { to { transform: rotate(360deg); } }
    .spinner { width: 18px; height: 18px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; animation: spin 0.7s linear infinite; }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="sr-page">
        <StudentNavbar>
          <button className="sr-signin" onClick={() => navigate('/student/login')}>Sign In</button>
        </StudentNavbar>

        <div className="sr-wrap">
          <div className="sr-box">

            <div className="steps-indicator fade">
              {[1, 2, 3].map(n => (
                <div key={n} className={`step-dot ${step === n ? 'active' : step > n ? 'done' : ''}`} />
              ))}
              <span className="step-label">Step {step} of 3</span>
            </div>

            {/* STEP 1 */}
            {step === 1 && (
              <>
                <div className="sr-badge fade">Student</div>
                <h1 className="sr-title fade-2">Create your account</h1>
                {error && <div className="sr-error fade">{error}</div>}
                <div className="fade-3">
                  <div className="sr-row">
                    <div className="sr-input-group">
                      <label className="sr-label">Full Name *</label>
                      <input className="sr-input" name="full_name" placeholder="Sara Ahmad"
                        value={form.full_name} onChange={handleChange} />
                    </div>
                    <div className="sr-input-group">
                      <label className="sr-label">Major *</label>
                      <input className="sr-input" name="major" placeholder="Information Systems"
                        value={form.major} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="sr-input-group">
                    <label className="sr-label">Email Address *</label>
                    <input className="sr-input" name="email" type="email" placeholder="sara@example.com"
                      value={form.email} onChange={handleChange} />
                  </div>
                  <div className="sr-input-group">
                    <label className="sr-label">Phone Number</label>
                    <input className="sr-input" name="phone" placeholder="+962 7x xxx xxxx"
                      value={form.phone} onChange={handleChange} />
                  </div>
                  <div className="sr-input-group">
                    <label className="sr-label">Password *</label>
                    <div className="pass-wrap">
                      <input className="sr-input" name="password"
                        type={showPass ? 'text' : 'password'}
                        placeholder="Min. 8 characters"
                        value={form.password} onChange={handleChange}
                        style={{ paddingRight: '44px' }} />
                      <button className="eye-btn" onClick={() => setShowPass(!showPass)} type="button">
                        <EyeIcon show={showPass} />
                      </button>
                    </div>
                    <div className="strength-bar-wrap">
                      <div className="strength-bar" style={{ width: strength.width, background: strength.color }} />
                    </div>
                    {form.password && <div className="strength-label" style={{ color: strength.color }}>{strength.label}</div>}
                  </div>
                  <div className="sr-input-group">
                    <label className="sr-label">Confirm Password *</label>
                    <div className="pass-wrap">
                      <input className="sr-input" name="confirm_password"
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Repeat your password"
                        value={form.confirm_password} onChange={handleChange}
                        style={{ paddingRight: '44px' }} />
                      <button className="eye-btn" onClick={() => setShowConfirm(!showConfirm)} type="button">
                        <EyeIcon show={showConfirm} />
                      </button>
                    </div>
                  </div>
                  <button className="sr-btn sr-btn-primary" onClick={handleSendOTP} disabled={loading}>
                    {loading ? <><span className="spinner" /> Sending code...</> : 'Continue →'}
                  </button>
                  <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#7a90a8' }}>
                    Already have an account?{' '}
                    <span style={{ color: '#2b6cb0', cursor: 'pointer', fontWeight: '600' }}
                      onClick={() => navigate('/student/login')}>Sign in</span>
                  </p>
                </div>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <div className="sr-badge fade">Verify Email</div>
                <h1 className="sr-title fade-2">Check your inbox</h1>
                <p style={{ fontSize: '14px', color: '#7a90a8', marginBottom: '24px', textAlign: 'center' }} className="fade-3">
                  We sent a 6-digit code to <strong style={{ color: '#2b6cb0' }}>{form.email}</strong>
                  <br /><span style={{ fontSize: '11px', color: '#94a3b8' }}>(Dev mode: check browser console)</span>
                </p>
                {error && <div className="sr-error">{error}</div>}
                <div className="fade-3">
                  <input className="otp-input" maxLength={6} placeholder="······"
                    value={enteredOTP}
                    onChange={e => { setEnteredOTP(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }} />
                  <button className="sr-btn sr-btn-primary" style={{ marginTop: '20px' }}
                    onClick={handleVerify} disabled={loading}>
                    {loading ? <><span className="spinner" /> Verifying...</> : 'Verify & Create Account'}
                  </button>
                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <button className="resend-btn" onClick={() => {
                      const otp = generateOTP(); setSentOTP(otp);
                    }}>Didn't receive it? Resend code</button>
                  </div>
                  <button className="sr-btn sr-btn-ghost"
                    onClick={() => { setStep(1); setError(''); setEnteredOTP(''); }}>
                    ← Back to form
                  </button>
                </div>
              </>
            )}

            {/* STEP 3 — brief success before redirect */}
            {step === 3 && (
              <div style={{ textAlign: 'center' }} className="fade">
                <div className="success-circle">✓</div>
                <h1 className="sr-title" style={{ textAlign: 'center' }}>
                  Welcome, {form.full_name.split(' ')[0]}!
                </h1>
                <p style={{ color: '#7a90a8', fontSize: '15px', marginBottom: '8px' }}>
                  Your account has been created successfully.
                </p>
                <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '32px' }}>
                  Redirecting you to your dashboard...
                </p>
                <button className="sr-btn sr-btn-primary"
                  onClick={() => navigate('/student/dashboard')}>
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

export default StudentRegister;