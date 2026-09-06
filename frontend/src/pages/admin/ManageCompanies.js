import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import API from '../../api/api';
import { getAdminCss } from './adminCss';

function ManageCompanies() {
  const { isDark } = useTheme();
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get('/companies/');
        setCompanies(res.data || []);
      } catch (e) {
        setCompanies([]);
      }
    })();
  }, []);

  const filtered = useMemo(() => companies.filter(c =>
    [c.company_name, c.company_email, c.location].some(v => (v || '').toLowerCase().includes(search.toLowerCase()))), [companies, search]);

  const bc = s => `badge ${s ? 'badge-approved' : 'badge-pending'}`;

  return (
    <>
      <style>{getAdminCss(isDark)}</style>
      <div className="admin-page">
        <div className="admin-bg" /><div className="admin-grid" />
        <AdminNavbar />
        <div className="admin-layout ie-content">
          <AdminSidebar activeId="companies" />
          <main className="admin-main">
            <div className="ie-animate">
              <h1 className="dash-greeting">View <span>Companies</span></h1>
              <p className="dash-sub">Total: {companies.length} companies</p>
            </div>
            <div className="ie-animate-2">
              <input className="search-input" placeholder="Search by name, email, or location..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="table-wrapper ie-animate-3">
              <table className="ie-table">
                <thead><tr><th>#</th><th>Company Name</th><th>Email</th><th>Location</th><th>Verified</th></tr></thead>
                <tbody>
                  {filtered.length === 0
                    ? <tr><td colSpan="5" className="empty-cell">No companies found</td></tr>
                    : filtered.map(c => (
                      <tr key={c.company_id}>
                        <td>{c.company_id}</td>
                        <td style={{ fontWeight: 600 }}>{c.company_name}</td>
                        <td>{c.company_email || 'N/A'}</td>
                        <td>{c.location || 'N/A'}</td>
                        <td><span className={bc(c.is_verified)}>{c.is_verified ? 'verified' : 'pending'}</span></td>
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

export default ManageCompanies;
