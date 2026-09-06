import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { globalStyles, getTheme } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import CompanyNavbar from '../../components/CompanyNavbar';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import API from '../../api/api';

function CompanyReport() {
  const { isDark } = useTheme();
  const t = getTheme(isDark);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const internId = queryParams.get('internId');

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [company, setCompany] = useState(null);
  const [internships, setInternships] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);

  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState('match_score');
  const [filterMajor, setFilterMajor] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchInternshipReport = useCallback(async (id) => {
    try {
      setLoading(true);
      const res = await API.get(`/reports/company/${company.company_id}/internships/${id}`);
      setReportData(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, [company]);

  useEffect(() => {
    if (internId && company) {
      fetchInternshipReport(internId);
    } else {
      setReportData(null);
    }
  }, [internId, company, fetchInternshipReport]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const companyRes = await API.get('/companies/me');
      const companyData = companyRes.data;
      setCompany(companyData);

      const internshipsRes = await API.get(`/reports/company/${companyData.company_id}/internships`);
      setInternships(internshipsRes.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredReport = () => {
    if (!reportData || !reportData.applicants) return [];

    let filtered = reportData.applicants.filter((a) => (a.match_score || 0) >= minScore);

    if (filterMajor) {
      filtered = filtered.filter((a) => a.major?.toLowerCase().includes(filterMajor.toLowerCase()));
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((a) => (a.status || 'pending') === filterStatus);
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'match_score') return (b.match_score || 0) - (a.match_score || 0);
      if (sortBy === 'date') return new Date(b.applied_at) - new Date(a.applied_at);
      return 0;
    });
  };

  const handleDownloadPDF = () => {
    try {
      if (!reportData) return;
      setGenerating(true);

      const doc = new jsPDF();
      const title = `Internship Report: ${reportData.internship_title || 'Unknown'}`;

      doc.setFontSize(22);
      doc.setTextColor(26, 58, 92);
      doc.text(title, 14, 25);

      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Company: ${company?.company_name || 'N/A'}`, 14, 35);
      doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 14, 41);
      doc.text(`Total Applicants: ${reportData.applicants?.length || 0}`, 14, 47);

      const tableColumn = ['Student Name', 'Major', 'Match Score', 'Status', 'Applied At'];
      const tableRows = getFilteredReport().map((a) => [
        a.name || 'Unknown',
        a.major || 'N/A',
        `${a.match_score || 0}%`,
        (a.status || 'pending').toUpperCase(),
        a.applied_at ? new Date(a.applied_at).toLocaleDateString() : 'N/A'
      ]);

      const tableConfig = {
        head: [tableColumn],
        body: tableRows,
        startY: 55,
        theme: 'grid',
        headStyles: { fillColor: [26, 84, 144], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 248, 252] }
      };

      if (typeof doc.autoTable === 'function') {
        doc.autoTable(tableConfig);
      } else if (typeof autoTable === 'function') {
        autoTable(doc, tableConfig);
      }

      doc.save(`InternEra_Report_${(reportData.internship_title || 'Report').replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      setError('An error occurred while generating the PDF.');
    } finally {
      setGenerating(false);
    }
  };

  const handleExportCSV = () => {
    try {
      if (!reportData) return;
      const filtered = getFilteredReport();
      const headers = ['Student Name,Major,Match Score,Status,Applied At'];
      const escapeCsv = (value) => {
        const raw = value === null || value === undefined ? '' : String(value);
        return `"${raw.replace(/"/g, '""')}"`;
      };
      const rows = filtered.map((a) => [
        escapeCsv(a.name || 'Unknown'),
        escapeCsv(a.major || 'N/A'),
        escapeCsv(`${a.match_score || 0}%`),
        escapeCsv(a.status || 'pending'),
        escapeCsv(a.applied_at ? new Date(a.applied_at).toLocaleDateString() : 'N/A')
      ].join(','));
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Report_${(reportData.internship_title || 'Report').replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('CSV Export Error:', err);
      setError('An error occurred while exporting the CSV.');
    }
  };

  const overviewStats = {
    total: internships.length,
    open: internships.filter((i) => i.status === 'open').length,
    pending: internships.filter((i) => i.status === 'pending').length,
    closed: internships.filter((i) => i.status === 'closed' || i.status === 'rejected').length,
    applicants: internships.reduce((acc, i) => acc + (i.total_applicants || 0), 0)
  };

  const listingStatusLabel = (status) => ({
    pending: 'Pending Review',
    open: 'Open',
    closed: 'Closed / Rejected',
    rejected: 'Closed / Rejected',
  }[status] || status || 'Pending Review');

  const listingPillClass = (status) => {
    if (status === 'open') return 'pill-accepted';
    if (status === 'pending') return 'pill-pending';
    return 'pill-rejected';
  };

  const styles = `
    ${globalStyles(isDark)}
    .report-page { padding: 100px 48px 60px; max-width: 1400px; margin: 0 auto; }
    .report-layout { display: grid; grid-template-columns: 320px 1fr; gap: 40px; }
    .sidebar { position: sticky; top: 100px; height: fit-content; }
    .side-card { background: ${t.bgCard}; border: 1px solid ${t.border}; border-radius: 20px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .side-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: ${t.textMuted}; margin-bottom: 16px; }
    .intern-item { padding: 14px 16px; border-radius: 12px; margin-bottom: 8px; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; background: ${t.bgPage}50; }
    .intern-item:hover { background: ${t.bgPage}; border-color: ${t.border}; }
    .intern-item.active { background: ${t.accent}15; border-color: ${t.accent}; }
    .main-content { min-height: 80vh; }
    .overview-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 20px; margin-bottom: 40px; }
    .overview-card { background: ${t.bgCard}; border: 1px solid ${t.border}; border-radius: 16px; padding: 24px; }
    .ov-label { font-size: 12px; color: ${t.textMuted}; font-weight: 600; margin-bottom: 8px; }
    .ov-val { font-size: 32px; font-weight: 700; color: ${t.textPrimary}; }
    .filter-bar { background: ${t.bgCard}; border: 1px solid ${t.border}; border-radius: 16px; padding: 24px; margin-bottom: 30px; display: flex; gap: 24px; flex-wrap: wrap; align-items: flex-end; }
    .filter-group { flex: 1; min-width: 150px; }
    .filter-label { font-size: 11px; font-weight: 700; color: ${t.textMuted}; text-transform: uppercase; margin-bottom: 8px; display: block; }
    .filter-input { width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid ${t.border}; background: ${t.bgPage}; color: ${t.textPrimary}; font-family: inherit; font-size: 14px; outline: none; }
    .filter-input:focus { border-color: ${t.accent}; }
    .data-table { width: 100%; border-collapse: collapse; background: ${t.bgCard}; border-radius: 16px; overflow: hidden; border: 1px solid ${t.border}; }
    .data-table th { text-align: left; padding: 16px 20px; background: ${t.bgPage}; color: ${t.textMuted}; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    .data-table td { padding: 20px; border-top: 1px solid ${t.border}; font-size: 14px; color: ${t.textPrimary}; }
    .data-table tr:hover { background: ${t.bgPage}30; }
    .status-pill { font-size: 10px; font-weight: 800; padding: 4px 12px; border-radius: 100px; text-transform: uppercase; }
    .pill-pending { background: rgba(246,173,85,0.1); color: #f6ad55; }
    .pill-accepted { background: rgba(72,187,120,0.1); color: #48bb78; }
    .pill-rejected { background: rgba(252,129,129,0.1); color: #fc8181; }
    .action-link { color: ${t.accent}; font-weight: 600; text-decoration: none; cursor: pointer; font-size: 13px; }
    .action-link:hover { text-decoration: underline; }
  `;

  if (loading && !reportData && !internships.length) {
    return <div style={{ background: t.bgPage, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Reports...</div>;
  }

  return (
    <>
      <style>{styles}</style>
      <CompanyNavbar />
      <div className="ie-page">
        <div className="ie-bg" /><div className="ie-grid" />
        <div className="report-page">
          {error && <div className="ie-error">Warning: {error}</div>}
          <div className="report-layout">
            <aside className="sidebar">
              <div className="side-card">
                <div className="side-title">Listings</div>
                <div className="intern-list">
                  <div className={`intern-item ${!internId ? 'active' : ''}`} onClick={() => navigate('/company/report')}>
                    <div style={{ fontWeight: 700 }}>Company Overview</div>
                    <div style={{ fontSize: '11px', color: t.textMuted }}>Aggregate data</div>
                  </div>
                  {internships.map((i) => (
                    <div key={i.internship_id} className={`intern-item ${internId === i.internship_id.toString() ? 'active' : ''}`}
                      onClick={() => navigate(`/company/report?internId=${i.internship_id}`)}>
                      <div style={{ fontWeight: 600 }}>{i.title}</div>
                      <div style={{ fontSize: '11px', color: t.textMuted }}>{i.total_applicants} applicants</div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <main className="main-content">
              {!reportData ? (
                <div className="ie-animate">
                  <h1 style={{ fontFamily: 'DM Serif Display', fontSize: '36px', color: t.textPrimary, marginBottom: '8px' }}>Company Performance</h1>
                  <p style={{ color: t.textMuted, marginBottom: '40px' }}>Comprehensive metrics for all your posted listings.</p>

                  <div className="overview-row">
                    <div className="overview-card"><div className="ov-label">Total Posted</div><div className="ov-val">{overviewStats.total}</div></div>
                    <div className="overview-card"><div className="ov-label">Active Listings</div><div className="ov-val" style={{ color: '#48bb78' }}>{overviewStats.open}</div></div>
                    <div className="overview-card"><div className="ov-label">Pending Listings</div><div className="ov-val" style={{ color: '#f6ad55' }}>{overviewStats.pending}</div></div>
                    <div className="overview-card"><div className="ov-label">Closed / Rejected</div><div className="ov-val" style={{ color: '#fc8181' }}>{overviewStats.closed}</div></div>
                    <div className="overview-card"><div className="ov-label">Total Applications</div><div className="ov-val" style={{ color: t.accent }}>{overviewStats.applicants}</div></div>
                  </div>

                  <div className="side-card">
                    <div className="side-title">Top Performing Listings</div>
                    <table className="data-table">
                      <thead><tr><th>Internship</th><th>Status</th><th>Applicants</th><th>Action</th></tr></thead>
                      <tbody>
                        {[...internships].sort((a, b) => b.total_applicants - a.total_applicants).map((i) => (
                          <tr key={i.internship_id}>
                            <td style={{ fontWeight: 600 }}>{i.title}</td>
                            <td><span className={`status-pill ${listingPillClass(i.status)}`}>{listingStatusLabel(i.status)}</span></td>
                            <td>{i.total_applicants}</td>
                            <td><span className="action-link" onClick={() => navigate(`/company/report?internId=${i.internship_id}`)}>View Details</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="ie-animate">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                    <div>
                      <h1 style={{ fontFamily: 'DM Serif Display', fontSize: '32px', color: t.textPrimary, marginBottom: '6px' }}>{reportData.internship_title || 'Internship Details'}</h1>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: t.textMuted }}>
                        <span>Location: {reportData.location || 'N/A'}</span>
                        <span>Status: {listingStatusLabel(reportData.status)}</span>
                      </div>
                      {reportData.status === 'pending' && <div style={{ marginTop: '8px', color: '#f6ad55', fontSize: '13px', fontWeight: 700 }}>Waiting for Admin approval.</div>}
                      {reportData.status === 'closed' && reportData.admin_rejection_reason && <div style={{ marginTop: '8px', color: '#fc8181', fontSize: '13px', fontWeight: 700 }}>{reportData.admin_rejection_reason}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button className="ie-btn ie-btn-ghost" onClick={handleExportCSV} style={{ padding: '10px 20px' }}>Export CSV</button>
                      <button className="ie-btn ie-btn-primary" onClick={handleDownloadPDF} disabled={generating} style={{ padding: '10px 24px' }}>
                        {generating ? 'Generating...' : 'Download PDF'}
                      </button>
                    </div>
                  </div>

                  <div className="filter-bar">
                    <div className="filter-group">
                      <label className="filter-label">Sort By</label>
                      <select className="filter-input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="match_score">Match Score</option>
                        <option value="date">Application Date</option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label className="filter-label">Status</label>
                      <select className="filter-input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label className="filter-label">Min Match Score</label>
                      <input className="filter-input" type="number" min="0" max="100" value={minScore} onChange={(e) => setMinScore(Number(e.target.value || 0))} />
                    </div>
                    <div className="filter-group">
                      <label className="filter-label">Major</label>
                      <input className="filter-input" value={filterMajor} onChange={(e) => setFilterMajor(e.target.value)} placeholder="Filter major..." />
                    </div>
                  </div>

                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Major</th>
                        <th>Match</th>
                        <th>Status</th>
                        <th>Applied At</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredReport().map((a) => (
                        <tr key={a.application_id}>
                          <td style={{ fontWeight: 600 }}>{a.name || 'Unknown'}</td>
                          <td>{a.major || 'N/A'}</td>
                          <td>{a.match_score || 0}%</td>
                          <td>
                            <span className={`status-pill pill-${(a.status || 'pending').toLowerCase()}`}>
                              {(a.status || 'pending').toUpperCase()}
                            </span>
                          </td>
                          <td>{a.applied_at ? new Date(a.applied_at).toLocaleDateString() : 'N/A'}</td>
                          <td>
                            <span className="action-link" onClick={() => navigate(`/company/cv/${a.student_id}`)}>View CV</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

export default CompanyReport;
