import CompanyNavbar from '../../components/CompanyNavbar';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { globalStyles, getTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import API from '../../api/api';

function CompanyDashboard() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const t = getTheme(isDark);
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await API.get('/reports/my-company-report');
      const data = res.data;

      setInternships(
        (data.internships || []).map((i) => ({
          id: i.internship_id,
          title: i.title,
          location: i.location,
          applicants: i.total_applicants || 0,
          status: i.status || 'pending',
          duration: i.type || 'N/A',
          rejectionReason: i.admin_rejection_reason || ''
        }))
      );

      let allAccepted = [];
      (data.internships || []).forEach((i) => {
        if (i.accepted_students) {
          allAccepted = [
            ...allAccepted,
            ...i.accepted_students.map((a) => ({
              ...a,
              name: a.student_name,
              major: a.student_major,
              match_score: a.ai_match_score || 0,
              internship_title: i.title,
              internship_id: i.internship_id
            }))
          ];
        }
      });

      allAccepted.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
      setApplications(allAccepted);
    } catch (e) {
      console.error(e);
    }
  };

  const statusLabel = (s) => ({ pending: 'Pending Review', open: 'Open', closed: 'Closed / Rejected', rejected: 'Closed / Rejected' }[s] || s || 'Pending Review');
  const statusColor = (s) => ({ accepted: '#48bb78', rejected: '#fc8181', pending: '#f6ad55', open: '#48bb78', closed: '#fc8181' }[s] || '#718096');
  const statusBg = (s) => ({ accepted: 'rgba(72,187,120,0.1)', rejected: 'rgba(252,129,129,0.1)', pending: 'rgba(246,173,85,0.1)', open: 'rgba(72,187,120,0.1)', closed: 'rgba(252,129,129,0.1)' }[s] || 'rgba(0,0,0,0.05)');
  const matchColor = (m) => (m >= 80 ? '#48bb78' : m >= 60 ? '#f6ad55' : '#fc8181');

  const styles = `
    ${globalStyles(isDark)}
    .dash-layout { display: flex; min-height: 100vh; padding-top: 70px; }
    .dash-sidebar {
      width: 240px; flex-shrink: 0;
      background: ${t.sidebarBg};
      border-right: 1px solid ${t.border};
      padding: 32px 20px;
      position: fixed; top: 70px; bottom: 0; left: 0;
      overflow-y: auto;
    }
    .dash-main { flex: 1; margin-left: 240px; padding: 40px 48px; min-height: calc(100vh - 70px); }
    .sidebar-label {
      font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
      text-transform: uppercase; color: ${t.textMuted};
      margin-bottom: 8px; padding: 0 12px;
    }
    .sidebar-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; border-radius: 10px; margin-bottom: 2px;
      cursor: pointer; font-size: 14px; color: ${t.textSecondary};
      transition: all 0.2s; border: none;
      background: none; width: 100%; text-align: left;
    }
    .sidebar-item:hover { background: ${isDark ? 'rgba(99,179,237,0.06)' : '#f0f5ff'}; color: ${t.textPrimary}; }
    .sidebar-item.active { background: ${isDark ? 'rgba(43,108,176,0.15)' : '#dbeafe'}; color: ${isDark ? '#90cdf4' : '#1d4ed8'}; font-weight: 600; }
    .sidebar-avatar {
      width: 44px; height: 44px; border-radius: 12px;
      background: ${t.accent}15; display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 700; margin-bottom: 16px;
    }
    .logout-btn {
      width: 100%; padding: 10px 12px; border-radius: 10px;
      background: none; border: 1px solid rgba(252,129,129,0.2);
      color: #fc8181; font-size: 13px; cursor: pointer; margin-top: 16px;
    }
    .dash-greeting { font-family: 'DM Serif Display', serif; font-size: 32px; color: ${t.textPrimary}; margin-bottom: 6px; }
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 36px; }
    .stat-card { background: ${t.bgCard}; border: 1px solid ${t.border}; border-radius: 16px; padding: 20px 24px; }
    .stat-value { font-size: 28px; font-weight: 700; color: ${t.textPrimary}; }
    .section-title { font-size: 16px; font-weight: 600; color: ${t.textPrimary}; margin-bottom: 16px; }
    .item-card {
      background: ${t.bgCard}; border: 1px solid ${t.border};
      border-radius: 14px; padding: 20px 24px; margin-bottom: 12px;
      display: flex; align-items: center; gap: 16px; cursor: pointer; transition: 0.2s;
    }
    .item-card:hover { border-color: ${t.accent}; transform: translateY(-2px); }
    .item-icon {
      width: 48px; height: 48px; border-radius: 12px;
      background: ${t.accent}15; display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700; flex-shrink: 0;
    }
    .quick-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 36px; }
    .quick-btn {
      padding: 10px 18px; border-radius: 10px; background: ${t.bgCard};
      border: 1px solid ${t.border}; color: ${t.textPrimary}; font-size: 13px; font-weight: 600;
      cursor: pointer; transition: 0.2s;
    }
    .quick-btn:hover { border-color: ${t.accent}; background: ${t.bgCardHover}; }
    .status-pill { font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 12px; border-radius: 100px; }
    .status-note { font-size: 12px; color: ${t.textMuted}; margin-top: 4px; }
    .match-pill { font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 100px; }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="ie-page">
        <div className="ie-bg" /><div className="ie-grid" />
        <CompanyNavbar>
          <button className="ie-btn ie-btn-primary" style={{ padding: '8px 18px', fontSize: '13px', background: t.accent }}
            onClick={() => navigate('/company/post')}>+ Post Internship</button>
        </CompanyNavbar>

        <div className="ie-content dash-layout">
          <aside className="dash-sidebar">
            <div className="sidebar-avatar">CO</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: t.textPrimary }}>{user?.email?.split('@')[0] || 'Company'}</div>
            <div style={{ fontSize: '11px', color: t.textMuted, marginBottom: '24px' }}>{user?.email}</div>

            <div className="sidebar-label">Menu</div>
            {[
              { id: 'overview', icon: '🏠', label: 'Overview' },
              { id: 'internships', icon: '💼', label: 'My Internships' },
              { id: 'applicants', icon: '🧑‍🎓', label: 'Applicants' },
              { id: 'reports', icon: '📊', label: 'Reports' },
              { id: 'messages', icon: '💬', label: 'Messages' },
            ].map((item) => (
              <button key={item.id} className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  if (item.id === 'messages') navigate('/messages/0?name=Select a Student');
                  else if (item.id === 'reports') navigate('/company/report');
                  else setActiveTab(item.id);
                }}>
                <span style={{ marginRight: '10px' }}>{item.icon}</span> {item.label}
              </button>
            ))}

            <button className="logout-btn" onClick={() => { logout(); navigate('/'); }}>Sign Out</button>
          </aside>

          <main className="dash-main">
            {activeTab === 'overview' && (
              <>
                <h1 className="dash-greeting">Welcome back, <span>{user?.email?.split('@')[0] || 'there'}</span></h1>
                <p style={{ color: t.textMuted, marginBottom: '32px' }}>Here is what is happening with your listings.</p>

                <div className="stat-grid">
                  <div className="stat-card">
                    <div style={{ fontSize: '12px', color: t.textMuted }}>Total Listings</div>
                    <div className="stat-value">{internships.length}</div>
                  </div>
                  <div className="stat-card">
                    <div style={{ fontSize: '12px', color: t.textMuted }}>Active Listings</div>
                    <div className="stat-value" style={{ color: '#48bb78' }}>{internships.filter((i) => i.status === 'open').length}</div>
                  </div>
                  <div className="stat-card">
                    <div style={{ fontSize: '12px', color: t.textMuted }}>Pending Review</div>
                    <div className="stat-value" style={{ color: '#f6ad55' }}>{internships.filter((i) => i.status === 'pending').length}</div>
                  </div>
                  <div className="stat-card">
                    <div style={{ fontSize: '12px', color: t.textMuted }}>Accepted Applications</div>
                    <div className="stat-value" style={{ color: t.accent }}>{applications.length}</div>
                  </div>
                </div>

                <div className="quick-actions">
                  <button className="quick-btn" onClick={() => navigate('/company/post')}>Post New</button>
                  <button className="quick-btn" onClick={() => setActiveTab('internships')}>Manage Listings</button>
                  <button className="quick-btn" onClick={() => navigate('/company/report')}>Reports</button>
                </div>

                <div className="section-title">Most Applied Internships</div>
                {[...internships].sort((a, b) => (b.applicants || 0) - (a.applicants || 0)).slice(0, 2).map((intern) => (
                  <div className="item-card" key={intern.id} onClick={() => navigate(`/company/applicants/${intern.id}`)}>
                    <div className="item-icon">IN</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: t.textPrimary }}>{intern.title}</div>
                    <div style={{ fontSize: '13px', color: t.textMuted }}>{intern.applicants} applications</div>
                    </div>
                    <span className="status-pill" style={{ background: statusBg(intern.status), color: statusColor(intern.status) }}>{statusLabel(intern.status)}</span>
                  </div>
                ))}

                <div className="section-title" style={{ marginTop: '32px' }}>Top Accepted Students</div>
                {applications.length === 0 ? (
                  <div style={{ color: t.textMuted, fontSize: '14px' }}>No accepted students yet.</div>
                ) : applications.slice(0, 5).map((app) => (
                  <div className="item-card" key={`${app.student_email}-${app.internship_id}`} onClick={() => navigate(`/company/applicants/${app.internship_id}`)}>
                    <div className="item-icon">ST</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: t.textPrimary }}>{app.name}</div>
                      <div style={{ fontSize: '13px', color: t.textMuted }}>{app.major} | {app.university || 'N/A'}</div>
                      <div style={{ fontSize: '11px', color: t.textMuted, marginTop: '2px' }}>Accepted for: {app.internship_title}</div>
                    </div>
                    <span className="match-pill" style={{ background: `${matchColor(app.match_score)}15`, color: matchColor(app.match_score) }}>{app.match_score}% Match</span>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'internships' && (
              <div>
                <h1 className="dash-greeting">My Internships</h1>
                <div style={{ marginTop: '24px' }}>
                  {internships.map((i) => (
                    <div className="item-card" key={i.id}>
                      <div className="item-icon">IN</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: t.textPrimary }}>{i.title}</div>
                        <div style={{ fontSize: '13px', color: t.textMuted }}>{i.location} | {i.duration}</div>
                        {i.status === 'pending' && <div className="status-note">Waiting for Admin approval.</div>}
                        {i.status === 'closed' && i.rejectionReason && <div className="status-note">{i.rejectionReason}</div>}
                      </div>
                      <span className="status-pill" style={{ background: statusBg(i.status), color: statusColor(i.status) }}>{statusLabel(i.status)}</span>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: 700 }}>{i.applicants}</div>
                        <div style={{ fontSize: '10px', color: t.textMuted }}>Applications</div>
                      </div>
                      <button className="quick-btn" onClick={() => navigate(`/company/report?internId=${i.id}`)}>Report</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

export default CompanyDashboard;
