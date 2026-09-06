import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getTheme } from '../../theme';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import API from '../../api/api';
import { getAdminCss } from './adminCss';

const ManageInternships = () => {
  const { isDark } = useTheme();
  const t = getTheme(isDark);

  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchInternships = useCallback(() => {
    setLoading(true);
    API.get('/reports/internships')
      .then((res) => setInternships(res.data || []))
      .catch(() => setError('Failed to load internships. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchInternships();
  }, [fetchInternships]);

  const filtered = internships
    .filter((item) => statusFilter === 'all' || item.status === statusFilter)
    .filter((item) =>
      (item.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.company_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.location || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.type || '').toLowerCase().includes(search.toLowerCase())
    );

  const getBadgeClass = (status) => {
    if (status === 'open') return 'badge badge-approved';
    if (status === 'closed') return 'badge badge-closed';
    if (status === 'rejected') return 'badge badge-rejected';
    return 'badge badge-pending';
  };

  const statusLabel = (status) => ({
    pending: 'Pending',
    open: 'Open',
    closed: 'Closed',
    rejected: 'Closed',
  }[status] || status || 'Pending');

  const isUnclearNeutralRisk = (score, status) =>
    Number(score) === 50 && String(status || '').toUpperCase() === 'UNKNOWN';

  const approveInternship = async (internshipId) => {
    try {
      await API.put(`/internships/${internshipId}/admin-approve`);
      setNotice({ type: 'success', message: 'Internship approved and available to students.' });
      fetchInternships();
    } catch {
      setNotice({ type: 'error', message: 'Failed to approve internship.' });
    }
  };

  const rejectInternship = async (internshipId) => {
    try {
      await API.put(`/internships/${internshipId}/admin-reject`, {
        reason: 'Rejected by Admin due to high AI risk score.',
      });
      setNotice({ type: 'warning', message: 'Internship rejected by Admin and closed.' });
      fetchInternships();
    } catch {
      setNotice({ type: 'error', message: 'Failed to reject internship.' });
    }
  };

  const extraCss = `
    .risk-cell { display: flex; flex-direction: column; gap: 6px; min-width: 140px; }
    .risk-pill {
      display: inline-flex; width: fit-content; padding: 3px 10px; border-radius: 999px;
      font-size: 12px; font-weight: 700; border: 1px solid ${t.border};
      background: ${t.accentMuted}; color: ${t.accentLight};
    }
    .risk-pill.high { background: rgba(246,173,85,0.12); border-color: rgba(246,173,85,0.32); color: #f6ad55; }
    .risk-note { font-size: 12px; color: ${t.textMuted}; line-height: 1.45; }
    .decision-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .decision-btn {
      border-radius: 8px; padding: 7px 10px; font-size: 12px; font-weight: 700;
      cursor: pointer; background: transparent; border: 1px solid ${t.border};
      color: ${t.textPrimary};
    }
    .decision-btn.approve { color: #48bb78; border-color: rgba(72,187,120,0.35); }
    .decision-btn.reject { color: #fc8181; border-color: rgba(252,129,129,0.35); }
    .notice-box {
      padding: 14px 20px; border-radius: 12px; font-size: 14px; margin-bottom: 18px; border: 1px solid;
    }
    .notice-box.success { background: rgba(72,187,120,0.1); border-color: rgba(72,187,120,0.25); color: #48bb78; }
    .notice-box.warning { background: rgba(246,173,85,0.12); border-color: rgba(246,173,85,0.3); color: #f6ad55; }
    .notice-box.error { background: rgba(252,129,129,0.1); border-color: rgba(252,129,129,0.25); color: #fc8181; }
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
          <AdminSidebar activeId="internships" />
          <main className="admin-main">
            <div className="ie-animate">
              <h1 className="dash-greeting">View <span>Internships</span></h1>
              <p className="dash-sub">{loading ? 'Loading...' : `${internships.length} internship listings (read-only)`}</p>
            </div>

            {error && <div className="admin-error">{error}</div>}
            {notice && <div className={`notice-box ${notice.type}`}>{notice.message}</div>}

            <div className="ie-animate-2">
              <input
                className="search-input"
                placeholder="Search by title, company, type, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div className="filter-row">
                {['all', 'open', 'closed', 'pending', 'rejected'].map((s) => (
                  <button
                    key={s}
                    className={`filter-btn ${statusFilter === s ? 'active' : ''}`}
                    onClick={() => setStatusFilter(s)}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-wrapper ie-animate-3">
              {loading ? (
                <div className="admin-loading">Loading internships...</div>
              ) : (
                <table className="ie-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Company</th>
                      <th>Type / Location</th>
                      <th>Applications</th>
                      <th>AI Risk</th>
                      <th>Status</th>
                      <th>Admin Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan="8" className="empty-cell">No internships found</td></tr>
                    ) : (
                      filtered.map((item, idx) => (
                        <tr key={item.internship_id}>
                          <td style={{ color: t.textMuted }}>{idx + 1}</td>
                          <td style={{ color: t.textPrimary, fontWeight: 600 }}>{item.title}</td>
                          <td>{item.company_name}</td>
                          <td>
                            <span style={{ fontSize: '13px', display: 'block', fontWeight: 600 }}>{item.type}</span>
                            <span style={{ fontSize: '12px', color: t.textMuted }}>{item.location || 'Remote'}</span>
                          </td>
                          <td>
                            <span style={{
                              background: t.accentMuted,
                              color: t.accentLight,
                              padding: '3px 10px',
                              borderRadius: '100px',
                              fontSize: '12px',
                              fontWeight: 600,
                              border: `1px solid ${t.border}`
                            }}>
                              {item.total_applications ?? 0}
                            </span>
                          </td>
                          <td>
                            <div className="risk-cell">
                              {item.ai_risk_score !== null && item.ai_risk_score !== undefined && !isUnclearNeutralRisk(item.ai_risk_score, item.ai_risk_status) ? (
                                <>
                                  <span className={`risk-pill ${item.ai_risk_warning ? 'high' : ''}`}>
                                    {item.ai_risk_score}/100 {item.ai_risk_warning ? 'High' : 'Advisory'}
                                  </span>
                                  {item.ai_risk_warning && <span className="risk-note">High AI risk. Admin review required.</span>}
                                </>
                              ) : (
                                <span className="risk-note">Not verified yet</span>
                              )}
                            </div>
                          </td>
                          <td><span className={getBadgeClass(item.status)}>{statusLabel(item.status)}</span></td>
                          <td>
                            {item.status === 'pending' ? (
                              <div className="decision-actions">
                                <button className="decision-btn approve" onClick={() => approveInternship(item.internship_id)}>Approve</button>
                                <button className="decision-btn reject" onClick={() => rejectInternship(item.internship_id)}>Reject</button>
                              </div>
                            ) : (
                              <div className="risk-note">
                                {item.status === 'open' ? 'Approved by Admin' : 'Closed / Rejected'}
                              </div>
                            )}
                            {item.admin_rejection_reason && <div className="risk-note" style={{ marginTop: 6 }}>{item.admin_rejection_reason}</div>}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default ManageInternships;
