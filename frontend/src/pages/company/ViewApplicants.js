import { useTheme } from '../../context/ThemeContext';
import CompanyNavbar from '../../components/CompanyNavbar';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { globalStyles, getTheme } from '../../theme';
import API from '../../api/api';

export function ViewApplicants() {
  const { isDark } = useTheme();
  const t = getTheme(isDark);
  const navigate = useNavigate();
  const { id } = useParams();
  const [filter, setFilter] = useState('all');
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  const showNotice = (message, type = 'error') => {
    setNotice({ message, type });
    setTimeout(() => setNotice(null), 3600);
  };

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const studentId = queryParams.get('studentId');

  const fetchApplicants = useCallback(async () => {
    try {
      setLoading(true);
      const companyRes = await API.get('/companies/me');
      const companyId = companyRes.data.company_id;
      const res = await API.get(`/reports/company/${companyId}/internships/${id}`);
      setApplicants(res.data.applicants || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const statusColor = (s) => ({ accepted: '#48bb78', rejected: '#fc8181', pending: '#f6ad55', reviewing: '#63b3ed' }[s] || '#718096');
  const statusBg = (s) => ({ accepted: 'rgba(72,187,120,0.1)', rejected: 'rgba(252,129,129,0.1)', pending: 'rgba(246,173,85,0.1)', reviewing: 'rgba(99,179,237,0.1)' }[s] || 'rgba(0,0,0,0.05)');
  const matchColor = (m) => (m >= 80 ? '#48bb78' : m >= 60 ? '#f6ad55' : '#fc8181');

  const filtered = studentId
    ? applicants.filter((a) => String(a.student_id) === String(studentId))
    : (filter === 'all' ? applicants : applicants.filter((a) => a.status === filter));

  const updateStatus = async (applicationId, newStatus) => {
    try {
      await API.put(`/applications/${applicationId}/status`, {
        status: newStatus
      });
      // Refresh from backend after update so report metrics and filters stay accurate.
      await fetchApplicants();
    } catch (e) {
      console.error(e);
      showNotice('Failed to update status.');
    }
  };

  const styles = `
    ${globalStyles(isDark)}
    .applicants-page { padding: 100px 48px 60px; max-width: 1000px; margin: 0 auto; }
    .page-title { font-family: 'DM Serif Display', serif; font-size: 32px; color: ${t.textPrimary}; margin-bottom: 4px; }
    .page-sub { font-size: 14px; color: ${t.textMuted}; margin-bottom: 28px; }
    .filter-row { display: flex; gap: 8px; margin-bottom: 28px; }
    .filter-btn { padding: 8px 18px; border-radius: 100px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid ${t.border}; background: ${t.bgCard}; color: ${t.textSecondary}; transition: all 0.2s; font-family: 'Sora', sans-serif; }
    .filter-btn.active { background: ${t.accentMuted}; border-color: ${t.borderHover}; color: ${t.accentLight}; }
    .app-card { background: ${t.bgCard}; border: 1px solid ${t.border}; border-radius: 16px; padding: 22px 28px; margin-bottom: 14px; transition: all 0.2s; position: relative; }
    .app-card:hover { border-color: ${t.accent}; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
    .app-row { display: flex; align-items: center; gap: 16px; }
    .app-avatar { width: 52px; height: 52px; border-radius: 14px; background: ${t.accent}15; border: 1px solid ${t.accent}20; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; font-weight: 700; }
    .app-info { flex: 1; }
    .app-name { font-size: 17px; font-weight: 600; color: ${t.textPrimary}; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
    .app-meta { font-size: 13px; color: ${t.textMuted}; display: flex; gap: 16px; flex-wrap: wrap; }
    .match-pill { font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 100px; display: inline-flex; align-items: center; gap: 4px; }
    .action-row { display: flex; gap: 10px; margin-top: 16px; padding-top: 16px; border-top: 1px solid ${t.border}; }
    .act-btn { padding: 9px 18px; border-radius: 10px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.2s; border: 1px solid transparent; }
    .act-cv { background: ${t.accent}; color: white; }
    .act-cv:hover { opacity: 0.9; }
    .act-accept { background: ${isDark ? 'rgba(72,187,120,0.15)' : '#dcfce7'}; color: ${isDark ? '#48bb78' : '#166534'}; border: 1px solid ${isDark ? 'rgba(72,187,120,0.3)' : '#bbf7d0'}; }
    .act-reject { background: ${isDark ? 'rgba(252,129,129,0.1)' : '#fee2e2'}; color: ${isDark ? '#fc8181' : '#991b1b'}; border: 1px solid ${isDark ? 'rgba(252,129,129,0.2)' : '#fecaca'}; }
    .act-msg { background: ${isDark ? 'rgba(255,255,255,0.05)' : t.bgPage}; color: ${t.textPrimary}; border: 1px solid ${t.border}; }
    .site-notice {
      position: fixed; top: 86px; right: 48px; z-index: 200;
      max-width: min(420px, calc(100vw - 32px)); padding: 14px 16px; border-radius: 12px;
      background: ${isDark ? 'rgba(10,15,30,0.96)' : '#ffffff'};
      border: 1px solid rgba(252,129,129,0.45); box-shadow: 0 18px 44px rgba(0,0,0,0.22);
      color: ${t.textPrimary}; font-size: 14px; line-height: 1.5;
    }
    .site-notice-title { font-size: 12px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 4px; color: #fc8181; }
  `;

  if (loading) {
    return <div style={{ background: t.bgPage, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading applicants...</div>;
  }

  return (
    <>
      <style>{styles}</style>
      <CompanyNavbar />
      <div className="ie-page">
        <div className="ie-bg" /><div className="ie-grid" />
        {notice && (
          <div className="site-notice">
            <div className="site-notice-title">Action needed</div>
            <div>{notice.message}</div>
          </div>
        )}
        <div className="applicants-page">
          <div className="ie-animate">
            <h1 className="page-title">Applicants List</h1>
            <p className="page-sub">Reviewing candidates for Internship #{id}</p>
          </div>

          <div className="filter-row ie-animate-2">
            {!studentId && ['all', 'pending', 'reviewing', 'accepted', 'rejected'].map((f) => (
              <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
            {studentId && (
              <button className="filter-btn active" onClick={() => navigate(`/company/applicants/${id}`)}>
                {'<'} View All Applicants
              </button>
            )}
          </div>

          <div className="ie-animate-3">
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: t.textMuted }}>No applicants found matching this filter.</div>
            ) : filtered.map((a) => (
              <div className="app-card" key={a.application_id || `${a.student_id}-${a.applied_at || ''}`}>
                <div className="app-row">
                  <div className="app-avatar">ST</div>
                  <div className="app-info">
                    <div className="app-name">{a.name}</div>
                    <div className="app-meta">
                      <span>University: {a.university || 'N/A'}</span>
                      <span>Major: {a.major}</span>
                      {a.gpa && <span>GPA: {a.gpa}</span>}
                      <span className="match-pill" style={{ background: `${matchColor(a.match_score)}15`, color: matchColor(a.match_score) }}>
                        {a.match_score}% Match
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: t.textMuted, marginBottom: '4px' }}>Applied On</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: t.textPrimary }}>{new Date(a.applied_at).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="action-row">
                  <button className="act-btn act-cv" onClick={() => navigate(`/company/cv/${a.student_id}`)}>View & Download CV</button>
                  <button className="act-btn act-msg" onClick={() => navigate(`/messages/${a.student_id}?name=${a.name}`)}>Message</button>
                  {(a.status || 'pending') === 'pending' || a.status === 'reviewing' ? (
                    <>
                      <button className="act-btn act-accept" onClick={() => updateStatus(a.application_id, 'accepted')}>Accept</button>
                      <button className="act-btn act-reject" onClick={() => updateStatus(a.application_id, 'rejected')}>Reject</button>
                    </>
                  ) : (
                    <span style={{ fontSize: '12px', fontWeight: 700, padding: '9px 18px', borderRadius: '10px', background: statusBg(a.status), color: statusColor(a.status) }}>
                      Status: {a.status.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default ViewApplicants;
