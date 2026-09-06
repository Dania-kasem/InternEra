import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { globalStyles, getTheme } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import StudentNavbar from '../../components/StudentNavbar';
import API from '../../api/api';

const normalizeSkills = (text = '') =>
  String(text)
    .split(/[,\n]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

const overlapScore = (cvText, internshipText) => {
  const cv = new Set(normalizeSkills(cvText));
  const req = normalizeSkills(internshipText);
  if (!cv.size || !req.length) return 0;
  const matched = req.filter((s) => cv.has(s)).length;
  return Math.round((matched / req.length) * 100);
};

export function ApplyPage() {
  const { isDark } = useTheme();
  const t = getTheme(isDark);

  const navigate = useNavigate();
  const { id } = useParams();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    motivation: '', skills: '', availability: '', workType: '', comments: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [internship, setInternship] = useState(null);
  const [internshipLoading, setInternshipLoading] = useState(true);
  const [matchScore, setMatchScore] = useState(0);
  const [eligibility, setEligibility] = useState(null);
  useEffect(() => {
    const fetchInternshipAndMatch = async () => {
      try {
        const res = await API.get(`/internships/${id}`);
        if (res.data) {
          const data = res.data;
          setInternship({ ...data, company: data.company || `Company #${data.company_id}` });
          try {
            const er = await API.get(`/applications/my/eligibility/${id}`);
            setEligibility(er?.data || null);
          } catch {
            setEligibility(null);
          }

          // 1) Prefer backend persisted score so pages stay consistent.
          try {
            const appsRes = await API.get('/applications/my');
            const apps = Array.isArray(appsRes?.data) ? appsRes.data : [];
            const myApp = apps.find((a) => String(a.internship_id) === String(id));
            const backendScore = myApp?.ai_match_score;
            if (backendScore !== null && backendScore !== undefined && backendScore !== '') {
              const parsed = Math.round(Number(backendScore) || 0);
              if (parsed > 0) {
                setMatchScore(parsed);
                return;
              }
            }
          } catch {}

          // 1.5) Report endpoint fallback for enriched score mapping.
          try {
            const reportRes = await API.get('/reports/my-student-report');
            const rows = reportRes?.data?.applied_internships || [];
            const row = rows.find((r) => String(r.internship_id) === String(id));
            const reportScore = row?.ai_match_score;
            if (reportScore !== null && reportScore !== undefined && reportScore !== '') {
              const parsed = Math.round(Number(reportScore) || 0);
              if (parsed > 0) {
                setMatchScore(parsed);
                return;
              }
            }
          } catch {}

          let cvSkills = '';
          try {
            const me = await API.get('/students/me/profile');
            cvSkills = me?.data?.skills || '';
          } catch {
            cvSkills = '';
          }

          if (cvSkills && data.required_skills) {
            const matchRes = await API.post('/ai/match', {
              cv_text: cvSkills,
              internship_text: `Title: ${data.title}, Description: ${data.description}, Skills: ${data.required_skills}`
            });
            if (matchRes.data) {
              const rawScore = matchRes?.data?.result?.match_score ?? matchRes?.data?.match_score ?? 0;
              const scoreStr = String(rawScore).replace('%', '');
              const parsed = parseInt(scoreStr, 10);
              if (Number.isFinite(parsed) && parsed > 0) {
                setMatchScore(parsed);
              } else {
                setMatchScore(overlapScore(cvSkills, data.required_skills));
              }
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setInternshipLoading(false);
      }
    };
    fetchInternshipAndMatch();
  }, [id]);

  if (internshipLoading) {
    return (
      <div className="ie-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: t.textPrimary }}>Loading internship details...</div>
      </div>
    );
  }

  if (!internship && !internshipLoading) {
    return (
      <div className="ie-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: t.textPrimary }}>Internship not found</h2>
          <button className="ie-btn ie-btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate('/student/search')}>Back to Search</button>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (eligibility && eligibility.application_status === 'rejected') {
      setError('This internship rejected your previous application. Improve the listed skills before applying elsewhere.');
      return;
    }
    if (!answers.motivation.trim() || !answers.skills.trim() || !answers.availability || !answers.workType) {
      setError('Please fill in all mandatory fields.'); return;
    }
    setError('');
    setStep(2);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await API.post('/applications/', {
        internship_id: parseInt(id, 10)
      });
      setStep(3);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || 'An error occurred');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const styles = `
    ${globalStyles(isDark)}
    .apply-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 100px 24px 60px; }
    .apply-box { width: 100%; max-width: 560px; }
    .apply-title { font-family: 'DM Serif Display', serif; font-size: 32px; color: ${t.textPrimary}; margin-bottom: 8px; }
    .apply-sub { font-size: 14px; color: ${t.textMuted}; margin-bottom: 28px; }
    .internship-preview {
      background: ${t.bgCard}; border: 1px solid ${t.border};
      border-radius: 12px; padding: 16px 20px;
      display: flex; align-items: center; gap: 16px; margin-bottom: 28px;
    }
    .preview-icon { font-size: 28px; }
    .preview-title { font-size: 15px; font-weight: 600; color: ${t.textPrimary}; }
    .preview-company { font-size: 13px; color: ${t.textMuted}; }
    .preview-match { margin-left: auto; font-size: 13px; font-weight: 700; color: #48bb78; }
    .confirm-list { margin: 24px 0; }
    .confirm-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 0; border-bottom: 1px solid ${t.border};
      font-size: 14px; color: ${t.textSecondary};
    }
    .confirm-check { color: #48bb78; }
    .success-wrap { text-align: center; }
    .success-circle {
      width: 80px; height: 80px; border-radius: 50%;
      background: rgba(72,187,120,0.15); border: 2px solid rgba(72,187,120,0.3);
      display: flex; align-items: center; justify-content: center;
      font-size: 36px; margin: 0 auto 24px;
    }
    .success-title { font-family: 'DM Serif Display', serif; font-size: 32px; color: ${t.textPrimary}; margin-bottom: 12px; }
    .success-sub { font-size: 15px; color: ${t.textMuted}; margin-bottom: 32px; line-height: 1.7; }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="ie-page">
        <div className="ie-bg" /><div className="ie-grid" />
        <StudentNavbar>
          <button className="ie-btn ie-btn-ghost" style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => navigate(`/student/internship/${id}`)}>Back to Internship</button>
        </StudentNavbar>
        <div className="ie-content apply-page">
          <div className="apply-box">
            {step === 1 && (
              <>
                <div className="ie-badge ie-animate">Apply</div>
                <h1 className="apply-title ie-animate-2">Application Questionnaire</h1>
                <p className="apply-sub ie-animate-3">Please answer the following questions to complete your application.</p>

                <div className="internship-preview ie-animate-2">
                  <span className="preview-icon">CV</span>
                  <div>
                    <div className="preview-title">{internship.title}</div>
                    <div className="preview-company">{internship.company}</div>
                  </div>
                  <span className="preview-match">{matchScore}% match</span>
                </div>

                {error && <div className="ie-error">{error}</div>}
                {eligibility && eligibility.application_status === 'rejected' && (
                  <div className="ie-error" style={{ marginBottom: '12px' }}>
                    Re-apply is disabled for this internship after rejection.
                    {!!eligibility.recommended_skills_to_improve?.length && (
                      <div style={{ marginTop: '8px', fontSize: '13px' }}>
                        Improve: {eligibility.recommended_skills_to_improve.join(', ')}
                      </div>
                    )}
                  </div>
                )}

                <div className="ie-input-group">
                  <label className="ie-label">1. Why do you want to intern here? *</label>
                  <textarea className="ie-input" style={{ minHeight: '100px', resize: 'vertical' }} value={answers.motivation} onChange={e => setAnswers({...answers, motivation: e.target.value})} />
                </div>
                <div className="ie-input-group">
                  <label className="ie-label">2. Relevant skills? *</label>
                  <textarea className="ie-input" style={{ minHeight: '80px', resize: 'vertical' }} value={answers.skills} onChange={e => setAnswers({...answers, skills: e.target.value})} />
                </div>
                <div className="ie-input-group">
                  <label className="ie-label">3. Availability? *</label>
                  <select className="ie-input" value={answers.availability} onChange={e => setAnswers({...answers, availability: e.target.value})}>
                    <option value="">Select availability</option><option value="Immediately">Immediately</option>
                  </select>
                </div>
                <div className="ie-input-group">
                  <label className="ie-label">4. Comfortable with {internship.type || 'this'} model? *</label>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                    <label style={{ color: t.textSecondary }}><input type="radio" name="workType" value="Yes" checked={answers.workType === 'Yes'} onChange={e => setAnswers({...answers, workType: e.target.value})} /> Yes</label>
                    <label style={{ color: t.textSecondary }}><input type="radio" name="workType" value="No" checked={answers.workType === 'No'} onChange={e => setAnswers({...answers, workType: e.target.value})} /> No</label>
                  </div>
                </div>
                <div className="ie-input-group">
                  <label className="ie-label">5. Comments? (Optional)</label>
                  <input className="ie-input" type="text" value={answers.comments} onChange={e => setAnswers({...answers, comments: e.target.value})} />
                </div>

                <button className="ie-btn ie-btn-primary" style={{ width: '100%', marginTop: '24px' }} onClick={handleSubmit}
                  disabled={eligibility && eligibility.application_status === 'rejected'}>
                  Review Application
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="ie-badge ie-animate">Review</div>
                <h1 className="apply-title ie-animate-2">Confirm your application</h1>
                <div className="internship-preview ie-animate-2">
                  <span className="preview-icon">CV</span>
                  <div>
                    <div className="preview-title">{internship.title}</div>
                    <div className="preview-company">{internship.company}</div>
                  </div>
                </div>
                <div className="confirm-list ie-animate-3">
                  <div className="confirm-item"><span className="confirm-check">+</span> Your CV will be attached automatically</div>
                  <div className="confirm-item"><span className="confirm-check">+</span> AI match score: {matchScore}%</div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }} className="ie-animate-4">
                  <button className="ie-btn ie-btn-ghost" style={{ flex: 1 }} onClick={() => setStep(1)}>Edit</button>
                  <button className="ie-btn ie-btn-primary" style={{ flex: 2 }} onClick={handleConfirm} disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <div className="success-wrap ie-animate">
                <div className="success-circle">OK</div>
                <h1 className="success-title">Application Sent!</h1>
                <button className="ie-btn ie-btn-primary" onClick={() => navigate('/student/dashboard')}>Go to Dashboard</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ApplyPage;

