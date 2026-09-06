import { useMemo, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import API from '../../api/api';
import { getAdminCss } from './adminCss';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function GenerateReports() {
  const { isDark } = useTheme();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generatedAtLabel = useMemo(() => {
    if (!report?.generated_at) return '-';
    return new Date(report.generated_at).toLocaleString();
  }, [report]);

  const hasAnyData = useMemo(() => {
    if (!report) return false;
    return [
      report.total_users,
      report.total_internships,
      report.total_applications,
      report.total_messages,
      report.total_saved_internships,
      report.cv_analysis_statistics?.total_cv_analyses || 0,
      report.most_active_companies?.length || 0,
      report.most_applied_internships?.length || 0,
      report.students_with_highest_match_scores?.length || 0,
    ].some((v) => Number(v || 0) > 0);
  }, [report]);

  const generateReport = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/reports/full-system');
      setReport(res.data || null);
    } catch {
      setError('Failed to generate report. Please try again.');
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const downloadPdfReport = () => {
    if (!report) return;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const today = new Date().toISOString().slice(0, 10);
    const logoPrimary = [26, 46, 66];
    const logoAccent = [43, 108, 176];

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(21);
    doc.setTextColor(...logoPrimary);
    doc.text('Intern', 14, 15);
    doc.setFont('helvetica', 'bolditalic');
    doc.setTextColor(...logoAccent);
    doc.text('Era', 34.5, 15);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setFillColor(219, 234, 254);
    doc.setDrawColor(147, 197, 253);
    doc.setTextColor(43, 108, 176);
    doc.roundedRect(49.5, 8.5, 20, 7.5, 1, 1, 'FD');
    doc.text('ADMIN', 53.5, 13.6);
    doc.setTextColor(33, 37, 41);
    doc.setFontSize(13);
    doc.text('Admin Full System Status Report', 14, 24);
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date(report.generated_at).toLocaleString()}`, 14, 30);

    const summaryRows = [
      ['Total Users', String(report.total_users || 0)],
      ['Students', String(report.number_of_students || 0)],
      ['Companies', String(report.number_of_companies || 0)],
      ['Admins', String(report.number_of_admins || 0)],
      ['Total Internships', String(report.total_internships || 0)],
      ['Active Internships', String(report.active_internships || 0)],
      ['Closed/Filled Internships', String(report.closed_or_filled_internships || 0)],
      ['Pending Company Approvals', String(report.pending_company_approvals || 0)],
      ['Approved Companies', String(report.approved_companies || 0)],
      ['Rejected Companies', String(report.rejected_companies || 0)],
      ['Total Applications', String(report.total_applications || 0)],
      ['Pending Applications', String(report.pending_applications || 0)],
      ['Accepted Applications', String(report.accepted_applications || 0)],
      ['Rejected Applications', String(report.rejected_applications || 0)],
      ['Total Saved Internships', String(report.total_saved_internships || 0)],
      ['Total Messages', String(report.total_messages || 0)],
    ];

    const baseHead = isDark ? [43, 108, 176] : [59, 130, 246];
    const accentHead = isDark ? [72, 187, 120] : [22, 163, 74];
    const warnHead = isDark ? [246, 173, 85] : [217, 119, 6];

    autoTable(doc, {
      startY: 36,
      head: [['Metric', 'Value']],
      body: summaryRows,
      styles: { fontSize: 9, cellPadding: 2.5 },
      headStyles: { fillColor: baseHead, textColor: [255, 255, 255] },
    });

    autoTable(doc, {
      startY: (doc.lastAutoTable?.finalY || 80) + 7,
      head: [['CV Analysis Metric', 'Value']],
      body: [
        ['Total CV Analyses', String(report.cv_analysis_statistics?.total_cv_analyses || 0)],
        ['Analyses With Summary', String(report.cv_analysis_statistics?.analyses_with_summary || 0)],
        ['Analyses With Matched Internships', String(report.cv_analysis_statistics?.analyses_with_matched_internships || 0)],
        ['Average Match Score', String(report.cv_analysis_statistics?.average_application_match_score ?? 'N/A')],
        ['Highest Match Score', String(report.cv_analysis_statistics?.highest_application_match_score ?? 'N/A')],
      ],
      styles: { fontSize: 9, cellPadding: 2.5 },
      headStyles: { fillColor: accentHead, textColor: [255, 255, 255] },
    });

    autoTable(doc, {
      startY: (doc.lastAutoTable?.finalY || 120) + 7,
      head: [['Most Active Companies', 'Applications', 'Internships']],
      body: (report.most_active_companies || []).length
        ? report.most_active_companies.map((c) => [c.company_name, String(c.applications_count), String(c.internships_count)])
        : [['No data', '0', '0']],
      styles: { fontSize: 9, cellPadding: 2.5 },
      headStyles: { fillColor: warnHead, textColor: [255, 255, 255] },
    });

    autoTable(doc, {
      startY: (doc.lastAutoTable?.finalY || 160) + 7,
      head: [['Most Applied Internships', 'Company', 'Applications']],
      body: (report.most_applied_internships || []).length
        ? report.most_applied_internships.map((i) => [i.title, i.company_name, String(i.applications_count)])
        : [['No data', '-', '0']],
      styles: { fontSize: 9, cellPadding: 2.5 },
      headStyles: { fillColor: baseHead, textColor: [255, 255, 255] },
    });

    autoTable(doc, {
      startY: (doc.lastAutoTable?.finalY || 200) + 7,
      head: [['Top Students by Match', 'Major', 'Highest', 'Average']],
      body: (report.students_with_highest_match_scores || []).length
        ? report.students_with_highest_match_scores.map((s) => [
          s.student_name,
          s.major || 'N/A',
          String(s.highest_match_score ?? 'N/A'),
          String(s.average_match_score ?? 'N/A'),
        ])
        : [['No data', '-', '-', '-']],
      styles: { fontSize: 9, cellPadding: 2.5 },
      headStyles: { fillColor: accentHead, textColor: [255, 255, 255] },
    });

    const summaryY = (doc.lastAutoTable?.finalY || 240) + 8;
    doc.setFontSize(10);
    doc.text('General System Summary', 14, summaryY);
    doc.setFontSize(9);
    const wrapped = doc.splitTextToSize(report.general_system_summary || 'N/A', 180);
    doc.text(wrapped, 14, summaryY + 5);

    doc.save(`InternEra_Admin_Full_System_Report_${today}.pdf`);
  };

  const cardStyle = {
    background: isDark ? 'rgba(30,41,59,0.7)' : '#ffffff',
    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '20px',
    backdropFilter: 'blur(8px)',
  };

  const extraCss = `
    .report-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 12px; }
    .report-grid { display: grid; grid-template-columns: repeat(4, minmax(180px, 1fr)); gap: 14px; margin: 22px 0; }
    .metric-card { border-radius: 14px; padding: 16px; background: ${isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc'}; border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}; min-width: 0; }
    .metric-label { font-size: 12px; color: ${isDark ? '#a0aec0' : '#64748b'}; }
    .metric-value { font-size: 24px; font-weight: 700; margin-top: 6px; color: ${isDark ? '#f7fafc' : '#1e293b'}; }
    .report-layout-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 20px; }
    .report-list { margin: 0; padding: 0; list-style: none; }
    .report-list li { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px dashed ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}; }
    .report-list li:last-child { border-bottom: none; }
    .report-empty, .report-loading, .report-error {
      border-radius: 14px;
      padding: 18px;
      margin-top: 18px;
      font-size: 14px;
    }
    .report-empty { background: ${isDark ? 'rgba(66,153,225,0.08)' : '#eff6ff'}; border: 1px solid ${isDark ? 'rgba(66,153,225,0.25)' : '#bfdbfe'}; color: ${isDark ? '#90cdf4' : '#1d4ed8'}; }
    .report-loading { background: ${isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc'}; border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}; color: ${isDark ? '#cbd5e0' : '#475569'}; }
    .report-error { background: ${isDark ? 'rgba(252,129,129,0.12)' : '#fef2f2'}; border: 1px solid ${isDark ? 'rgba(252,129,129,0.28)' : '#fecaca'}; color: ${isDark ? '#feb2b2' : '#b91c1c'}; }
    .summary-paragraph { margin: 0; line-height: 1.7; color: ${isDark ? '#cbd5e0' : '#334155'}; }
    @media (max-width: 1200px) {
      .report-grid { grid-template-columns: repeat(3, minmax(180px, 1fr)); }
    }
    @media (max-width: 900px) {
      .report-grid { grid-template-columns: repeat(2, minmax(150px, 1fr)); }
      .report-layout-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 520px) {
      .report-grid { grid-template-columns: 1fr; }
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
          <AdminSidebar activeId="reports" />
          <main className="admin-main">
            <div className="ie-animate">
              <h1 className="dash-greeting">System <span>Reports</span></h1>
              <p className="dash-sub">Generate a full real-time status report for all platform activity.</p>
              <div className="report-actions">
                <button className="quick-btn" onClick={generateReport} disabled={loading}>
                  {loading ? 'Generating...' : 'Generate Report'}
                </button>
                {report && (
                  <button className="quick-btn" onClick={downloadPdfReport}>
                    Download PDF
                  </button>
                )}
              </div>
            </div>

            {loading && <div className="report-loading">Building report from live system data...</div>}
            {error && <div className="report-error">{error}</div>}

            {!loading && !error && !report && (
              <div className="report-empty">
                Click <strong>Generate Report</strong> to view the current system status.
              </div>
            )}

            {!loading && report && !hasAnyData && (
              <div className="report-empty">
                No reportable data is available yet. As activity starts, system insights will appear here.
              </div>
            )}

            {!loading && report && hasAnyData && (
              <>
                <div className="report-grid ie-animate-2">
                  <div className="metric-card"><div className="metric-label">Total Users</div><div className="metric-value">{report.total_users || 0}</div></div>
                  <div className="metric-card"><div className="metric-label">Students</div><div className="metric-value">{report.number_of_students || 0}</div></div>
                  <div className="metric-card"><div className="metric-label">Companies</div><div className="metric-value">{report.number_of_companies || 0}</div></div>
                  <div className="metric-card"><div className="metric-label">Admins</div><div className="metric-value">{report.number_of_admins || 0}</div></div>
                  <div className="metric-card"><div className="metric-label">Total Internships</div><div className="metric-value">{report.total_internships || 0}</div></div>
                  <div className="metric-card"><div className="metric-label">Active Internships</div><div className="metric-value">{report.active_internships || 0}</div></div>
                  <div className="metric-card"><div className="metric-label">Closed/Filled</div><div className="metric-value">{report.closed_or_filled_internships || 0}</div></div>
                  <div className="metric-card"><div className="metric-label">Pending Company Approvals</div><div className="metric-value">{report.pending_company_approvals || 0}</div></div>
                  <div className="metric-card"><div className="metric-label">Approved Companies</div><div className="metric-value">{report.approved_companies || 0}</div></div>
                  <div className="metric-card"><div className="metric-label">Rejected Companies</div><div className="metric-value">{report.rejected_companies || 0}</div></div>
                  <div className="metric-card"><div className="metric-label">Total Applications</div><div className="metric-value">{report.total_applications || 0}</div></div>
                  <div className="metric-card"><div className="metric-label">Pending Applications</div><div className="metric-value">{report.pending_applications || 0}</div></div>
                  <div className="metric-card"><div className="metric-label">Accepted Applications</div><div className="metric-value">{report.accepted_applications || 0}</div></div>
                  <div className="metric-card"><div className="metric-label">Rejected Applications</div><div className="metric-value">{report.rejected_applications || 0}</div></div>
                  <div className="metric-card"><div className="metric-label">Total Saved Internships</div><div className="metric-value">{report.total_saved_internships || 0}</div></div>
                  <div className="metric-card"><div className="metric-label">Total Messages</div><div className="metric-value">{report.total_messages || 0}</div></div>
                </div>

                <div style={{ ...cardStyle, marginBottom: 18 }} className="ie-animate-3">
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Report Generated At</div>
                  <div style={{ color: isDark ? '#cbd5e0' : '#334155', fontSize: 14 }}>{generatedAtLabel}</div>
                </div>

                <div className="report-layout-grid">
                  <section style={cardStyle}>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>CV Analysis Statistics</div>
                    <ul className="report-list">
                      <li><span>Total CV Analyses</span><strong>{report.cv_analysis_statistics?.total_cv_analyses || 0}</strong></li>
                      <li><span>With Summary</span><strong>{report.cv_analysis_statistics?.analyses_with_summary || 0}</strong></li>
                      <li><span>With Matched Internships</span><strong>{report.cv_analysis_statistics?.analyses_with_matched_internships || 0}</strong></li>
                      <li><span>Average Match Score</span><strong>{report.cv_analysis_statistics?.average_application_match_score ?? 'N/A'}</strong></li>
                      <li><span>Highest Match Score</span><strong>{report.cv_analysis_statistics?.highest_application_match_score ?? 'N/A'}</strong></li>
                    </ul>
                  </section>

                  <section style={cardStyle}>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Most Active Companies</div>
                    <ul className="report-list">
                      {(report.most_active_companies || []).length === 0 && <li><span>No data</span><strong>-</strong></li>}
                      {(report.most_active_companies || []).map((c) => (
                        <li key={c.company_id}>
                          <span>{c.company_name}</span>
                          <strong>{c.applications_count} apps / {c.internships_count} internships</strong>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section style={cardStyle}>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Most Applied Internships</div>
                    <ul className="report-list">
                      {(report.most_applied_internships || []).length === 0 && <li><span>No data</span><strong>-</strong></li>}
                      {(report.most_applied_internships || []).map((i) => (
                        <li key={i.internship_id}>
                          <span>{i.title} ({i.company_name})</span>
                          <strong>{i.applications_count}</strong>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section style={cardStyle}>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Students With Highest Match Scores</div>
                    <ul className="report-list">
                      {(report.students_with_highest_match_scores || []).length === 0 && <li><span>No data</span><strong>-</strong></li>}
                      {(report.students_with_highest_match_scores || []).map((s) => (
                        <li key={s.std_id}>
                          <span>{s.student_name}</span>
                          <strong>{s.highest_match_score ?? 'N/A'}</strong>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                <section style={cardStyle}>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>General System Summary</div>
                  <p className="summary-paragraph">{report.general_system_summary}</p>
                </section>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

export default GenerateReports;
