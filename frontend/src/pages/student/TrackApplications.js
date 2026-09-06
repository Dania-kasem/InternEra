import { useTheme } from '../../context/ThemeContext';
import StudentNavbar from '../../components/StudentNavbar';
import { useActivity } from '../../context/ActivityContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { globalStyles, getTheme } from '../../theme';

function TrackApplications() {
  const { isDark } = useTheme();
  const t = getTheme(isDark);
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const { applications } = useActivity();
  const apps = applications || [];

  const statusColor = (s) => ({ accepted: '#48bb78', rejected: '#fc8181', pending: '#f6ad55' }[s] || '#718096');
  const statusBg = (s) => ({ accepted: 'rgba(72,187,120,0.1)', rejected: 'rgba(252,129,129,0.1)', pending: 'rgba(246,173,85,0.1)' }[s] || 'rgba(0,0,0,0.05)');
  const matchColor = (m) => (m >= 80 ? '#48bb78' : m >= 60 ? '#f6ad55' : '#fc8181');

  const filtered = filter === 'all' ? apps : apps.filter((a) => a.status === filter);

  const counts = {
    all: apps.length,
    pending: apps.filter((a) => a.status === 'pending').length,
    accepted: apps.filter((a) => a.status === 'accepted').length,
    rejected: apps.filter((a) => a.status === 'rejected').length,
  };

  const styles = `
    ${globalStyles(isDark)}
    .track-page { padding: 100px 48px 60px; max-width: 900px; margin: 0 auto; }
    .track-title { font-family: 'DM Serif Display', serif; font-size: 32px; color: ${t.textPrimary}; margin-bottom: 6px; }
    .track-sub { font-size: 14px; color: ${t.textMuted}; margin-bottom: 32px; }
    .filter-row { display: flex; gap: 8px; margin-bottom: 28px; flex-wrap: wrap; }
    .filter-btn { padding: 8px 18px; border-radius: 100px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid ${t.border}; background: ${t.bgCard}; color: ${t.textSecondary}; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
    .filter-btn.active { background: ${t.accentMuted}; border-color: ${t.borderHover}; color: ${t.accentLight}; }
    .filter-count { font-size: 11px; padding: 1px 7px; border-radius: 100px; background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}; color: ${t.textMuted}; }
    .app-card { background: ${t.bgCard}; border: 1px solid ${t.border}; border-radius: 16px; padding: 22px 28px; margin-bottom: 14px; transition: all 0.2s; }
    .app-card:hover { border-color: ${t.borderHover}; background: ${t.bgCardHover}; }
    .app-card.recent { border-color: ${t.accent}; background: ${t.accentMuted}; box-shadow: 0 0 15px ${t.accent}20; }
    .new-badge { background: ${t.accent}; color: #fff; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; margin-left: 8px; vertical-align: middle; animation: blink 1.5s infinite; }
    @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }
    .app-main { display: flex; align-items: center; gap: 16px; }
    .app-logo { width: 48px; height: 48px; border-radius: 12px; background: ${t.accentMuted}; border: 1px solid ${t.border}; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; flex-shrink: 0; }
    .app-info { flex: 1; }
    .app-title { font-size: 16px; font-weight: 600; color: ${t.textPrimary}; margin-bottom: 4px; }
    .app-meta { font-size: 13px; color: ${t.textMuted}; display: flex; gap: 12px; flex-wrap: wrap; }
    .app-right { display: flex; align-items: center; gap: 14px; flex-shrink: 0; }
    .match-badge { font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 100px; }
    .status-pill { font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; padding: 5px 14px; border-radius: 100px; }
    .feedback-box { margin-top: 16px; padding: 14px 18px; background: rgba(252,129,129,0.06); border: 1px solid rgba(252,129,129,0.15); border-radius: 10px; }
    .feedback-label { font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #fc8181; margin-bottom: 8px; }
    .feedback-text { font-size: 13px; color: ${t.textSecondary}; line-height: 1.7; }
    .view-btn { background: none; border: 1px solid ${t.border}; color: ${t.accentLight}; font-size: 12px; padding: 6px 14px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
    .view-btn:hover { background: ${t.accentMuted}; }
    .empty-state { text-align: center; padding: 80px 40px; }
    .empty-icon { font-size: 48px; margin-bottom: 16px; }
    .empty-text { font-size: 15px; color: ${t.textMuted}; }
  `;

  const companyCodes = { TechCo: 'TC', DevCorp: 'DC', DataInc: 'DI', DesignHub: 'DH', AppCo: 'AC' };

  return (
    <>
      <style>{styles}</style>
      <div className="ie-page">
        <div className="ie-bg" /><div className="ie-grid" />
        <StudentNavbar>
          <button className="ie-btn ie-btn-ghost" style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => navigate('/student/dashboard')}>Back to Dashboard</button>
        </StudentNavbar>

        <div className="ie-content track-page">
          <div className="ie-animate">
            <div className="ie-badge">Applications</div>
            <h1 className="track-title" style={{ marginTop: '12px' }}>Track your applications</h1>
            <p className="track-sub">Monitor the status of all your internship applications.</p>
          </div>

          <div className="filter-row ie-animate-2">
            {['all', 'pending', 'accepted', 'rejected'].map((f) => (
              <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                <span className="filter-count">{counts[f]}</span>
              </button>
            ))}
          </div>

          <div className="ie-animate-3">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">No Data</div>
                <p className="empty-text">No {filter === 'all' ? '' : filter} applications yet.</p>
                <button className="ie-btn ie-btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate('/student/search')}>
                  Browse Internships
                </button>
              </div>
            ) : filtered.map((app) => {
              const isRecent = app.applied_full && (new Date() - new Date(app.applied_full) < 60000);
              return (
                <div key={app.id}>
                  <div className={`app-card ${isRecent ? 'recent' : ''}`}>
                    <div className="app-main">
                      <div className="app-logo">{companyCodes[app.company] || 'CO'}</div>
                      <div className="app-info">
                        <div className="app-title">
                          {app.title}
                          {isRecent && <span className="new-badge">NEW</span>}
                        </div>
                        <div className="app-meta">
                          <span>{app.company}</span>
                          <span>{app.location}</span>
                          <span>Applied {app.applied_at}</span>
                        </div>
                      </div>
                    </div>
                    <div className="app-right">
                      <span className="match-badge" style={{ background: `${matchColor(app.match)}15`, color: matchColor(app.match), border: `1px solid ${matchColor(app.match)}30` }}>
                        {app.match}%
                      </span>
                      <span className="status-pill" style={{ background: statusBg(app.status), color: statusColor(app.status) }}>
                        {app.status}
                      </span>
                      <button className="view-btn" onClick={() => navigate(`/student/internship/${app.id}`)}>View</button>
                    </div>
                  </div>

                  {app.status === 'rejected' && app.rejection_feedback && (
                    <div className="feedback-box">
                      <div className="feedback-label">AI Feedback</div>
                      <div className="feedback-text">{app.rejection_feedback}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default TrackApplications;
