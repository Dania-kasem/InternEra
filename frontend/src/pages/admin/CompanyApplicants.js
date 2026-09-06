import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import API from '../../api/api';
import { getAdminCss } from './adminCss';

function CompanyApplicants() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { companyName } = useParams();
  const decodedName = decodeURIComponent(companyName);

  const [filter, setFilter] = useState('all');
  const [internshipFilter, setInternshipFilter] = useState('all');
  const [applicants, setApplicants] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get('/reports/applications');
        const mapped = (res.data || [])
          .filter(a => (a.company_name || '') === decodedName)
          .map(a => ({
            id: a.application_id,
            student: a.student_name,
            major: a.student_major,
            internship: a.internship_title,
            date: a.applied_at,
            status: a.status
          }));
        setApplicants(mapped);
      } catch (e) {
        setApplicants([]);
      }
    })();
  }, [decodedName]);

  const uniqueInternships = useMemo(() => [...new Set(applicants.map(a => a.internship))], [applicants]);
  const filtered = applicants
    .filter(a => filter === 'all' || a.status === filter)
    .filter(a => internshipFilter === 'all' || a.internship === internshipFilter);

  const bc = s => `badge ${s === 'accepted' ? 'badge-approved' : s === 'rejected' ? 'badge-rejected' : 'badge-pending'}`;

  return (
    <>
      <style>{getAdminCss(isDark)}</style>
      <div className="admin-page"><div className="admin-bg" /><div className="admin-grid" /><AdminNavbar />
        <div className="admin-layout ie-content"><AdminSidebar activeId="reports" />
          <main className="admin-main">
            <button onClick={() => navigate('/admin/reports')} className="filter-btn" style={{ marginBottom: 20 }}>Back to Reports</button>
            <h1 className="dash-greeting"><span>{decodedName}</span></h1>
            <p className="dash-sub">Applicants for {decodedName}</p>
            <div className="filter-row">{['all','pending','accepted','rejected'].map(f => <button key={f} className={`filter-btn ${filter===f?'active':''}`} onClick={() => setFilter(f)}>{f}</button>)}</div>
            <div className="filter-row"><button className={`filter-btn ${internshipFilter==='all'?'active':''}`} onClick={() => setInternshipFilter('all')}>all</button>{uniqueInternships.map(t => <button key={t} className={`filter-btn ${internshipFilter===t?'active':''}`} onClick={() => setInternshipFilter(t)}>{t}</button>)}</div>
            <div className="table-wrapper"><table className="ie-table"><thead><tr><th>#</th><th>Student</th><th>Major</th><th>Internship</th><th>Date</th><th>Status</th></tr></thead><tbody>
              {filtered.length===0 ? <tr><td colSpan="6" className="empty-cell">No applicants found</td></tr> : filtered.map(a => <tr key={a.id}><td>{a.id}</td><td>{a.student}</td><td>{a.major}</td><td>{a.internship}</td><td>{new Date(a.date).toLocaleDateString()}</td><td><span className={bc(a.status)}>{a.status}</span></td></tr>)}
            </tbody></table></div>
          </main>
        </div>
      </div>
    </>
  );
}

export default CompanyApplicants;
