import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { globalStyles, getTheme } from '../theme';
import { useAuth } from '../context/AuthContext';
import API from '../api/api';
// ملاحظة: يمكنك استخدام MainNavbar إذا كان متاحاً في مجلد components
import MainNavbar from '../components/MainNavbar'; 

const Login = () => {
  const { isDark } = useTheme();
  const t = getTheme(isDark);
  const navigate = useNavigate();
  const { login } = useAuth(); // إذا كنتِ تستخدمين دالة login من AuthContext

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = e => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };
  const handleKeyDown = e => { if (e.key === 'Enter') handleSubmit(); };

  const handleSubmit = async () => {
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    try {
      // إرسال البيانات للباك إند
      const res = await API.post('/auth/login', {
        email: form.email,
        password: form.password,
      });

      // استخراج البيانات من الاستجابة
      const { access_token, role } = res.data;

      // تخزين التوكن في الجهاز
      localStorage.setItem('token', access_token);
      localStorage.setItem('role', role);

      // (اختياري) تحديث حالة الـ AuthContext إذا كنتِ تعتمدين عليها في نظامك
      if (login) {
          login({ email: form.email, role: role, name: form.email.split('@')[0] }, access_token);
      }

      // 🚀 التوجيه الذكي بناءً على نوع الحساب
      if (role === 'student') {
          navigate('/student/dashboard');
      } else if (role === 'company') {
          navigate('/company/dashboard');
      } else if (role === 'admin') {
          navigate('/admin/dashboard');
      } else {
          setError('Unknown user role.');
      }

    } catch (err) {
        if (err.response && err.response.data) {
            setError(err.response.data.detail || 'Invalid email or password.');
        } else {
            setError('Cannot connect to server.');
        }
    } finally {
      setLoading(false);
    }
  };

  const styles = `
    ${globalStyles(isDark)}
    .cl-wrap { min-height: 100vh; display: flex; }
    .cl-left { flex: 1; display: flex; align-items: center; justify-content: center; padding: 100px 60px 60px; }
    .cl-right {
      width: 440px; flex-shrink: 0; background: ${t.sidebarBg};
      border-left: 1px solid ${t.border};
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 60px 48px; gap: 28px;
    }
    .cl-box { width: 100%; max-width: 420px; }
    .cl-title { font-family: 'DM Serif Display', serif; font-size: 38px; color: ${t.textPrimary}; margin-bottom: 8px; line-height: 1.1; }
    .cl-sub  { font-size: 14px; color: ${t.textMuted}; margin-bottom: 36px; }
    .input-wrapper { position: relative; }
    .input-toggle {
      position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
      background: none; border: none; color: ${t.textMuted}; cursor: pointer;
      font-size: 13px; font-family: 'Sora', sans-serif;
    }
    .right-feature { text-align: center; }
    .right-icon {
      width: 52px; height: 52px; border-radius: 14px;
      background: rgba(43,108,176,0.15); border: 1px solid rgba(43,108,176,0.2);
      display: flex; align-items: center; justify-content: center; font-size: 22px; margin: 0 auto 12px;
    }
    .right-feature h3 { font-size: 15px; font-weight: 600; color: ${t.textPrimary}; margin-bottom: 6px; }
    .right-feature p  { font-size: 13px; color: ${t.textMuted}; line-height: 1.6; }
    .right-divider { width: 1px; height: 36px; background: ${t.border}; }
    @media (max-width: 768px) { .cl-right { display: none; } .cl-left { padding: 100px 24px 60px; } }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="ie-page">
        <div className="ie-bg" /><div className="ie-grid" />
        
        {/* شريط التنقل العلوي (يمكنك استخدام MainNavbar بدلاً من CompanyNavbar لتكون الصفحة عامة) */}
        <MainNavbar>
          <span style={{ fontSize: '13px', color: t.textMuted }}>Don't have an account?</span>
          <button className="ie-btn ie-btn-ghost" style={{ padding: '8px 18px', fontSize: '13px' }}
            onClick={() => navigate('/')}>Return Home</button>
        </MainNavbar>

        <div className="ie-content cl-wrap">
          <div className="cl-left">
            <div className="cl-box">
              <div className="ie-badge ie-animate"
                style={{ background: 'rgba(43,108,176,0.1)', borderColor: 'rgba(43,108,176,0.2)', color: '#2b6cb0' }}>
                Unified Login Portal
              </div>
              <h1 className="cl-title ie-animate-2">Welcome Back</h1>
              <p className="cl-sub ie-animate-3">
                Sign in to your Student, Company, or Admin account.
              </p>
              
              {error && <div className="ie-error ie-animate">{error}</div>}
              
              <div className="ie-animate-3">
                <div className="ie-input-group">
                  <label className="ie-label">Email Address</label>
                  <input className="ie-input" name="email" type="email" placeholder="you@example.com"
                    value={form.email} onChange={handleChange} onKeyDown={handleKeyDown} />
                </div>
                <div className="ie-input-group">
                  <label className="ie-label">Password</label>
                  <div className="input-wrapper">
                    <input className="ie-input" name="password" type={showPassword ? 'text' : 'password'}
                      placeholder="Your password" value={form.password}
                      onChange={handleChange} onKeyDown={handleKeyDown} style={{ paddingRight: '60px' }} />
                    <button className="input-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                
                <div style={{ textAlign: 'right', marginBottom: '24px', marginTop: '-8px' }}>
                  <button style={{ fontSize: '13px', color: t.accentLight, cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'Sora, sans-serif' }}
                    onClick={() => navigate('/forgot-password')}>Forgot password?</button>
                </div>
                
                <button className="ie-btn ie-btn-primary" style={{ width: '100%', background: '#2b6cb0' }}
                  onClick={handleSubmit} disabled={loading}>
                  {loading ? <><span className="ie-spinner" /> Signing in…</> : 'Sign In →'}
                </button>
                
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <span style={{ fontSize: '13px', color: t.textMuted }}>
                    By signing in you agree to our{' '}
                    <span style={{ color: t.accentLight, cursor: 'pointer' }}>Terms of Service</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="cl-right ie-content">
            {[
              { icon: '🤖', title: 'AI Matching',  desc: 'Experience intelligent CV parsing and matching.' },
              { icon: '🔒', title: 'Secure Access', desc: 'Your data is encrypted and completely secure.' },
              { icon: '📊', title: 'Smart Dashboards', desc: 'Manage everything from one unified control panel.' },
            ].map((p, i) => (
              <div key={p.title}>
                {i > 0 && <div className="right-divider" />}
                <div className={`right-feature ie-animate-${i + 1}`}>
                  <div className="right-icon">{p.icon}</div>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;