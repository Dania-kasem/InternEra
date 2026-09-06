import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { globalStyles, getTheme } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useActivity } from '../../context/ActivityContext';
import StudentNavbar from '../../components/StudentNavbar';

export function InternshipDetails() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const { getInternshipById, saveInternship, savedInternships, applications } = useActivity();
  const t = getTheme(isDark);

  const [matchScore, setMatchScore] = useState(0);
  const [loadingMatch, setLoadingMatch] = useState(true);

  const internshipData = getInternshipById(id);

  useEffect(() => {
  if (!internshipData) return;

  const cacheKey = `match_${internshipData.internship_id || internshipData.id}`;
  const cachedScore = localStorage.getItem(cacheKey);


  if (cachedScore !== null) {
    setMatchScore(Number(cachedScore));
  }

  setLoadingMatch(false);
}, [internshipData]);
  
  if (!internshipData) {
    return (
      <div className="ie-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: t.textPrimary }}>Internship not found</h2>
          <button className="ie-btn ie-btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate('/student/search')}>Back to Search</button>
        </div>
      </div>
    );
  }

  const internship = internshipData;
  const requirements = internship.requirements || `• Strong understanding of core principles\n• Willingness to learn and grow\n• Good communication skills and team spirit\n• Currently enrolled in a related program`;
  const skills = internship.required_skills ? internship.required_skills.split(',') : [];
  const benefits = internship.benefits || ['Flexible working hours', 'Mentorship from senior devs', 'Certificate upon completion'];

  const matchColor = m => m >= 80 ? '#48bb78' : m >= 60 ? '#f6ad55' : '#fc8181';

  const application = applications.find(a => String(a.id) === String(id));
  const hasApplied = !!application;

  const styles = `
    ${globalStyles(isDark)}
    .detail-page { padding: 100px 48px 60px; max-width: 900px; margin: 0 auto; }
    .back-btn {
      display: inline-flex; align-items: center; gap: 8px;
      color: ${t.textPrimary}; font-size: 14px; font-weight: 600; cursor: pointer;
      background: ${t.bgCard}; border: 1px solid ${t.border}; 
      padding: 10px 18px; border-radius: 100px;
      font-family: 'Sora', sans-serif;
      margin-bottom: 32px; transition: all 0.2s;
    }
    .back-btn:hover { background: ${t.bgCardHover}; border-color: ${t.accentLight}; transform: translateX(-4px); }
    .detail-header {
      display: flex; align-items: flex-start; gap: 20px; margin-bottom: 32px;
    }
    .detail-logo {
      width: 72px; height: 72px; border-radius: 16px;
      background: ${t.accentMuted};
      border: 1px solid ${t.border};
      display: flex; align-items: center; justify-content: center;
      font-size: 32px; flex-shrink: 0;
    }
    .detail-title-wrap { flex: 1; }
    .detail-title {
      font-family: 'DM Serif Display', serif;
      font-size: 32px; color: ${t.textPrimary}; margin-bottom: 6px;
    }
    .detail-company { font-size: 16px; color: ${t.accentLight}; margin-bottom: 12px; }
    .detail-meta { display: flex; gap: 12px; flex-wrap: wrap; }
    .detail-meta-tag {
      font-size: 13px; padding: 5px 12px; border-radius: 8px;
      background: ${t.bgCardHover};
      border: 1px solid ${t.border}; color: ${t.textSecondary};
    }
    .detail-actions { display: flex; gap: 12px; align-items: flex-start; flex-shrink: 0; }
    .save-btn {
      padding: 12px 20px; border-radius: 10px;
      background: transparent; border: 1px solid ${t.border};
      color: ${t.accentLight}; font-size: 14px; font-family: 'Sora', sans-serif;
      cursor: pointer; transition: all 0.2s; font-weight: 600;
    }
    .save-btn:hover, .save-btn.saved { background: ${t.accentMuted}; }
    .detail-grid { display: grid; grid-template-columns: 1fr 280px; gap: 24px; }
    .detail-main { }
    .detail-aside { }
    .detail-section { margin-bottom: 32px; }
    .detail-section-title {
      font-size: 13px; font-weight: 700; letter-spacing: 1px;
      text-transform: uppercase; color: ${t.textMuted}; margin-bottom: 16px;
    }
    .detail-text {
      font-size: 15px; color: ${t.textSecondary}; line-height: 1.8;
      white-space: pre-line;
    }
    .skill-tags { display: flex; gap: 8px; flex-wrap: wrap; }
    .skill-tag {
      font-size: 13px; padding: 6px 14px; border-radius: 8px;
      background: ${t.accentMuted}; color: ${t.accentLight};
      border: 1px solid ${t.border};
    }
    .benefit-item {
      display: flex; align-items: center; gap: 10px;
      font-size: 14px; color: ${t.textSecondary}; padding: 8px 0;
      border-bottom: 1px solid ${t.border};
    }
    .benefit-item:last-child { border: none; }
    .benefit-check { color: #48bb78; font-size: 14px; }
    .aside-card {
      background: ${t.bgCard}; border: 1px solid ${t.border};
      border-radius: 16px; padding: 24px; margin-bottom: 16px;
    }
    .aside-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid ${t.border}; }
    .aside-item:last-child { border: none; }
    .aside-item-label { font-size: 13px; color: ${t.textMuted}; }
    .aside-item-value { font-size: 13px; font-weight: 600; color: ${t.textPrimary}; }
    .match-card {
      background: ${t.accentMuted}; border: 1px solid ${t.border};
      border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 16px;
    }
    .match-number { font-size: 48px; font-weight: 700; line-height: 1; margin-bottom: 8px; }
    .match-label { font-size: 13px; color: ${t.textMuted}; }
    .apply-cta {
      width: 100%; padding: 14px; border-radius: 12px;
      background: #2b6cb0; color: #fff;
      font-size: 16px; font-weight: 600; border: none;
      cursor: pointer; font-family: 'Sora', sans-serif;
      transition: background 0.2s;
    }
    .apply-cta:hover { background: #2c5282; }

    @media (max-width: 768px) {
      .detail-grid { grid-template-columns: 1fr; }
      .detail-header { flex-direction: column; }
      .detail-page { padding: 100px 24px 60px; }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="ie-page">
        <div className="ie-bg" /><div className="ie-grid" />
        <StudentNavbar>
          <button className="ie-btn ie-btn-ghost" style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => navigate('/student/dashboard')}>← Dashboard</button>
        </StudentNavbar>
        <div className="ie-content detail-page">
          <button className="back-btn ie-animate" onClick={() => navigate('/student/search')}>
            ← Back to search listings
          </button>

          <div className="detail-header ie-animate">
            <div className="detail-logo">
              {{ TechCo: '💻', DevCorp: '⚙️', DataInc: '📊', DesignHub: '🎨', AppCo: '📱' }[internship.company] || '🏢'}
            </div>
            <div className="detail-title-wrap">
              <h1 className="detail-title">{internship.title}</h1>
              <div className="detail-company">{internship.company}</div>
              <div className="detail-meta">
                <span className="detail-meta-tag">📍 {internship.location || 'Remote'}</span>
                <span className="detail-meta-tag">⏱ {internship.duration || '12'} weeks</span>
                <span className="detail-meta-tag">🏢 {internship.type || 'Hybrid'}</span>
                <span className="detail-meta-tag">💰 {internship.salary || 'Unpaid'}</span>
              </div>
            </div>
            <div className="detail-actions">
              <button className={`save-btn ${savedInternships.find(s => s.id === internship.id) ? 'saved' : ''}`} 
                onClick={() => saveInternship(internship)}>
                {savedInternships.find(s => s.id === internship.id) ? '🔖 Saved' : '+ Save'}
              </button>
            </div>
          </div>

          <div className="detail-grid ie-animate-2">
            <div className="detail-main">
              <div className="detail-section">
                <div className="detail-section-title">About the Role</div>
                <div className="detail-text">{internship.description}</div>
              </div>
              <div className="detail-section">
                <div className="detail-section-title">Requirements</div>
                <div className="detail-text">{requirements}</div>
              </div>
              <div className="detail-section">
                <div className="detail-section-title">Skills Needed</div>
                <div className="skill-tags">
                  {skills.map((s, i) => <span className="skill-tag" key={i}>{s.trim()}</span>)}
                </div>
              </div>
              <div className="detail-section">
                <div className="detail-section-title">Benefits</div>
                {benefits.map(b => (
                  <div className="benefit-item" key={b}>
                    <span className="benefit-check">✓</span>
                    {b}
                  </div>
                ))}
              </div>
            </div>

            <div className="detail-aside">
              <div className="match-card">
                <div className="match-number" style={{ color: matchColor(matchScore) }}>
                  {loadingMatch ? '...' : `${matchScore}%`}
                </div>
                <div className="match-label">AI Match Score</div>
                <div style={{ fontSize: '12px', color: '#2d3748', marginTop: '8px' }}>
                  Based on your CV & skills
                </div>
              </div>

              {hasApplied ? (
                <div style={{ 
                  background: isDark ? 'rgba(72,187,120,0.1)' : '#f0fff4', 
                  border: '1px solid #48bb78', 
                  borderRadius: '12px', 
                  padding: '20px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>✅</div>
                  <div style={{ fontWeight: 700, color: t.textPrimary, marginBottom: '4px' }}>You have applied.</div>
                </div>
              ) : (
                <button className="apply-cta" onClick={() => navigate(`/student/apply/${id}`)}>
                  Apply Now →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default InternshipDetails;
