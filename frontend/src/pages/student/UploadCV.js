import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { globalStyles, getTheme } from '../../theme';
import StudentNavbar from '../../components/StudentNavbar';
import { API_BASE_URL, getStoredToken } from '../../api/api';
import API from '../../api/api'; // تم إضافة استدعاء الـ API

function UploadCV() {
  const { isDark } = useTheme();
  const t = getTheme(isDark);

  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [existing, setExisting] = useState(null);
  const [status, setStatus] = useState(''); // 'uploading' | 'done' | 'error'
  const [statusMessage, setStatusMessage] = useState('');
  const [matchingInternships, setMatchingInternships] = useState([]);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null); // لتخزين نتيجة الذكاء الاصطناعي

  useEffect(() => {
    const saved = localStorage.getItem('ie_student_profile');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.cv_filename) {
        setExisting({
          name: data.cv_filename,
          uploaded: data.cv_uploaded_at || new Date().toISOString().slice(0, 10),
          size: data.cv_size || 'Unknown Size'
        });
        
        // إذا كان هناك بيانات ذكاء اصطناعي محفوظة مسبقاً، اعرضها
        if (data.ai_skills) {
          setAnalysisResult({
            skills: data.ai_skills,
            education: data.ai_education,
            summary: data.ai_summary
          });
        }
      }
    }
  }, []);

  const normalizeSkills = (skills) => {
    if (Array.isArray(skills)) {
      return skills.map((s) => String(s).trim()).filter(Boolean);
    }
    if (typeof skills === 'string') {
      return skills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };

  const fallbackMatchScore = (skills, internship) => {
    const skillWords = normalizeSkills(skills);
    if (skillWords.length === 0) return 0;
    const text = [
      internship.title,
      internship.description,
      internship.required_skills,
      internship.field_of_study,
      internship.type,
    ].join(' ').toLowerCase();
    const hits = skillWords.filter((skill) => text.includes(skill.toLowerCase()));
    return Math.round((hits.length / skillWords.length) * 100);
  };

  const loadMatchingInternships = async (skills) => {
    const skillWords = normalizeSkills(skills);
    if (skillWords.length === 0) {
      setMatchingInternships([]);
      return;
    }

    setMatchingLoading(true);
    try {
      const res = await API.get('/internships/');
      const internships = Array.isArray(res.data) ? res.data : [];
      const cvText = skillWords.join(', ');

      const scored = await Promise.all(internships.map(async (internship) => {
        let match = fallbackMatchScore(skillWords, internship);
        try {
          const matchRes = await API.post('/ai/match', {
            cv_text: cvText,
            internship_text: [
              `Title: ${internship.title || ''}`,
              `Description: ${internship.description || ''}`,
              `Skills: ${internship.required_skills || ''}`,
              `Field: ${internship.field_of_study || ''}`,
            ].join('\n')
          });
          const rawScore = matchRes.data?.result?.match_score;
          if (rawScore) {
            match = Number(String(rawScore).replace('%', '')) || match;
          }
        } catch {
          // Keep the local score if AI matching is temporarily unavailable.
        }

        return {
          ...internship,
          match,
          skills: internship.required_skills
            ? internship.required_skills.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
        };
      }));

      setMatchingInternships(
        scored
          .filter((item) => (item.status || 'open') === 'open')
          .sort((a, b) => b.match - a.match)
          .slice(0, 4)
      );
    } catch (err) {
      console.error('Matching internships error:', err);
      setMatchingInternships([]);
    } finally {
      setMatchingLoading(false);
    }
  };

  const handleFile = (f) => {
  if (!f) return;

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
    'image/jpg'
  ];

  if (!allowedTypes.includes(f.type)) {
    setStatus('error');
    setStatusMessage('Please upload a valid PDF, Word, or image file.');
    return;
  }

  // optional max size 5MB
  const maxSize = 5 * 1024 * 1024;
  if (f.size > maxSize) {
    setStatus('error');
    setStatusMessage('File is too large. Maximum size is 5MB.');
    return;
  }

  setFile(f);
  setStatus('');
  setStatusMessage('');
  setAnalysisResult(null);
  setMatchingInternships([]);
};
  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  // 🚀 التعديل الأهم: ربط رفع الملف بالباك إند الحقيقي
