import { useTheme } from '../../context/ThemeContext';
import CompanyNavbar from '../../components/CompanyNavbar';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { globalStyles, getTheme } from '../../theme';
import API from '../../api/api';

function ManageInternships() {
  const { isDark } = useTheme();
  const t = getTheme(isDark);
  const navigate = useNavigate();

  const [internships, setInternships] = useState([]);
  const [error, setError] = useState(null);
  const [editingInternship, setEditingInternship] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const showNotice = (message, type = 'success') => {
    setNotice({ message, type });
    setTimeout(() => setNotice(null), 3600);
  };

  const fetchInternships = useCallback(async () => {
    try {
      const companyRes = await API.get('/companies/me');
      const company = companyRes.data;
      const res = await API.get(`/reports/company/${company.company_id}/internships`);
      const data = res.data || [];

      const mapped = data.map((i) => ({
        id: i.internship_id,
        internship_id: i.internship_id,
        title: i.title,
        location: i.location || 'N/A',
        duration: i.duration || 'N/A',
        applicants: i.total_applicants || 0,
        status: i.status || 'pending',
        rejectionReason: i.admin_rejection_reason || '',
        deadline: i.deadline || '',
        description: i.description || '',
        type: i.type || 'onsite'
      }));

      setInternships(mapped);
    } catch (e) {
      console.error(e);
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    fetchInternships();
  }, [fetchInternships]);

  const handleEdit = (internship) => {
    setEditingInternship({ ...internship });
  };

  const handleSaveEdit = async () => {
    if (!editingInternship.title || editingInternship.title.length < 5) {
      showNotice('Title must be at least 5 characters.', 'error');
      return;
    }

    setSaving(true);
    try {
      await API.put(`/internships/${editingInternship.internship_id}`, {
        title: editingInternship.title,
        description: editingInternship.description,
        deadline: editingInternship.deadline || null,
        location: editingInternship.location,
        type: editingInternship.type,
        duration: editingInternship.duration
      });
      setEditingInternship(null);
      await fetchInternships();
      showNotice('Internship updated successfully.');
    } catch (err) {
      showNotice(err?.response?.data?.detail || err.message || 'Failed to update internship.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const styles = `
    ${globalStyles(isDark)}
    .manage-container { position: relative; z-index: 1; max-width: 1000px; margin: 0 auto; padding: 0 24px 60px; }
    .manage-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
    .manage-title { font-family: 'DM Serif Display', serif; font-size: 36px; color: ${t.textPrimary}; margin-bottom: 8px; }
    .manage-sub { font-size: 14px; color: ${t.textMuted}; }
    .intern-row { background: ${t.bgCard}; border: 1px solid ${t.border}; border-radius: 20px; padding: 24px; margin-bottom: 16px; display: flex; align-items: center; gap: 24px; transition: all 0.3s; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .intern-row:hover { border-color: ${t.accent}; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
    .intern-icon { width: 56px; height: 56px; border-radius: 16px; background: ${t.accent}15; border: 1px solid ${t.accent}20; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; flex-shrink: 0; }
    .intern-info { flex: 1; }
    .intern-title { font-size: 18px; font-weight: 600; color: ${t.textPrimary}; margin-bottom: 6px; }
    .intern-meta { font-size: 13px; color: ${t.textMuted}; display: flex; gap: 16px; flex-wrap: wrap; }
    .status-badge { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 100px; border: 1px solid transparent; }
    .status-open { background: #dcfce7; color: #166534; border-color: #bbf7d0; }
    .status-pending { background: #fef3c7; color: #92400e; border-color: #fde68a; }
    .status-closed { background: #fee2e2; color: #991b1b; border-color: #fecaca; }
    .status-note { margin-top: 8px; font-size: 12px; color: ${t.textMuted}; }
    .applicants-info { text-align: right; margin-right: 12px; }
    .applicants-count { font-size: 20px; font-weight: 700; color: ${t.textPrimary}; display: block; }
    .applicants-label { font-size: 11px; color: ${t.textMuted}; text-transform: uppercase; }
    .action-group { display: flex; gap: 8px; }
    .action-btn { padding: 10px 20px; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s; border: none; font-family: inherit; }
    .btn-edit { background: ${t.bgCardHover}; color: ${t.textPrimary}; border: 1px solid ${t.border}; }
    .btn-edit:hover { border-color: ${t.accent}; }
    .btn-view { background: ${t.accent}; color: white; }
    .btn-view:hover { opacity: 0.9; transform: translateY(-1px); }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-box { background: ${t.bgCard}; border: 1px solid ${t.border}; border-radius: 24px; width: 90%; max-width: 550px; padding: 40px; box-shadow: 0 30px 60px rgba(0,0,0,0.4); }
    .modal-title { font-family: 'DM Serif Display', serif; font-size: 28px; color: ${t.textPrimary}; margin-bottom: 24px; }
    .form-group { margin-bottom: 20px; }
    .form-label { display: block; font-size: 13px; font-weight: 600; color: ${t.textSub}; margin-bottom: 8px; }
    .form-input, .form-textarea, .form-select { width: 100%; padding: 14px; border-radius: 12px; background: ${t.bgPage}; border: 1px solid ${t.border}; color: ${t.textPrimary}; font-family: inherit; outline: none; }
    .modal-footer { display: flex; gap: 12px; margin-top: 32px; }
    .empty-state { text-align: center; padding: 80px 40px; background: ${t.bgCard}; border-radius: 24px; border: 1px dashed ${t.border}; }
    .site-notice {
      position: fixed; top: 86px; right: 48px; z-index: 200;
      max-width: min(420px, calc(100vw - 32px)); padding: 14px 16px; border-radius: 12px;
      background: ${isDark ? 'rgba(10,15,30,0.96)' : '#ffffff'};
      border: 1px solid ${t.borderHover}; box-shadow: 0 18px 44px rgba(0,0,0,0.22);
      color: ${t.textPrimary}; font-size: 14px; line-height: 1.5;
    }
    .site-notice.success { border-color: rgba(72,187,120,0.45); }
    .site-notice.error { border-color: rgba(252,129,129,0.45); }
    .site-notice-title { font-size: 12px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 4px; color: ${t.accentLight}; }
    .site-notice.error .site-notice-title { color: #fc8181; }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="ie-page">
        <div className="ie-bg" /><div className="ie-grid" />
        {notice && (
          <div className={`site-notice ${notice.type}`}>
            <div className="site-notice-title">{notice.type === 'error' ? 'Action needed' : 'InternEra'}</div>
            <div>{notice.message}</div>
          </div>
        )}
        <CompanyNavbar>
          <button className="action-btn btn-edit" style={{ background: 'transparent' }} onClick={() => navigate('/company/dashboard')}>
            Back to Dashboard
          </button>
        </CompanyNavbar>

        <div className="manage-container">
          <div className="manage-header">
            <div>
              <h1 className="manage-title">My Internships</h1>
              <p className="manage-sub">
                {internships.filter((i) => i.status === 'open').length} active listings · {internships.filter((i) => i.status === 'pending').length} pending review
              </p>
            </div>
            <button className="action-btn btn-view" onClick={() => navigate('/company/post')}>
              + Post New Listing
            </button>
          </div>

          {error && <div style={{ color: 'red', marginBottom: '20px', padding: '12px', background: '#fee2e2', borderRadius: '10px' }}>Warning: {error}</div>}

          <div className="intern-list">
            {internships.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>No Data</div>
                <h3 style={{ color: t.textPrimary, marginBottom: '8px' }}>No internships yet</h3>
                <p style={{ color: t.textMuted, marginBottom: '24px' }}>Start by posting your first internship listing.</p>
                <button className="action-btn btn-view" onClick={() => navigate('/company/post')}>Post Internship</button>
              </div>
            ) : internships.map((i) => (
              <div className="intern-row" key={i.id}>
                <div className="intern-icon">IN</div>
                <div className="intern-info">
                  <div className="intern-title">{i.title}</div>
                  <div className="intern-meta">
                    <span>{i.location}</span>
                    <span>{i.duration}</span>
                    <span className={`status-badge ${i.status === 'open' ? 'status-open' : i.status === 'pending' ? 'status-pending' : 'status-closed'}`}>
                      {i.status === 'pending' ? 'Pending Review' : i.status === 'closed' ? 'Closed / Rejected' : 'Open'}
                    </span>
                    <span>{i.deadline || 'No deadline'}</span>
                  </div>
                  {i.status === 'pending' && <div className="status-note">Waiting for Admin approval.</div>}
                  {i.status === 'closed' && i.rejectionReason && <div className="status-note">{i.rejectionReason}</div>}
                </div>

                <div className="applicants-info">
                  <span className="applicants-count">{i.applicants}</span>
                  <span className="applicants-label">Applicants</span>
                </div>

                <div className="action-group">
                  <button className="action-btn btn-edit" onClick={() => handleEdit(i)}>Edit</button>
                  <button className="action-btn btn-view" onClick={() => navigate(`/company/applicants/${i.id}`)}>Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {editingInternship && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="modal-title">Edit Listing</h2>

            <div className="form-group">
              <label className="form-label">Job Title</label>
              <input className="form-input" value={editingInternship.title} onChange={(e) => setEditingInternship({ ...editingInternship, title: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" style={{ minHeight: '120px' }} value={editingInternship.description} onChange={(e) => setEditingInternship({ ...editingInternship, description: e.target.value })} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" value={editingInternship.location} onChange={(e) => setEditingInternship({ ...editingInternship, location: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Deadline</label>
                <input className="form-input" type="date" value={editingInternship.deadline || ''} onChange={(e) => setEditingInternship({ ...editingInternship, deadline: e.target.value })} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Admin Status</label>
              <div className="form-input" style={{ opacity: 0.82 }}>
                {editingInternship.status === 'pending' ? 'Pending Review - Waiting for Admin approval.' : editingInternship.status === 'open' ? 'Open - Approved by Admin.' : 'Closed / Rejected'}
              </div>
            </div>

            <div className="modal-footer">
              <button className="action-btn btn-edit" style={{ flex: 1 }} onClick={() => setEditingInternship(null)}>Cancel</button>
              <button className="action-btn btn-view" style={{ flex: 2 }} onClick={handleSaveEdit} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ManageInternships;
