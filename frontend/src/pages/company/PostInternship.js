import { useTheme } from '../../context/ThemeContext';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { globalStyles, getTheme } from '../../theme';
import CompanyNavbar from '../../components/CompanyNavbar';
import { useActivity } from '../../context/ActivityContext';
import API from '../../api/api';

export function PostInternship() {
  const { isDark } = useTheme();
  const t = getTheme(isDark);
  const navigate = useNavigate();
  const { refreshGlobalData } = useActivity();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [company, setCompany] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    type: 'onsite',
    duration_weeks: '',
    field_of_study: '',
    required_skills: '',
    deadline: '',
    status: 'pending'
  });

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    setInitialLoading(true);
    try {
      const res = await API.get('/companies/me');
      setCompany(res.data);
      setError('');
    } catch (e) {
      console.error(e);
      setError('Connection error. Could not reach the server.');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error && !error.includes('profile')) setError('');
  };

  const validate = () => {
    if (!form.title || form.title.length < 5) return 'Title must be at least 5 characters long.';
    if (!form.description || form.description.length < 20) return 'Description must be at least 20 characters long.';
    if (!form.field_of_study) return 'Field of study is required.';
    if (!form.deadline) return 'Application deadline is required.';
    const d = new Date(form.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (d < today) return 'Deadline cannot be in the past.';
    return null;
  };

  const handleNext = () => {
    if (!company) {
      setError('Company profile not loaded. Please refresh.');
      return;
    }
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!company) {
      setError('Company profile not loaded.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await API.post('/internships/', {
        company_id: company.company_id,
        title: form.title,
        type: form.type,
        duration: `${form.duration_weeks || 0} weeks`,
        deadline: form.deadline,
        description: form.description,
        field_of_study: form.field_of_study,
        location: form.location,
        required_skills: form.required_skills,
        status: 'pending'
      });

      if (refreshGlobalData) await refreshGlobalData();
      setStep(3);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to submit internship.');
    } finally {
      setLoading(false);
    }
  };

  const styles = `
    ${globalStyles(isDark)}
    .pi-content { padding: 100px 24px 60px; display: flex; justify-content: center; min-height: 100vh; }
    .pi-box { width: 100%; max-width: 640px; }
    .steps-row { display: flex; gap: 8px; align-items: center; margin-bottom: 28px; }
    .step-dot { width: 8px; height: 8px; border-radius: 50%; background: ${isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1'}; transition: all 0.3s; }
    .step-dot.active { background: ${t.accent}; width: 24px; border-radius: 4px; }
    .step-dot.done { background: ${t.success}; }
    .step-label { font-size: 12px; color: ${t.textMuted}; margin-left: 4px; }
    .pi-card { background: ${t.bgCard}; border: 1px solid ${t.border}; border-radius: 24px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
    .pi-title { font-family: 'DM Serif Display', serif; font-size: 32px; color: ${t.textPrimary}; margin-bottom: 6px; }
    .pi-sub { font-size: 14px; color: ${t.textSecondary}; margin-bottom: 32px; }
    .pi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .pi-input-group { margin-bottom: 24px; }
    .preview-box { background: ${isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc'}; border: 1px dashed ${t.border}; border-radius: 16px; padding: 24px; margin-bottom: 24px; }
    .success-icon { width: 80px; height: 80px; border-radius: 50%; background: ${t.success}15; color: ${t.success}; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 24px; }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="ie-page">
        <div className="ie-bg" /><div className="ie-grid" />
        <CompanyNavbar>
          <button className="ie-btn ie-btn-ghost" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => navigate('/company/dashboard')}>
            Back to Dashboard
          </button>
        </CompanyNavbar>

        <div className="ie-content pi-content">
          <div className="pi-box">
            {initialLoading ? (
              <div style={{ textAlign: 'center', marginTop: '100px' }}><span className="ie-spinner" style={{ borderTopColor: t.accent }} /></div>
            ) : (
              <div className="ie-animate">
                <div className="steps-row">
                  {[1, 2, 3].map((n) => <div key={n} className={`step-dot ${step === n ? 'active' : step > n ? 'done' : ''}`} />)}
                  <span className="step-label">Step {step} of 3</span>
                </div>

                <div className="pi-card">
                  {step === 1 && (
                    <>
                      <h1 className="pi-title">Post an internship</h1>
                      <p className="pi-sub">Fill in the details for your new listing.</p>
                      {error && <div className="ie-error">{error}</div>}

                      <div className="ie-input-group">
                        <label className="ie-label">Job Title *</label>
                        <input className="ie-input" name="title" placeholder="e.g. Frontend Developer Intern" value={form.title} onChange={handleChange} />
                      </div>
                      <div className="ie-input-group">
                        <label className="ie-label">Description *</label>
                        <textarea className="ie-input" name="description" placeholder="Describe the role..." value={form.description} onChange={handleChange} style={{ minHeight: '120px' }} />
                      </div>
                      <div className="pi-grid">
                        <div className="ie-input-group">
                          <label className="ie-label">Field of Study *</label>
                          <input className="ie-input" name="field_of_study" placeholder="e.g. Computer Science" value={form.field_of_study} onChange={handleChange} />
                        </div>
                        <div className="ie-input-group">
                          <label className="ie-label">Type</label>
                          <select className="ie-input" name="type" value={form.type} onChange={handleChange}>
                            <option value="onsite">On-site</option>
                            <option value="remote">Remote</option>
                            <option value="hybrid">Hybrid</option>
                          </select>
                        </div>
                        <div className="ie-input-group">
                          <label className="ie-label">Location</label>
                          <input className="ie-input" name="location" placeholder="e.g. Amman" value={form.location} onChange={handleChange} />
                        </div>
                        <div className="ie-input-group">
                          <label className="ie-label">Duration (weeks)</label>
                          <input className="ie-input" name="duration_weeks" type="number" placeholder="e.g. 8" value={form.duration_weeks} onChange={handleChange} />
                        </div>
                        <div className="ie-input-group">
                          <label className="ie-label">Deadline</label>
                          <input className="ie-input" name="deadline" type="date" value={form.deadline} onChange={handleChange} style={{ colorScheme: isDark ? 'dark' : 'light' }} />
                        </div>
                      </div>
                      <div className="ie-input-group">
                        <label className="ie-label">Required Skills</label>
                        <input className="ie-input" name="required_skills" placeholder="React, JS, CSS..." value={form.required_skills} onChange={handleChange} />
                      </div>
                      <button className="ie-btn ie-btn-primary" style={{ width: '100%' }} onClick={handleNext}>Preview Listing</button>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <h1 className="pi-title">Review listing</h1>
                      <p className="pi-sub">Final check before sending it to Admin review.</p>
                      <div className="preview-box">
                        <h3 style={{ marginBottom: '8px' }}>{form.title}</h3>
                        <p style={{ fontSize: '14px', color: t.textSecondary, marginBottom: '16px' }}>{form.description}</p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <span className="ie-badge">{form.location || 'Remote'}</span>
                          <span className="ie-badge">{form.duration_weeks}w</span>
                          <span className="ie-badge" style={{ textTransform: 'capitalize' }}>{form.type}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="ie-btn ie-btn-ghost" style={{ flex: 1 }} onClick={() => setStep(1)}>Edit</button>
                        <button className="ie-btn ie-btn-primary" style={{ flex: 2 }} onClick={handleSubmit} disabled={loading}>
                          {loading ? <span className="ie-spinner" /> : 'Submit for Admin Review'}
                        </button>
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <div style={{ textAlign: 'center' }}>
                      <div className="success-icon">OK</div>
                      <h1 className="pi-title">Submitted for Review</h1>
                      <p className="pi-sub">Your internship has been submitted and is waiting for Admin approval.</p>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="ie-btn ie-btn-ghost" style={{ flex: 1 }} onClick={() => setStep(1)}>Post Another</button>
                        <button className="ie-btn ie-btn-primary" style={{ flex: 2 }} onClick={() => navigate('/company/internships')}>View My Listings</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default PostInternship;
