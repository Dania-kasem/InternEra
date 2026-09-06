import { useTheme } from '../../context/ThemeContext';
import CompanyNavbar from '../../components/CompanyNavbar';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { globalStyles, getTheme } from '../../theme';
import API from '../../api/api';

export function CompanyProfile() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [companyId, setCompanyId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [profile, setProfile] = useState({
    company_name: '',
    industry: 'Technology',
    location: '',
    website: '',
    phone_number: '',
    description: '',
    founded: '',
    size: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await API.get('/companies/me');
        const c = res?.data || {};
        setCompanyId(c.company_id || null);
        setProfile((prev) => ({
          ...prev,
          company_name: c.company_name || '',
          location: c.location || '',
          phone_number: c.phone_number || ''
        }));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSave = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      await API.put(`/companies/${companyId}`, null, {
        params: {
          company_name: profile.company_name,
          location: profile.location,
          phone_number: profile.phone_number
        }
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setNotice({ type: 'success', message: 'Company profile saved successfully.' });
      setTimeout(() => setNotice(null), 3600);
    } catch (err) {
      console.error(err);
      setNotice({ type: 'error', message: err?.response?.data?.detail || 'Failed to save company profile.' });
      setTimeout(() => setNotice(null), 3600);
    } finally {
      setLoading(false);
    }
  };

  const sizes = ['1-10', '11-50', '51-200', '201-500', '500+'];
  const t = getTheme(isDark);

  const styles = `
    ${globalStyles(isDark)}
    .cp-page { padding: 100px 48px 80px; max-width: 900px; margin: 0 auto; }
    .cp-header { display: flex; align-items: center; gap: 24px; margin-bottom: 40px; }
    .cp-avatar {
      width: 80px; height: 80px; border-radius: 20px;
      background: rgba(39,103,73,0.2); border: 1px solid rgba(72,187,120,0.2);
      display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700;
    }
    .cp-title { font-family: 'DM Serif Display', serif; font-size: 32px; color: ${t.textPrimary}; margin-bottom: 4px; }
    .cp-sub { font-size: 14px; color: ${t.textMuted}; }
    .cp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .cp-section { background: ${t.bgCard}; border: 1px solid ${t.border}; border-radius: 16px; padding: 28px; }
    .section-heading {
      font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
      color: ${t.textMuted}; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid ${t.border};
    }
    .ie-select {
      width: 100%; padding: 13px 16px; background: ${t.inputBg};
      border: 1px solid ${t.inputBorder}; border-radius: 10px;
      color: ${t.textPrimary}; font-family: 'Sora', sans-serif; font-size: 15px; outline: none;
    }
    .ie-select:focus { border-color: ${t.accent}; }
    .ie-select option { background: ${isDark ? '#1a202c' : '#ffffff'}; color: ${t.textPrimary}; }
    .save-bar {
      position: fixed; bottom: 0; left: 0; right: 0;
      background: ${isDark ? 'rgba(10,15,30,0.95)' : 'rgba(255,255,255,0.95)'};
      backdrop-filter: blur(12px); border-top: 1px solid ${t.border};
      padding: 16px 48px; display: flex; justify-content: flex-end; align-items: center; gap: 16px; z-index: 50;
    }
    .site-notice {
      position: fixed; top: 86px; right: 48px; z-index: 200;
      max-width: min(420px, calc(100vw - 32px)); padding: 14px 16px; border-radius: 12px;
      background: ${isDark ? 'rgba(10,15,30,0.96)' : '#ffffff'};
      border: 1px solid ${t.borderHover}; box-shadow: 0 18px 44px rgba(0,0,0,0.22);
      color: ${t.textPrimary}; font-size: 14px; line-height: 1.5;
    }
    .site-notice.success { border-color: rgba(72,187,120,0.45); }
    .site-notice.error { border-color: rgba(252,129,129,0.45); }
    .site-notice-title { font-size: 12px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 4px; color: ${t.accentLight}; }
    .site-notice.error .site-notice-title { color: #fc8181; }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="ie-page">
        <div className="ie-bg" /><div className="ie-grid" />
        {notice && (
          <div className={`site-notice ${notice.type}`}>
            <div className="site-notice-title">{notice.type === 'error' ? 'Action needed' : 'InternEra'}</div>
            <div>{notice.message}</div>
          </div>
        )}
        <CompanyNavbar>
          <button className="ie-btn ie-btn-ghost" style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => navigate('/company/dashboard')}>Back to Dashboard</button>
        </CompanyNavbar>
        <div className="ie-content cp-page">
          <div className="cp-header ie-animate">
            <div className="cp-avatar">CO</div>
            <div>
              <h1 className="cp-title">{profile.company_name || 'Company Profile'}</h1>
              <p className="cp-sub">{profile.industry} | {profile.location || 'No location set'}</p>
            </div>
          </div>
          <div className="cp-grid ie-animate-2">
            <div className="cp-section">
              <div className="section-heading">Company Details</div>
              <div className="ie-input-group">
                <label className="ie-label">Company Name</label>
                <input className="ie-input" name="company_name" value={profile.company_name} onChange={handleChange} />
              </div>
              <div className="ie-input-group">
                <label className="ie-label">Industry</label>
                <input className="ie-input" name="industry" value={profile.industry} onChange={handleChange} />
              </div>
              <div className="ie-input-group">
                <label className="ie-label">Location</label>
                <input className="ie-input" name="location" value={profile.location} onChange={handleChange} />
              </div>
              <div className="ie-input-group">
                <label className="ie-label">Company Size</label>
                <select className="ie-select" name="size" value={profile.size} onChange={handleChange}>
                  <option value="">Select size</option>
                  {sizes.map((s) => <option key={s} value={s}>{s} employees</option>)}
                </select>
              </div>
            </div>
            <div className="cp-section">
              <div className="section-heading">Contact & Online</div>
              <div className="ie-input-group">
                <label className="ie-label">Website</label>
                <input className="ie-input" name="website" value={profile.website} onChange={handleChange} placeholder="https://yourcompany.com" />
              </div>
              <div className="ie-input-group">
                <label className="ie-label">Phone Number</label>
                <input className="ie-input" name="phone_number" value={profile.phone_number} onChange={handleChange} placeholder="+962 6 xxx xxxx" />
              </div>
              <div className="ie-input-group">
                <label className="ie-label">Founded Year</label>
                <input className="ie-input" name="founded" value={profile.founded} onChange={handleChange} placeholder="e.g. 2015" />
              </div>
            </div>
            <div className="cp-section" style={{ gridColumn: '1 / -1' }}>
              <div className="section-heading">About the Company</div>
              <textarea className="ie-input" name="description" value={profile.description} onChange={handleChange}
                rows={5} placeholder="Describe your company and what makes it a great place to intern..."
                style={{ resize: 'vertical', lineHeight: '1.7' }} />
            </div>
          </div>
        </div>
        <div className="save-bar ie-content">
          {saved && <span style={{ color: '#48bb78', fontSize: '13px' }}>Saved</span>}
          <button className="ie-btn ie-btn-ghost" onClick={() => navigate('/company/dashboard')}>Cancel</button>
          <button className="ie-btn ie-btn-primary" style={{ background: '#276749' }} onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </>
  );
}

export default CompanyProfile;
