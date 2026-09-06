import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import API from '../../api/api';
import { getAdminCss } from './adminCss';

function ManageStudents() {
  const { isDark } = useTheme();
  const location = useLocation();
  const urlMajor = new URLSearchParams(location.search).get('major') || 'all';

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [majorFilter, setMajorFilter] = useState(urlMajor);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/reports/students');
      setStudents(res.data || []);
    } catch {
      setError('Failed to load students. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const majors = ['all', 'Computer Science', 'Information Systems', 'Software Engineering', 'IT'];

  const filtered = students
    .filter((s) => majorFilter === 'all' || s.major === majorFilter)
    .filter((s) =>
      [`${s.f_name} ${s.l_name}`, s.std_email, s.major]
        .some((v) => String(v || '').toLowerCase().includes(search.toLowerCase()))
    );

  const badgeClass = (status) =>
    status === 'active' ? 'badge badge-approved'
      : status === 'inactive' ? 'badge badge-rejected'
        : 'badge badge-pending';

  const accentStrong = isDark ? '#90cdf4' : '#1e40af';

  return (
    <>
      <style>{getAdminCss(isDark)}</style>
      <div className="admin-page">
        <div className="admin-bg" /><div className="admin-grid" />
        <AdminNavbar />
        <div className="admin-layout ie-content">
          <AdminSidebar activeId="students" />
          <main className="admin-main">
            <div className="ie-animate">
              <h1 className="dash-greeting">View <span>Students</span></h1>
              <p className="dash-sub">Total: {students.length} registered students</p>
            </div>

            {error && (
              <div style={{ background: 'rgba(252,129,129,0.1)', border: '1px solid rgba(252,129,129,0.2)', color: '#fc8181', padding: '14px 20px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px' }}>
                {error}
              </div>
            )}
            <div className="ie-animate-2">
              <input
                className="search-input"
                placeholder="Search by name, email, or major..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="filter-row">
                {majors.map((m) => (
                  <button
                    key={m}
                    className={`filter-btn ${majorFilter === m ? 'active' : ''}`}
                    onClick={() => setMajorFilter(m)}
                  >
                    {m === 'all' ? 'All Majors' : m}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-wrapper ie-animate-3">
              {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading students...</div>
              ) : (
                <table className="ie-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Major</th>
                      <th>Applications</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan="6" className="empty-cell">No students found</td></tr>
                    ) : filtered.map((s, idx) => (
                      <tr key={s.std_id}>
                        <td style={{ color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ fontWeight: 600 }}>{s.f_name} {s.l_name}</td>
                        <td>{s.std_email}</td>
                        <td>{s.major}</td>
                        <td>
                          <span style={{ background: isDark ? 'rgba(99,179,237,0.12)' : 'rgba(29,78,216,0.14)', color: accentStrong, padding: '3px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: 600 }}>
                            {s.total_applications}
                          </span>
                        </td>
                        <td><span className={badgeClass(s.status)}>{s.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </main>
        </div>

      </div>
    </>
  );
}

export default ManageStudents;
