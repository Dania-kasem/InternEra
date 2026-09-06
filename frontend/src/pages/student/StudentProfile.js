import StudentNavbar from '../../components/StudentNavbar';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { globalStyles, getTheme } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/api';
import { getStoredToken } from '../../api/api';
import { API_BASE_URL } from '../../api/api';

function StudentProfile() {
  const { isDark } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    major: '',
    phone: '',
    bio: '',
    university: 'Yarmouk University',
    graduation_year: '2026',
    gpa: '',
    linkedin: '',
    github: '',
    cv_filename: '',
    rec_letter_filename: ''
  });

  const getFileName = (path = '') => {
    if (!path) return '';
    const parts = String(path).split(/[\\/]/);
    return parts[parts.length - 1] || '';
  };

  const showNotice = (message, type = 'success') => {
    setNotice({ message, type });
    setTimeout(() => setNotice(null), 3600);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const savedProfileRaw = localStorage.getItem('ie_student_profile');
        const savedProfile = savedProfileRaw ? JSON.parse(savedProfileRaw) : {};

        let backendData = null;
        try {
          const res = await API.get('/reports/my-student-report');
          backendData = res.data || null;
        } catch {
          backendData = null;
        }

        let backendStudentProfile = null;
        let backendProfileLoaded = false;
        try {
          const res = await API.get('/students/me/profile');
          backendStudentProfile = res.data || null;
          backendProfileLoaded = true;
        } catch {
          backendStudentProfile = null;
        }

        const merged = {
          full_name: backendData ? `${backendData.f_name || ''} ${backendData.l_name || ''}`.trim() : (savedProfile.full_name || user?.name || ''),
          email: backendData?.std_email || savedProfile.email || user?.email || '',
          major: backendData?.major || savedProfile.major || '',
          phone: savedProfile.phone || '',
          bio: savedProfile.bio || '',
          university: savedProfile.university || 'Yarmouk University',
          graduation_year: savedProfile.graduation_year || '2026',
          gpa: savedProfile.gpa || '',
          linkedin: savedProfile.linkedin || '',
          github: savedProfile.github || '',
          cv_filename: backendProfileLoaded
            ? (backendStudentProfile?.cv_path ? getFileName(backendStudentProfile.cv_path) : '')
            : (savedProfile.cv_filename || ''),
          rec_letter_filename: savedProfile.rec_letter_filename || ''
        };

        setProfile(merged);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSave = async () => {
    setLoading(true);
    localStorage.setItem('ie_student_profile', JSON.stringify(profile));
    setLoading(false);
    setSaved(true);
    showNotice('Profile saved successfully.');
    setTimeout(() => setSaved(false), 3000);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(file.type)) {
      showNotice('Please upload a PDF or Word file.', 'error');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      await API.post('/cv/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const aiForm = new FormData();
      aiForm.append('file', file);
      const aiRes = await API.post('/ai/upload-cv', aiForm, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const analysis = aiRes?.data?.analysis || {};

      const profileRes = await API.get('/students/me/profile');
      const backendCvPath = profileRes?.data?.cv_path || '';
      const backendCvFileName = getFileName(backendCvPath) || file.name;

      setProfile((prev) => {
        const updated = {
          ...prev,
          cv_filename: backendCvFileName
        };
        const prevLocal = JSON.parse(localStorage.getItem('ie_student_profile') || '{}');
        localStorage.setItem('ie_student_profile', JSON.stringify({
          ...prevLocal,
          ...updated,
          ai_skills: analysis.skills || analysis.result?.skills || [],
          ai_education: analysis.education || '',
          ai_summary: analysis.summary || ''
        }));
        return updated;
      });

      showNotice(`CV "${backendCvFileName}" uploaded successfully.`);
    } catch (err) {
      showNotice(err?.response?.data?.detail || 'CV upload failed. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleRecLetterUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setTimeout(() => {
      setProfile(prev => {
        const updated = {
          ...prev,
          rec_letter_filename: file.name
        };
        localStorage.setItem('ie_student_profile', JSON.stringify(updated));
        return updated;
      });
      setUploading(false);
      showNotice(`Recommendation letter "${file.name}" uploaded successfully.`);
    }, 1000);
  };

  const handleViewCv = async () => {
    const token = getStoredToken();
    if (!token) {
      showNotice('Your session expired. Please sign in again, then try View CV.', 'error');
      setTimeout(() => navigate('/login'), 1200);
      return;
    }

    window.open(
      `${API_BASE_URL}/students/me/cv/view?token=${encodeURIComponent(token)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleDeactivateAccount = async () => {
    setConfirmDeactivate(false);
    setLoading(true);
    try {
      await API.post('/students/me/deactivate');
      localStorage.removeItem('ie_student_profile');
      logout();
      showNotice('Your account has been deactivated.');
      navigate('/login');
    } catch (err) {
      showNotice(err?.response?.data?.detail || 'Failed to deactivate account. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const t = getTheme(isDark);

  const styles = `
    ${globalStyles(isDark)}
    .profile-page { padding: 100px 48px 60px; max-width: 900px; margin: 0 auto; }
    .profile-header { display: flex; align-items: center; gap: 24px; margin-bottom: 40px; }
    .profile-avatar { width: 80px; height: 80px; border-radius: 20px; background: ${t.accentMuted}; border: 1px solid ${t.border}; display: flex; align-items: center; justify-content: center; font-size: 32px; flex-shrink: 0; }
    .profile-title { font-family: 'DM Serif Display', serif; font-size: 32px; color: ${t.textPrimary}; margin-bottom: 4px; }
    .profile-sub { font-size: 14px; color: ${t.textMuted}; }
    .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
    .profile-section { background: ${t.bgCard}; border: 1px solid ${t.border}; border-radius: 16px; padding: 28px; }
    .section-heading { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: ${t.textMuted}; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid ${t.border}; }
    .save-bar { position: fixed; bottom: 0; left: 0; right: 0; background: ${isDark ? 'rgba(10,15,30,0.95)' : 'rgba(255,255,255,0.95)'}; backdrop-filter: blur(12px); border-top: 1px solid ${t.border}; padding: 16px 48px; display: flex; justify-content: flex-end; align-items: center; gap: 16px; z-index: 50; }
    .save-status { font-size: 13px; color: #48bb78; }
    .profile-notice {
      position: fixed; top: 86px; right: 48px; z-index: 200;
      max-width: min(420px, calc(100vw - 32px));
      padding: 14px 16px; border-radius: 12px;
      background: ${isDark ? 'rgba(10,15,30,0.96)' : '#ffffff'};
      border: 1px solid ${t.borderHover};
      box-shadow: 0 18px 44px rgba(0,0,0,0.22);
      color: ${t.textPrimary}; font-size: 14px; line-height: 1.5;
    }
    .profile-notice.success { border-color: rgba(72,187,120,0.45); }
    .profile-notice.error { border-color: rgba(252,129,129,0.45); }
    .profile-notice-title { font-size: 12px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 4px; color: ${t.accentLight}; }
    .profile-notice.error .profile-notice-title { color: #fc8181; }
    .profile-modal-backdrop {
      position: fixed; inset: 0; z-index: 180; display: flex; align-items: center; justify-content: center;
      padding: 24px; background: rgba(0,0,0,0.45); backdrop-filter: blur(6px);
    }
    .profile-modal {
      width: min(460px, 100%); background: ${isDark ? 'rgba(15,23,42,0.98)' : '#ffffff'};
      border: 1px solid ${t.borderHover}; border-radius: 16px; padding: 24px;
      box-shadow: 0 24px 70px rgba(0,0,0,0.34);
    }
    .profile-modal h3 { font-size: 18px; margin-bottom: 8px; color: ${t.textPrimary}; }
    .profile-modal p { font-size: 14px; line-height: 1.7; color: ${t.textSecondary}; margin-bottom: 22px; }
    .profile-modal-actions { display: flex; gap: 12px; justify-content: flex-end; flex-wrap: wrap; }
    @media (max-width: 768px) { .profile-grid { grid-template-columns: 1fr; } .profile-page { padding: 100px 24px 80px; } }
    @media (max-width: 768px) { .profile-notice { top: 76px; right: 16px; left: 16px; } }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="ie-page">
        <div className="ie-bg" /><div className="ie-grid" />
        {notice && (
          <div className={`profile-notice ${notice.type}`}>
            <div className="profile-notice-title">{notice.type === 'error' ? 'Action needed' : 'InternEra'}</div>
            <div>{notice.message}</div>
          </div>
        )}
        {confirmDeactivate && (
          <div className="profile-modal-backdrop">
            <div className="profile-modal">
              <h3>Deactivate account?</h3>
              <p>You will be logged out and will not be able to sign in again unless your account is reactivated.</p>
              <div className="profile-modal-actions">
                <button className="ie-btn ie-btn-ghost" onClick={() => setConfirmDeactivate(false)}>Cancel</button>
                <button
                  className="ie-btn ie-btn-primary"
                  onClick={handleDeactivateAccount}
                  disabled={loading}
                  style={{ background: '#e53e3e' }}
                >
                  {loading ? 'Working...' : 'Deactivate'}
                </button>
              </div>
            </div>
          </div>
        )}
        <StudentNavbar>
          <button className="ie-btn ie-btn-ghost" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => navigate('/student/dashboard')}>Back to Dashboard</button>
        </StudentNavbar>

        <div className="ie-content profile-page">
          <div className="profile-header ie-animate">
            <div className="profile-avatar">ST</div>
            <div>
              <h1 className="profile-title">{profile.full_name || 'Student Profile'}</h1>
              <p className="profile-sub">{profile.major || 'Major not set'} | {profile.university}</p>
            </div>
          </div>

          <div className="profile-grid ie-animate-2">
            <div className="profile-section">
              <div className="section-heading">Personal Information</div>
              <div className="ie-input-group">
                <label className="ie-label">Full Name</label>
                <input className="ie-input" name="full_name" value={profile.full_name} onChange={handleChange} />
              </div>
              <div className="ie-input-group">
                <label className="ie-label">Email</label>
                <input className="ie-input" name="email" value={profile.email} readOnly />
              </div>
              <div className="ie-input-group">
                <label className="ie-label">Phone Number</label>
                <input className="ie-input" name="phone" value={profile.phone} onChange={handleChange} placeholder="+962 7x xxx xxxx" />
              </div>
              <div className="ie-input-group">
                <label className="ie-label">Bio</label>
                <textarea className="ie-input" name="bio" value={profile.bio} onChange={handleChange} rows={4} placeholder="Tell companies a little about yourself..." style={{ resize: 'vertical', lineHeight: '1.7' }} />
              </div>
            </div>

            <div className="profile-section">
              <div className="section-heading">Academic Information</div>
              <div className="ie-input-group">
                <label className="ie-label">University</label>
                <input className="ie-input" name="university" value={profile.university} onChange={handleChange} />
              </div>
              <div className="ie-input-group">
                <label className="ie-label">Major</label>
                <input className="ie-input" name="major" value={profile.major} onChange={handleChange} />
              </div>
              <div className="ie-input-group">
                <label className="ie-label">Expected Graduation Year</label>
                <input className="ie-input" name="graduation_year" value={profile.graduation_year} onChange={handleChange} placeholder="e.g. 2026" />
              </div>
              <div className="ie-input-group">
                <label className="ie-label">GPA (optional)</label>
                <input className="ie-input" name="gpa" value={profile.gpa} onChange={handleChange} placeholder="e.g. 3.7 / 4.0" />
              </div>
            </div>

            <div className="profile-section" style={{ gridColumn: '1 / -1' }}>
              <div className="section-heading">Social & Portfolio Links</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="ie-input-group" style={{ marginBottom: 0 }}>
                  <label className="ie-label">LinkedIn URL</label>
                  <input className="ie-input" name="linkedin" value={profile.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/yourname" />
                </div>
                <div className="ie-input-group" style={{ marginBottom: 0 }}>
                  <label className="ie-label">GitHub URL</label>
                  <input className="ie-input" name="github" value={profile.github} onChange={handleChange} placeholder="https://github.com/yourname" />
                </div>
              </div>
            </div>

            <div className="profile-section" style={{ gridColumn: '1 / -1' }}>
              <div className="section-heading">My Documents</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ border: `2px dashed ${t.border}`, borderRadius: '12px', padding: '32px', textAlign: 'center', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>CV</div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: t.textPrimary, marginBottom: '8px' }}>
                    {profile.cv_filename ? `Current CV: ${profile.cv_filename}` : 'No CV Uploaded'}
                  </h3>
                  <p style={{ fontSize: '13px', color: t.textMuted, marginBottom: '20px' }}>Supported formats: PDF or Word (Max 5MB)</p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <input type="file" id="cv-upload-input" style={{ display: 'none' }} onChange={handleFileUpload} accept=".pdf,.doc,.docx" />
                    <button className="ie-btn ie-btn-primary" style={{ padding: '10px 24px' }} onClick={() => document.getElementById('cv-upload-input').click()} disabled={uploading}>
                      {uploading ? 'Uploading...' : profile.cv_filename ? 'Update CV' : 'Upload New CV'}
                    </button>
                    {profile.cv_filename && (
                      <button className="ie-btn ie-btn-ghost" style={{ padding: '10px 24px' }} onClick={handleViewCv}>
                        View
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ border: `2px dashed ${t.border}`, borderRadius: '12px', padding: '32px', textAlign: 'center', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>RL</div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: t.textPrimary, marginBottom: '8px' }}>
                    {profile.rec_letter_filename ? `Recommendation Letter: ${profile.rec_letter_filename}` : 'No Recommendation Letter Uploaded'}
                  </h3>
                  <p style={{ fontSize: '13px', color: t.textMuted, marginBottom: '20px' }}>Supported formats: PDF, DOC, DOCX</p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <input type="file" id="rec-letter-upload-input" style={{ display: 'none' }} onChange={handleRecLetterUpload} accept=".pdf,.doc,.docx" />
                    <button className="ie-btn ie-btn-primary" style={{ padding: '10px 24px' }} onClick={() => document.getElementById('rec-letter-upload-input').click()} disabled={uploading}>
                      {uploading ? 'Uploading...' : profile.rec_letter_filename ? 'Update Letter' : 'Upload Letter'}
                    </button>
                    {profile.rec_letter_filename && (
                      <button className="ie-btn ie-btn-ghost" style={{ padding: '10px 24px' }} onClick={() => showNotice('Recommendation letter viewing is not available yet.', 'error')}>
                        View
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="save-bar ie-content">
          {saved && <span className="save-status">Profile saved successfully</span>}
          <button
            className="ie-btn ie-btn-ghost"
            onClick={() => setConfirmDeactivate(true)}
            disabled={loading}
            style={{ color: '#f56565', borderColor: 'rgba(245,101,101,0.45)' }}
          >
            Deactivate Account
          </button>
          <button className="ie-btn ie-btn-ghost" onClick={() => navigate('/student/dashboard')}>Cancel</button>
          <button className="ie-btn ie-btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </>
  );
}

export default StudentProfile;



