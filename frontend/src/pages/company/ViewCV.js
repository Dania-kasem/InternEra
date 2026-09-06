import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useState, useEffect, useCallback } from 'react';
import { globalStyles, getTheme } from '../../theme';
import CompanyNavbar from '../../components/CompanyNavbar';
import API from '../../api/api';
import { API_BASE_URL } from '../../api/api';

function ViewCV() {
  const { isDark } = useTheme();
  const t = getTheme(isDark);
  const navigate = useNavigate();
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  const showNotice = (message) => {
    setNotice({ message });
    setTimeout(() => setNotice(null), 3600);
  };

  const fetchStudent = useCallback(async () => {
    try {
      const res = await API.get(`/students/${id}/profile`);
      setStudent(res.data);
    } catch (e) {
      console.error(e);
      setStudent({
        name: 'Student',
        major: 'N/A',
        std_email: 'N/A',
        phone: 'N/A',
        summary: 'No profile information available.',
        skills: '',
        cv_path: null
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  const handleView = () => {
    if (!student?.cv_path) {
      showNotice('No CV file available for this student.');
      return;
    }
    window.open(`${API_BASE_URL}/students/cv/view/${id}`, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = () => {
    if (!student?.cv_path) {
      showNotice('No CV file available for this student.');
      return;
    }
    window.location.href = `${API_BASE_URL}/students/cv/download/${id}`;
  };

  const styles = `
    ${globalStyles(isDark)}
    .cv-view-page { padding: 100px 24px 60px; max-width: 800px; margin: 0 auto; }
    .cv-card {
      background: ${t.bgCard}; border: 1px solid ${t.border};
      border-radius: 24px; padding: 48px; margin-top: 24px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.1); position: relative;
    }
    .cv-header { display: flex; align-items: flex-start; gap: 32px; margin-bottom: 40px; }
    .cv-avatar {
      width: 100px; height: 100px; border-radius: 24px;
      background: ${t.accent}15; border: 1px solid ${t.accent}25;
      display: flex; align-items: center; justify-content: center;
      font-size: 36px; flex-shrink: 0;
    }
    .cv-name { font-family: 'DM Serif Display', serif; font-size: 32px; color: ${t.textPrimary}; margin-bottom: 8px; }
    .cv-major { font-size: 16px; color: ${t.accent}; font-weight: 600; margin-bottom: 16px; }
    .cv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
    .cv-section-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: ${t.textMuted}; letter-spacing: 2px; margin-bottom: 16px; }
    .cv-text { font-size: 15px; color: ${t.textPrimary}; line-height: 1.6; }
    .skill-list { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill-tag { padding: 6px 14px; background: ${t.bgPage}; border: 1px solid ${t.border}; border-radius: 8px; font-size: 13px; color: ${t.textPrimary}; font-weight: 500; }
    .cv-footer { margin-top: 48px; padding-top: 32px; border-top: 1px solid ${t.border}; display: flex; justify-content: space-between; align-items: center; }
    .btn-download { background: ${t.accent}; color: white; padding: 14px 28px; border-radius: 12px; font-weight: 700; border: none; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 10px; }
    .btn-download:hover { transform: translateY(-2px); box-shadow: 0 8px 20px ${t.accent}40; }
    .site-notice {
      position: fixed; top: 86px; right: 48px; z-index: 200;
      max-width: min(420px, calc(100vw - 32px)); padding: 14px 16px; border-radius: 12px;
      background: ${isDark ? 'rgba(10,15,30,0.96)' : '#ffffff'};
      border: 1px solid rgba(252,129,129,0.45); box-shadow: 0 18px 44px rgba(0,0,0,0.22);
      color: ${t.textPrimary}; font-size: 14px; line-height: 1.5;
    }
    .site-notice-title { font-size: 12px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 4px; color: #fc8181; }
  `;

  if (loading || !student) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.bgPage }}>
        Loading profile...
      </div>
    );
  }

  const skills = (student.skills || student.extracted_skills || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <>
      <style>{styles}</style>
      <div className="ie-page">
        <div className="ie-bg" /><div className="ie-grid" />
        {notice && (
          <div className="site-notice">
            <div className="site-notice-title">Action needed</div>
            <div>{notice.message}</div>
          </div>
        )}
        <CompanyNavbar>
          <button className="ie-btn ie-btn-ghost" onClick={() => navigate(-1)}>Back to Applicants</button>
        </CompanyNavbar>

        <div className="cv-view-page">
          <div className="cv-card ie-animate">
            <div className="cv-header">
              <div className="cv-avatar">CV</div>
              <div>
                <h1 className="cv-name">{student.name || `${student.f_name || ''} ${student.l_name || ''}`.trim()}</h1>
                <div className="cv-major">{student.major || 'N/A'}</div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: t.textMuted, flexWrap: 'wrap' }}>
                  <span>Email: {student.email || student.std_email || 'N/A'}</span>
                  <span>Phone: {student.phone || student.phone_number || 'N/A'}</span>
                  {student.gpa && <span>GPA: {student.gpa}</span>}
                </div>
              </div>
            </div>

            <div className="cv-grid">
              <div>
                <h3 className="cv-section-title">About</h3>
                <p className="cv-text">
                  {student.bio || student.summary || 'Student profile summary is not available yet.'}
                </p>
              </div>
              <div>
                <h3 className="cv-section-title">Technical Skills</h3>
                <div className="skill-list">
                  {skills.length > 0
                    ? skills.map((s) => <span key={s} className="skill-tag">{s}</span>)
                    : <span style={{ color: t.textMuted, fontSize: 13 }}>No skills listed</span>}
                </div>
              </div>
            </div>

            <div className="cv-footer">
              <div>
                <div className="cv-section-title" style={{ marginBottom: '4px' }}>CV Document</div>
                <div style={{ fontSize: '13px', color: t.textMuted }}>
                  {student.cv_path ? 'PDF available to view or download' : 'No CV uploaded yet'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <button className="btn-download" onClick={handleView} disabled={!student.cv_path}>
                  View CV PDF
                </button>
                <button className="btn-download" onClick={handleDownload} disabled={!student.cv_path}>
                  Download CV PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ViewCV;
