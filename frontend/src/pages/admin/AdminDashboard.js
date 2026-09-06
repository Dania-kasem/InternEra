import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import API from '../../api/api';
import { getAdminCss } from './adminCss';

function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const accentText = isDark ? '#90cdf4' : '#1d4ed8';
  const accentStrong = isDark ? '#90cdf4' : '#1e40af';

  const [summary, setSummary] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentInternships, setRecentInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [summaryRes, appsRes, studentsRes, internshipsRes] = await Promise.all([
          API.get('/reports/summary'),
          API.get('/reports/applications'),
          API.get('/reports/students'),
          API.get('/reports/internships'),
        ]);
        setSummary(summaryRes.data);
        setRecentApps([...(appsRes.data || [])].sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at)).slice(0, 5));
        setRecentStudents((studentsRes.data || []).slice(0, 5));
        setRecentInternships([...(internshipsRes.data || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5));
      } catch {
        setError('Failed to load dashboard data. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const statCards = summary ? [
    { label: 'Students', value: summary.total_students, sub: 'Registered accounts', color: accentText, path: '/admin/students' },
    { label: 'Companies', value: summary.total_companies, sub: 'Active partners', color: '#9f7aea', path: '/admin/companies' },
    { label: 'Applications', value: summary.total_applications, sub: 'Total submitted', color: '#68d391', path: '/admin/applications' },
    { label: 'Internships', value: summary.total_internships, sub: 'All listings', color: '#f6ad55', path: '/admin/internships' },
  ] : [];

  const statusBadge = (s) => {
    const map = {
      approved: 'badge-approved',
      accepted: 'badge-accepted',
      pending: 'badge-pending',
      rejected: 'badge-rejected',
      open: 'badge-open',
      closed: 'badge-closed',
    };
    return `badge ${map[s] || 'badge-pending'}`;
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  const extraCss = `
    .activity-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 0; }
    .activity-grid .full-width { grid-column: 1 / -1; }
    .section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .section-head-title { font-size: 15px; font-weight: 600; }
    .see-all { font-size: 12px; color: ${accentStrong}; cursor: pointer; background: none; border: none; font-family: 'Sora', sans-serif; text-decoration: underline; }
    .see-all:hover { opacity: 0.8; }
    .admin-error { background: rgba(252,129,129,0.1); border: 1px solid rgba(252,129,129,0.2); color: #fc8181; padding: 14px 20px; border-radius: 12px; font-size: 14px; margin-bottom: 24px; }
    .admin-loading { color: #64748b; font-size: 14px; padding: 40px; text-align: center; }
    @media (max-width: 900px) {
      .activity-grid { grid-template-columns: 1fr; }
      .activity-grid .full-width { grid-column: 1; }
    }
  `;

  return (
    <>
      <style>{getAdminCss(isDark)}</style>
      <style>{extraCss}</style>
      <div className="admin-page">
        <div className="admin-bg" />
        <div className="admin-grid" />
        <AdminNavbar />
        <div className="admin-layout ie-content">
          <AdminSidebar activeId="dashboard" />
          <main className="admin-main">
            <div className="ie-animate">
              <h1 className="dash-greeting">Admin <span>Dashboard</span></h1>
              <p className="dash-sub">Welcome back{user?.email ? `, ${user.email}` : ''}. Here is your system overview.</p>
            </div>

            {error && <div className="admin-error">{error}</div>}

            {loading ? (
              <div className="admin-loading">Loading dashboard...</div>
            ) : (
              <>
                <div className="stat-grid ie-animate-2">
                  {statCards.map((s, i) => (
                    <div key={i} className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate(s.path)}>
                      <div className="stat-card-label">{s.label}</div>
                      <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
                      <div className="stat-card-sub">{s.sub}</div>
                    </div>
                  ))}
                </div>

                {summary && (
                  <div className="stat-grid ie-animate-3" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 32 }}>
                    <div className="stat-card"><div className="stat-card-label">Pending</div><div className="stat-card-value" style={{ color: '#f6ad55' }}>{summary.pending_applications}</div><div className="stat-card-sub">Awaiting review</div></div>
                    <div className="stat-card"><div className="stat-card-label">Accepted</div><div className="stat-card-value" style={{ color: '#68d391' }}>{summary.accepted_applications}</div><div className="stat-card-sub">Applications accepted</div></div>
                    <div className="stat-card"><div className="stat-card-label">Rejected</div><div className="stat-card-value" style={{ color: '#fc8181' }}>{summary.rejected_applications}</div><div className="stat-card-sub">Applications rejected</div></div>
                  </div>
                )}

                <div className="quick-actions ie-animate-3" style={{ marginBottom: 36 }}>
                  <button className="quick-btn" onClick={() => navigate('/admin/students')}>Manage Students</button>
                  <button className="quick-btn" onClick={() => navigate('/admin/companies')}>Manage Companies</button>
                  <button className="quick-btn" onClick={() => navigate('/admin/internships')}>Manage Internships</button>
                  <button className="quick-btn" onClick={() => navigate('/admin/applications')}>View Applications</button>
                  <button className="quick-btn" onClick={() => navigate('/admin/reports')}>Reports</button>
                  <button className="quick-btn" style={{ background: isDark ? 'rgba(43,108,176,0.12)' : 'rgba(29,78,216,0.12)', borderColor: isDark ? 'rgba(99,179,237,0.3)' : 'rgba(29,78,216,0.28)', color: accentStrong }} onClick={() => navigate('/admin/verify-internships')}>
                    AI Verification
                  </button>
                </div>

                <div className="activity-grid ie-animate-3">
                  <div className="table-wrapper full-width">
                    <div style={{ padding: '20px 24px 0' }}>
                      <div className="section-head">
                        <span className="section-head-title">Recent Applications</span>
                        <button className="see-all" onClick={() => navigate('/admin/applications')}>See all</button>
                      </div>
                    </div>
                    <table className="ie-table">
                      <thead><tr><th>Student</th><th>Major</th><th>Internship</th><th>Company</th><th>Date</th><th>Status</th></tr></thead>
                      <tbody>
                        {recentApps.length === 0
                          ? <tr><td colSpan="6" className="empty-cell">No applications yet</td></tr>
                          : recentApps.map((a) => (
                            <tr key={a.application_id}>
                              <td style={{ fontWeight: 600 }}>{a.student_name}</td>
                              <td>{a.student_major}</td>
                              <td>{a.internship_title}</td>
                              <td>{a.company_name}</td>
                              <td>{fmtDate(a.applied_at)}</td>
                              <td><span className={statusBadge(a.status)}>{a.status}</span></td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="table-wrapper">
                    <div style={{ padding: '20px 24px 0' }}>
                      <div className="section-head">
                        <span className="section-head-title">Recent Students</span>
                        <button className="see-all" onClick={() => navigate('/admin/students')}>See all</button>
                      </div>
                    </div>
                    <table className="ie-table">
                      <thead><tr><th>Name</th><th>Major</th><th>Applications</th></tr></thead>
                      <tbody>
                        {recentStudents.length === 0
                          ? <tr><td colSpan="3" className="empty-cell">No students yet</td></tr>
                          : recentStudents.map((s) => (
                            <tr key={s.std_id}>
                              <td style={{ fontWeight: 600 }}>{s.f_name} {s.l_name}</td>
                              <td>{s.major}</td>
                              <td><span style={{ background: isDark ? 'rgba(99,179,237,0.12)' : 'rgba(29,78,216,0.14)', color: accentStrong, padding: '3px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: 600 }}>{s.total_applications}</span></td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="table-wrapper">
                    <div style={{ padding: '20px 24px 0' }}>
                      <div className="section-head">
                        <span className="section-head-title">Recent Internships</span>
                        <button className="see-all" onClick={() => navigate('/admin/internships')}>See all</button>
                      </div>
                    </div>
                    <table className="ie-table">
                      <thead><tr><th>Title</th><th>Company</th><th>Status</th></tr></thead>
                      <tbody>
                        {recentInternships.length === 0
                          ? <tr><td colSpan="3" className="empty-cell">No internships yet</td></tr>
                          : recentInternships.map((i) => (
                            <tr key={i.internship_id}>
                              <td style={{ fontWeight: 600 }}>{i.title}</td>
                              <td>{i.company_name}</td>
                              <td><span className={statusBadge(i.status)}>{i.status}</span></td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
