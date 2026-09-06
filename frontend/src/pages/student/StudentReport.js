import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { globalStyles, getTheme } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import StudentNavbar from '../../components/StudentNavbar';
import { jsPDF } from 'jspdf';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/api';

/*  Donut chart  */
function DonutChart({ accepted, rejected, pending, isDark }) {
  const t = getTheme(isDark);
  const total = accepted + rejected + pending;
  if (total === 0) return (
    <div style={{ color: t.textMuted, fontSize: 13, fontStyle: 'italic' }}>
      No application data yet. Start applying to see charts.
    </div>
  );
  const r = 60, cx = 80, cy = 80, stroke = 16;
  const circumference = 2 * Math.PI * r;
  const slices = [
    { value: accepted, color: '#48bb78', label: 'Accepted' },
    { value: pending,  color: '#f6ad55', label: 'Pending'  },
    { value: rejected, color: '#fc8181', label: 'Rejected' },
  ];
  let offset = 0;
  const arcs = slices.map(s => {
    const dash = (s.value / total) * circumference;
    const gap  = circumference - dash;
    const arc  = { ...s, dashArray: `${dash} ${gap}`, dashOffset: -offset };
    offset += dash;
    return arc;
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'} strokeWidth={stroke} />
        {arcs.map((arc, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={arc.color} strokeWidth={stroke}
            strokeDasharray={arc.dashArray} strokeDashoffset={arc.dashOffset}
            strokeLinecap="butt" transform="rotate(-90 80 80)" />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fill={t.textPrimary} fontSize="22" fontWeight="700">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill={t.textMuted} fontSize="11">Total</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {arcs.map((arc, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: arc.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: t.textSecondary }}>{arc.label}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: arc.color, marginLeft: 'auto' }}>{arc.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/*  Bar chart  */
function MatchBarChart({ applications, isDark }) {
  const t = getTheme(isDark);
  if (!applications.length) return <div style={{ color: t.textMuted, fontSize: 13, fontStyle: 'italic' }}>No match data yet.</div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {applications.map((app, i) => {
        const score = app.ai_match_score || app.match || 0;
        const color = score >= 80 ? '#48bb78' : score >= 60 ? '#f6ad55' : '#fc8181';
        return (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: t.textSecondary, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {app.internship_title || app.title}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color }}>{score}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0' }}>
              <div style={{ height: '100%', borderRadius: 4, background: color, width: `${score}%`, transition: 'width 0.8s ease' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/*  Main component  */
function StudentReport() {
  const { isDark } = useTheme();
  const t = getTheme(isDark);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const reportRef = useRef(null);

  useEffect(() => {
    API.get('/reports/my-student-report')
      .then(res => setReport(res.data))
      .catch(() => setError('Failed to load report. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  const apps = report?.applied_internships || [];
  const accepted = report?.accepted_applications || 0;
  const rejected = report?.rejected_applications || 0;
  const pending  = report?.pending_applications  || 0;
  const highestMatch = report?.highest_match_score || 0;
  const avgMatch     = report?.average_match_score  || 0;
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const studentName = report ? `${report.f_name} ${report.l_name}` : (user?.email || 'Student');

  const aiSummary = accepted >= 2
    ? `${studentName} has demonstrated exceptional performance with ${accepted} offer(s) and an average match score of ${avgMatch}%. Highest match of ${highestMatch}% reflects excellent skill compatibility.`
    : accepted === 1
    ? `${studentName} is progressing well, securing ${accepted} offer with an average match score of ${avgMatch}%. With ${pending} application(s) pending, there is strong potential for additional offers.`
    : `${studentName} is actively building their pipeline with ${apps.length} application(s). Average match score: ${avgMatch}%. Focus on roles above 80% match and strengthen your CV.`;

  const handleDownloadPDF = () => {
    setGenerating(true);
    setTimeout(() => {
      try {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const W = doc.internal.pageSize.getWidth();

        doc.setFillColor(11, 17, 40);
        doc.rect(0, 0, W, 42, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(232, 234, 246);
        doc.text('Intern', 14, 22);
        doc.setTextColor(99, 179, 237);
        doc.text('Era', 14 + doc.getTextWidth('Intern'), 22);
        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184);
        doc.text('Student Performance Report', 14, 33);
        doc.text(today, W - 14, 33, { align: 'right' });

        let y = 54;
        doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(30, 41, 59);
        doc.text('Student Profile', 14, y); y += 8;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(71, 85, 105);
        doc.text(`Name: ${studentName}`, 14, y); y += 6;
        doc.text(`Email: ${report?.std_email || user?.email || 'N/A'}`, 14, y); y += 6;
        doc.text(`Major: ${report?.major || 'N/A'}`, 14, y); y += 12;

        doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(30, 41, 59);
        doc.text('Key Metrics', 14, y); y += 8;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(71, 85, 105);
        doc.text(`Total Applications: ${apps.length}   Accepted: ${accepted}   Pending: ${pending}   Rejected: ${rejected}`, 14, y); y += 6;
        doc.text(`Average Match Score: ${avgMatch}%   Highest Match: ${highestMatch}%`, 14, y); y += 12;

        doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(30, 41, 59);
        doc.text('AI Summary', 14, y); y += 8;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(71, 85, 105);
        const summaryLines = doc.splitTextToSize(aiSummary, W - 28);
        doc.text(summaryLines, 14, y); y += summaryLines.length * 5 + 8;

        if (apps.length > 0) {
          doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(30, 41, 59);
          doc.text('Applied Internships', 14, y); y += 8;
          apps.forEach(app => {
            const score = app.ai_match_score || 0;
            doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(30, 41, 59);
            doc.text(` ${app.internship_title}  ${app.company_name}`, 14, y);
            doc.setFont('helvetica', 'normal'); doc.setTextColor(99, 179, 237);
            doc.text(`${score}%`, W - 14, y, { align: 'right' });
            y += 5;
            doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(100, 116, 139);
            doc.text(`Status: ${app.status}   Applied: ${app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'N/A'}`, 18, y);
            y += 7;
            if (y > 270) { doc.addPage(); y = 20; }
          });
        }

        doc.save(`InternEra_Student_Report_${studentName.replace(/\s+/g, '_')}.pdf`);
      } catch (e) { console.error(e); }
      finally { setGenerating(false); }
    }, 100);
  };

  const handlePrint = () => window.print();

  const styles = `
    ${globalStyles(isDark)}
    .report-wrap { padding: 100px 48px 60px; max-width: 900px; margin: 0 auto; }
    .report-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; flex-wrap: wrap; gap: 16px; }
    .report-title { font-family: 'DM Serif Display', serif; font-size: 36px; color: ${t.textPrimary}; margin-bottom: 4px; }
    .report-title span { color: ${t.accentLight}; font-style: italic; }
    .report-date { font-size: 13px; color: ${t.textMuted}; }
    .report-actions { display: flex; gap: 12px; }
    .report-section { background: ${t.bgCard}; border: 1px solid ${t.border}; border-radius: 16px; padding: 28px; margin-bottom: 20px; backdrop-filter: blur(8px); }
    .section-label { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: ${t.textMuted}; margin-bottom: 20px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .info-item label { display: block; font-size: 11px; font-weight: 600; color: ${t.textMuted}; margin-bottom: 4px; letter-spacing: 0.5px; text-transform: uppercase; }
    .info-item span { font-size: 14px; color: ${t.textPrimary}; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 14px; }
    .kpi-card { border-radius: 12px; padding: 18px; text-align: center; }
    .kpi-value { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
    .kpi-label { font-size: 11px; font-weight: 600; letter-spacing: 0.3px; opacity: 0.85; }
    .ai-box { background: ${isDark ? 'rgba(43,108,176,0.08)' : '#eff6ff'}; border: 1px solid ${isDark ? 'rgba(99,179,237,0.18)' : '#bfdbfe'}; border-radius: 16px; padding: 24px 28px; }
    .ai-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
    .ai-badge { font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 3px 10px; border-radius: 100px; background: ${isDark ? 'rgba(99,179,237,0.15)' : '#dbeafe'}; color: ${isDark ? '#90cdf4' : '#1d4ed8'}; border: 1px solid ${isDark ? 'rgba(99,179,237,0.25)' : '#93c5fd'}; }
    .ai-text { font-size: 14px; line-height: 1.8; color: ${t.textSecondary}; }
    .app-table { width: 100%; border-collapse: separate; border-spacing: 0 8px; }
    .app-table th { font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: ${t.textMuted}; padding: 0 16px 8px; text-align: left; }
    .app-table td { font-size: 13px; color: ${t.textPrimary}; padding: 14px 16px; background: ${isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc'}; border-top: 1px solid ${t.border}; border-bottom: 1px solid ${t.border}; }
    .app-table td:first-child { border-left: 1px solid ${t.border}; border-radius: 10px 0 0 10px; }
    .app-table td:last-child  { border-right: 1px solid ${t.border}; border-radius: 0 10px 10px 0; }
    .status-pill { font-size: 10px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; padding: 4px 10px; border-radius: 100px; display: inline-block; }
    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .admin-error { background: rgba(252,129,129,0.1); border: 1px solid rgba(252,129,129,0.2); color: #fc8181; padding: 14px 20px; border-radius: 12px; font-size: 14px; margin-bottom: 24px; }
    .admin-loading { color: ${t.textMuted}; font-size: 14px; padding: 40px; text-align: center; }
    @media (max-width: 640px) { .charts-row { grid-template-columns: 1fr; } .info-grid { grid-template-columns: 1fr; } }
    @media print {
      .ie-nav, .report-actions, .ie-bg, .ie-grid { display: none !important; }
      .report-wrap { padding: 24px; max-width: 100%; }
      body { background: #fff !important; }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="ie-page">
        <div className="ie-bg" /><div className="ie-grid" />
        <StudentNavbar />
        <div className="ie-content report-wrap">
          <div className="report-header ie-animate">
            <div>
              <h1 className="report-title">Student <span>Report</span></h1>
              <p className="report-date">... {today}</p>
            </div>
            <div className="report-actions">
              <button className="ie-btn ie-btn-ghost" style={{ padding: '10px 20px', fontSize: 13 }} onClick={handlePrint}> Print</button>
              <button className="ie-btn ie-btn-primary" style={{ padding: '10px 22px', fontSize: 13 }} onClick={handleDownloadPDF} disabled={generating || loading}>
                {generating ? 'Generating' : ' Download PDF'}
              </button>
            </div>
          </div>

          {error && <div className="admin-error">{error}</div>}
          {loading ? (
            <div className="admin-loading"> Loading your report</div>
          ) : (
            <>
              {/* Profile */}
              <div className="report-section ie-animate-2" ref={reportRef}>
                <div className="section-label">Student Profile</div>
                <div className="info-grid">
                  <div className="info-item"><label>Full Name</label><span> {studentName}</span></div>
                  <div className="info-item"><label>Email</label><span> {report?.std_email || user?.email || 'N/A'}</span></div>
                  <div className="info-item"><label>Major</label><span> {report?.major || 'N/A'}</span></div>
                  <div className="info-item"><label>Account Status</label><span>... {report?.account_status || 'Active'}</span></div>
                </div>
              </div>

              {/* KPIs */}
              <div className="report-section ie-animate-3">
                <div className="section-label">Key Metrics</div>
                <div className="kpi-grid">
                  {[
                    { label: 'Total Applications', value: apps.length,      color: '#2b6cb0', bg: isDark ? 'rgba(43,108,176,0.15)' : '#dbeafe' },
                    { label: 'Accepted',           value: accepted,          color: '#48bb78', bg: isDark ? 'rgba(72,187,120,0.12)' : '#dcfce7' },
                    { label: 'Pending',            value: pending,           color: '#f6ad55', bg: isDark ? 'rgba(246,173,85,0.12)'  : '#fef3c7' },
                    { label: 'Rejected',           value: rejected,          color: '#fc8181', bg: isDark ? 'rgba(252,129,129,0.12)' : '#fee2e2' },
                    { label: 'Avg Match Score',    value: `${avgMatch}%`,    color: '#b794f4', bg: isDark ? 'rgba(183,148,244,0.12)' : '#ede9fe' },
                    { label: 'Highest Match',      value: `${highestMatch}%`,color: '#90cdf4', bg: isDark ? 'rgba(99,179,237,0.12)'  : '#dbeafe' },
                  ].map((k, i) => (
                    <div key={i} className="kpi-card" style={{ background: k.bg }}>
                      <div className="kpi-value" style={{ color: k.color }}>{k.value}</div>
                      <div className="kpi-label" style={{ color: k.color }}>{k.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Charts */}
              <div className="charts-row ie-animate-3">
                <div className="report-section">
                  <div className="section-label">Application Breakdown</div>
                  <DonutChart accepted={accepted} rejected={rejected} pending={pending} isDark={isDark} />
                </div>
                <div className="report-section">
                  <div className="section-label">Match Scores by Role</div>
                  <MatchBarChart applications={apps} isDark={isDark} />
                </div>
              </div>

              {/* AI Summary */}
              <div className="report-section ie-animate-3">
                <div className="section-label">AI Performance Summary</div>
                <div className="ai-box">
                  <div className="ai-header">
                    <span style={{ fontSize: 20 }}></span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: t.textPrimary }}>Personalized Insights</span>
                    <span className="ai-badge">AI Generated</span>
                  </div>
                  <p className="ai-text">{aiSummary}</p>
                </div>
              </div>

              {/* Applications table */}
              <div className="report-section ie-animate-3">
                <div className="section-label">Applied Internships</div>
                {apps.length === 0 ? (
                  <div style={{ color: t.textMuted, fontSize: 13, fontStyle: 'italic' }}>No applications yet.</div>
                ) : (
                  <table className="app-table">
                    <thead>
                      <tr>
                        <th>Position</th><th>Company</th><th>Applied</th><th>Match</th><th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apps.map((app, i) => {
                        const score = app.ai_match_score || 0;
                        const sc = { accepted: { bg: 'rgba(72,187,120,0.12)', color: '#48bb78' }, rejected: { bg: 'rgba(252,129,129,0.12)', color: '#fc8181' }, pending: { bg: 'rgba(246,173,85,0.12)', color: '#f6ad55' } }[app.status] || {};
                        const mc = score >= 80 ? '#48bb78' : score >= 60 ? '#f6ad55' : '#fc8181';
                        return (
                          <tr key={i}>
                            <td style={{ fontWeight: 600 }}>{app.internship_title}</td>
                            <td style={{ color: t.textSecondary }}>{app.company_name}</td>
                            <td style={{ color: t.textMuted }}>{app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'N/A'}</td>
                            <td style={{ fontWeight: 700, color: mc }}> {score}%</td>
                            <td><span className="status-pill" style={{ background: sc.bg, color: sc.color }}>{app.status}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <button className="ie-btn ie-btn-ghost" onClick={() => navigate('/student/dashboard')} style={{ fontSize: 13 }}>
                   Back to Dashboard
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default StudentReport;