const handleUpload = async () => {
  if (!file) return;

  const token = getStoredToken();
  if (!token) {
    setStatus('error');
    setStatusMessage('Please sign in as a student before uploading your CV.');
    setTimeout(() => navigate('/login'), 1400);
    return;
  }

  setStatus('uploading');

  try {
    const saveFormData = new FormData();
    saveFormData.append('file', file);

    await API.post('/cv/upload', saveFormData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    const formData = new FormData();
    formData.append('file', file);

    const res = await API.post('/ai/upload-cv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    const data = res.data;

    // 🚨 أهم جزء: التحقق من النجاح
    if (data.success === false) {
      setStatus('error');
      setStatusMessage(data.message || "Invalid CV file");
      return;
    }

    const analysis = data.analysis || {};
    const extractedSkills = analysis.skills || analysis.result?.skills || [];

    setAnalysisResult(analysis);

    const uploadedDate = new Date().toISOString().slice(0, 10);
    const uploadedSize = `${Math.round(file.size / 1024)} KB`;
    const profileData = {
      cv_filename: file.name,
      cv_uploaded_at: uploadedDate,
      cv_size: uploadedSize,


      ai_skills: extractedSkills,
      ai_education: analysis.education || '',
      ai_summary: analysis.summary || ''
    };

    localStorage.setItem('ie_student_profile', JSON.stringify(profileData));

    // 🧹 تنظيف match cache
    Object.keys(localStorage)
      .filter(key => key.startsWith('match_'))
      .forEach(key => localStorage.removeItem(key));

    setStatus('done');
    setFile(null);
    await loadMatchingInternships(extractedSkills);

  } catch (error) {
    console.error("Upload Error:", error);
    setStatus('error');
    if (error?.response?.status === 401) {
      setStatusMessage('Your session expired. Please sign in again, then upload your CV.');
      setTimeout(() => navigate('/login'), 1400);
    } else {
      setStatusMessage(error?.response?.data?.detail || 'Upload failed. Please try again.');
    }
  }
};

  const handleViewExistingCv = () => {
    const token = getStoredToken();
    if (!token) {
      setStatus('error');
      setStatusMessage('Please sign in as a student before viewing your CV.');
      setTimeout(() => navigate('/login'), 1200);
      return;
    }

    window.open(
      `${API_BASE_URL}/students/me/cv/view?token=${encodeURIComponent(token)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const styles = `
    ${globalStyles(isDark)}
    .cv-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 100px 24px 60px; }
    .cv-box { width: 100%; max-width: 560px; }
    .cv-title { font-family: 'DM Serif Display', serif; font-size: 32px; color: ${t.textPrimary}; margin-bottom: 8px; }
    .cv-sub { font-size: 14px; color: ${t.textMuted}; margin-bottom: 32px; }
    .drop-zone {
      border: 2px dashed ${t.borderHover}; border-radius: 16px;
      padding: 48px 32px; text-align: center; cursor: pointer;
      transition: all 0.2s; background: ${t.bgCard};
      margin-bottom: 20px;
    }
    .drop-zone.dragging { border-color: ${t.accentLight}; background: ${t.accentMuted}; }
    .drop-zone.has-file { border-color: rgba(72,187,120,0.4); background: rgba(72,187,120,0.05); }
    .drop-icon { font-size: 40px; margin-bottom: 16px; }
    .drop-title { font-size: 16px; font-weight: 600; color: ${t.textPrimary}; margin-bottom: 8px; }
    .drop-sub { font-size: 13px; color: ${t.textMuted}; }
    .drop-browse { color: ${t.accentLight}; cursor: pointer; }
    .drop-browse:hover { text-decoration: underline; }
    .file-preview {
      background: rgba(72,187,120,0.08); border: 1px solid rgba(72,187,120,0.2);
      border-radius: 12px; padding: 16px 20px;
      display: flex; align-items: center; gap: 14px; margin-bottom: 20px;
    }
    .file-icon { font-size: 28px; }
    .file-name { font-size: 15px; font-weight: 600; color: ${t.textPrimary}; margin-bottom: 3px; }
    .file-size { font-size: 12px; color: ${t.textMuted}; }
    .file-remove {
      margin-left: auto; background: none; border: none;
      color: ${t.textMuted}; font-size: 18px; cursor: pointer;
      transition: color 0.2s; padding: 4px;
    }
    .file-remove:hover { color: #fc8181; }
    .existing-card {
      background: ${t.bgCard}; border: 1px solid ${t.border};
      border-radius: 14px; padding: 20px 24px; margin-bottom: 24px;
    }
    .existing-label { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: ${t.textMuted}; margin-bottom: 14px; }
    .existing-row { display: flex; align-items: center; gap: 14px; }
    .existing-info { flex: 1; }
    .existing-name { font-size: 14px; font-weight: 600; color: ${t.textPrimary}; margin-bottom: 3px; }
    .existing-meta { font-size: 12px; color: ${t.textMuted}; }
    .ai-note {
      background: ${t.accentMuted}; border: 1px solid ${t.border};
      border-radius: 12px; padding: 16px 20px; margin-bottom: 20px;
      display: flex; gap: 12px; align-items: flex-start;
    }
    .ai-note-icon { font-size: 20px; flex-shrink: 0; }
    .ai-note-text { font-size: 13px; color: ${t.textSecondary}; line-height: 1.6; }
    .ai-note-text strong { color: ${t.accentLight}; }
    .progress-bar {
      height: 4px; background: ${t.border};
      border-radius: 2px; overflow: hidden; margin-bottom: 16px;
    }
    .progress-fill {
      height: 100%; background: #2b6cb0;
      border-radius: 2px; animation: progress 1.5s ease forwards;
    }
    @keyframes progress { from { width: 0% } to { width: 100% } }
    .ai-results {
      background: rgba(43, 108, 176, 0.05);
      border: 1px solid rgba(43, 108, 176, 0.2);
      border-radius: 12px; padding: 16px; margin-bottom: 20px;
    }
    .ai-results-title { font-size: 14px; font-weight: bold; color: #2b6cb0; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;}
    .ai-skill-badge {
      display: inline-block; background: #fff; border: 1px solid #cbd5e0;
      color: #2d3748; padding: 4px 10px; border-radius: 16px;
      font-size: 12px; margin: 0 6px 6px 0; font-weight: 600;
    }
    .match-card {
      background: ${t.bgCard}; border: 1px solid ${t.border};
      border-radius: 14px; padding: 18px; margin-bottom: 20px;
    }
    .match-card-title { font-size: 14px; font-weight: 800; color: ${t.accentLight}; margin-bottom: 12px; }
    .match-list { display: grid; gap: 10px; }
    .match-item {
      display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: center;
      padding: 12px; border: 1px solid ${t.border}; border-radius: 12px;
      background: ${isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc'};
    }
    .match-item-title { font-size: 14px; font-weight: 700; color: ${t.textPrimary}; margin-bottom: 4px; }
    .match-item-meta { font-size: 12px; color: ${t.textMuted}; line-height: 1.5; }
    .match-score {
      font-size: 12px; font-weight: 800; color: #48bb78;
      background: rgba(72,187,120,0.12); border: 1px solid rgba(72,187,120,0.25);
      border-radius: 999px; padding: 5px 10px; white-space: nowrap;
    }
    .match-actions { display: flex; align-items: center; gap: 8px; justify-content: flex-end; }
    .match-empty { font-size: 13px; color: ${t.textMuted}; line-height: 1.6; }
  `;

  const analysisSkills = normalizeSkills(analysisResult?.skills || analysisResult?.result?.skills);

  return (
    <>
      <style>{styles}</style>
      <div className="ie-page">
        <div className="ie-bg" /><div className="ie-grid" />
        <StudentNavbar>
          <button className="ie-btn ie-btn-ghost" style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => navigate('/student/dashboard')}>← Dashboard</button>
        </StudentNavbar>

        <div className="ie-content cv-page">
          <div className="cv-box">
            <div className="ie-badge ie-animate">CV Upload</div>
            <h1 className="cv-title ie-animate-2">Upload your CV</h1>
            <p className="cv-sub ie-animate-3">Our AI will analyze your CV and extract your skills automatically.</p>

            {/* AI note */}
            <div className="ai-note ie-animate-2">
              <span className="ai-note-icon">🤖</span>
              <div className="ai-note-text">
                <strong>AI-powered analysis:</strong> Once uploaded, our AI will extract your skills, education, and experience — and use them to calculate your match score for each internship.
              </div>
            </div>

            {/* Existing CV */}
            {existing && (
              <div className="existing-card ie-animate-3">
                <div className="existing-label">Current CV on file</div>
                <div className="existing-row">
                  <span style={{ fontSize: '28px' }}>📄</span>
                  <div className="existing-info">
                    <div className="existing-name">{existing.name}</div>
                    <div className="existing-meta">Uploaded {existing.uploaded} · {existing.size}</div>
                  </div>
                  <button className="ie-btn ie-btn-ghost" style={{ padding: '6px 14px', fontSize: '12px' }}
                    onClick={handleViewExistingCv}>
                    View CV
                  </button>
                </div>
              </div>
            )}

            {/* 🌟 عرض المهارات المستخرجة من الذكاء الاصطناعي 🌟 */}
            {analysisSkills.length > 0 && (
              <div className="ai-results ie-animate">
                <div className="ai-results-title">✨ AI Extracted Skills:</div>
                <div>
                  {analysisSkills.map((skill, i) => (
                    <span key={i} className="ai-skill-badge">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {analysisResult && (
              <div className="match-card ie-animate">
                <div className="match-card-title">Recommended Internships</div>
                {matchingLoading ? (
                  <div className="match-empty">Finding internships that match your CV...</div>
                ) : matchingInternships.length === 0 ? (
                  <div className="match-empty">No open internships matched these skills yet.</div>
                ) : (
                  <div className="match-list">
                    {matchingInternships.map((internship) => (
                      <div className="match-item" key={internship.internship_id}>
                        <div>
                          <div className="match-item-title">{internship.title}</div>
                          <div className="match-item-meta">
                            Company #{internship.company_id} · {internship.location || 'Location not set'} · {internship.type || 'onsite'}
                          </div>
                          {internship.skills.length > 0 && (
                            <div className="match-item-meta">
                              {internship.skills.slice(0, 4).join(', ')}
                            </div>
                          )}
                        </div>
                        <div className="match-actions">
                          <span className="match-score">{internship.match}% match</span>
                          <button
                            className="ie-btn ie-btn-ghost"
                            style={{ padding: '7px 12px', fontSize: '12px' }}
                            onClick={() => navigate(`/student/internship/${internship.internship_id}`)}
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Drop zone */}
            {status !== 'done' && (
              <div
                className={`drop-zone ie-animate-3 ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => !file && document.getElementById('cv-input').click()}
              >
                <input id="cv-input" type="file"  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" style={{ display: 'none' }}
                  onChange={(e) => handleFile(e.target.files[0])} />
                {file ? (
                  <>
                    <div className="drop-icon">✅</div>
                    <div className="drop-title">{file.name}</div>
                    <div className="drop-sub">{Math.round(file.size / 1024)} KB · Ready to upload</div>
                  </>
                ) : (
                  <>
                    <div className="drop-icon">📂</div>
                    <div className="drop-title">Drop your CV here</div>
                    <div className="drop-sub">
                      or <span className="drop-browse">browse files</span> · PDF, Word, or Image · Max 5MB
                    </div>
                  </>
                )}
              </div>
            )}

            {status === 'error' && (
              <div className="ie-error">{statusMessage || 'Upload failed. Please upload a valid file and make sure the backend is running.'}</div>
            )}

            {status === 'uploading' && (
              <div style={{ marginBottom: '20px' }}>
                <div className="progress-bar"><div className="progress-fill" /></div>
                <div style={{ fontSize: '13px', color: '#4a5568', textAlign: 'center' }}>Uploading and analyzing your CV... this may take a few seconds 🤖</div>
              </div>
            )}

            {status === 'done' && (
              <div className="ie-success" style={{ marginBottom: '20px' }}>
                ✓ CV uploaded and analyzed successfully! Your match scores will update shortly.
              </div>
            )}

            {file && status !== 'uploading' && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="ie-btn ie-btn-ghost" style={{ flex: 1 }}
                  onClick={() => { setFile(null); setStatus(''); setStatusMessage(''); }}>
                  Remove
                </button>
                <button className="ie-btn ie-btn-primary" style={{ flex: 2 }} onClick={handleUpload}>
                  Upload & Analyze CV 🤖
                </button>
              </div>
            )}

            {(status === 'done' || (!file && status !== 'uploading')) && (
              <button className="ie-btn ie-btn-ghost" style={{ width: '100%', marginTop: '12px' }}
                onClick={() => navigate('/student/dashboard')}>
                ← Back to Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default UploadCV;
