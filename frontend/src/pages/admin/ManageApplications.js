import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import API from '../../api/api';
import { getAdminCss } from './adminCss';

function ManageApplications() {
  const { isDark } = useTheme();
  const location = useLocation();
  const urlFilter = new URLSearchParams(location.search).get('filter') || 'all';

  const [filter, setFilter] = useState(urlFilter);
  const [search, setSearch] = useState('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get('/reports/applications');
        setApplications(res.data || []);
      } catch (e) {
        setApplications([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return applications
      .filter(a => filter === 'all' || a.status === filter)
      .filter(a => [a.student_name, a.company_name, a.internship_title]
        .some(v => (v || '').toLowerCase().includes(search.toLowerCase())));
  }, [applications, filter, search]);

  const bc = s => `badge ${s === 'accepted' ? 'badge-approved' : s === 'rejected' ? 'badge-rejected' : 'badge-pending'}`;

  return (
    <>
      <style>{getAdminCss(isDark)}</style>
      <div className="admin-page">
        <div className="admin-bg" /><div className="admin-grid" />
        <AdminNavbar />
        <div className="admin-layout ie-content">
          <AdminSidebar activeId="applications" />
          <main className="admin-main">
            <div className="ie-animate">
              <h1 className="dash-greeting">View <span>Applications</span></h1>
              <p className="dash-sub">Total: {applications.length} applications</p>
            </div>
            <div className="ie-animate-2">
              <input className="search-input" placeholder="Search by student, company, or internship..."
                value={search} onChange={e => setSearch(e.target.value)} />
              <div className="filter-row">
                {['all','pending','accepted','rejected'].map(f => (
                  <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="table-wrapper ie-animate-3">
              <table className="ie-table">
                <thead><tr><th>#</th><th>Student</th><th>Company</th><th>Internship</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                  {loading
                    ? <tr><td colSpan="6" className="empty-cell">Loading...</td></tr>
                    : filtered.length === 0
                      ? <tr><td colSpan="6" className="empty-cell">No applications found</td></tr>
                      : filtered.map(a => (
                        <tr key={a.application_id}>
                          <td>{a.application_id}</td>
                          <td style={{ fontWeight: 600 }}>{a.student_name}</td>
                          <td>{a.company_name}</td>
                          <td>{a.internship_title}</td>
                          <td>{new Date(a.applied_at).toLocaleDateString()}</td>
                          <td><span className={bc(a.status)}>{a.status}</span></td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default ManageApplications;
