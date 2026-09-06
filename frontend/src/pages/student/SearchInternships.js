import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { globalStyles, getTheme } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useActivity } from '../../context/ActivityContext';
import API from '../../api/api'; // استدعاء الـ API الموحد
import StudentNavbar from '../../components/StudentNavbar';

function SearchInternships() {
  const { isDark } = useTheme();
  const t = getTheme(isDark);

  const navigate = useNavigate();
  const { saveInternship, savedInternships } = useActivity();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true); // حالة التحميل أثناء عمل الـ AI

useEffect(() => {
    const fetchInternships = async () => {
      try {
        // 1. جلب التدريبات من الباك إند الحقيقي باستخدام API بدلاً من fetch الوهمي 🌟
        const res = await API.get('/internships/');
        const data = res.data;
        
        // 2. جلب مهارات الطالب التي حللها الـ AI وتم حفظها
        const profile = JSON.parse(localStorage.getItem('ie_student_profile') || '{}');
        let cvSkills = '';
        if (Array.isArray(profile.ai_skills)) {
             cvSkills = profile.ai_skills.join(', ');
      } else if (typeof profile.ai_skills === 'string') {
         cvSkills = profile.ai_skills;
      }

        if (!cvSkills && profile.analysis?.skills) {
            cvSkills = profile.analysis.skills.join(', ');
        }

         if (!cvSkills && profile.skills) {
            cvSkills = Array.isArray(profile.skills)
            ? profile.skills.join(', ')
            : profile.skills;
    }

        const matchedData = await Promise.all(data.map(async (i) => {
  let matchScore = 0;

  const cacheKey = `match_${i.internship_id}`;
  const cachedScore = localStorage.getItem(cacheKey);

  if (cachedScore !== null) {
    matchScore = Number(cachedScore);
  } else if (cvSkills && cvSkills.trim().length > 0) {
    try {
        const internshipText = `
            Title: ${i.title || ''}
            Description: ${i.description || ''}
            Requirements: ${i.requirements || ''}
            Skills: ${i.required_skills || i.skills || ''}
            `;

        const matchRes = await API.post('/ai/match', {
          cv_text: String(cvSkills || ''),
           internship_text: internshipText
          });
      if (matchRes.data?.result?.match_score) {
        const scoreStr = matchRes.data.result.match_score.replace('%', '');
        matchScore = parseInt(scoreStr) || 0;

        localStorage.setItem(cacheKey, matchScore);
      }
    } catch (error) {
      console.error("AI Match Error for", i.title, error);
    }
  }

  return {
    ...i,
    id: i.internship_id,
    match: matchScore,
    company: i.company || `Company #${i.company_id}`,
    skills: i.required_skills ? i.required_skills.split(',') : [],
    duration_weeks: parseInt(i.duration) || 12
  };
}));
        // 3. تحليل ومطابقة كل تدريب مع الـ CV
        // const matchedData = await Promise.all(data.map(async (i) => {
        //   let matchScore = 0;
        //   const requiredSkills = i.required_skills || i.skills || i.description || '';

        //   // إرسال الطلب للـ AI الحقيقي
        //   if (cvSkills && cvSkills.trim().length > 0) {
        //     try {
        //       const matchRes = await API.post('/ai/match', {
        //         cv_text: cvSkills,
        //         internship_text: requiredSkills
        //       });
              
        //       if (matchRes.data && matchRes.data.result && matchRes.data.result.match_score) {
        //           const scoreStr = matchRes.data.result.match_score.replace('%', '');
        //           matchScore = parseInt(scoreStr) || 0;
        //       }
        //     } catch (error) {
        //       console.error("AI Match Error for", i.title, error);
        //     }
        //   }

        //   return {
        //     ...i,
        //     id: i.internship_id,
        //     match: matchScore,
        //     company: i.company || `Company #${i.company_id}`,
        //     skills: i.required_skills ? i.required_skills.split(',') : [],
        //     duration_weeks: parseInt(i.duration) || 12
        //   };
        // }));

        setInternships(matchedData);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInternships();
  }, []);

  const filtered = internships.filter(i => {
    const isPublic = (i.status || 'open') === 'open';
    const matchesSearch = i.title.toLowerCase().includes(search.toLowerCase()) ||
      (i.company || '').toLowerCase().includes(search.toLowerCase()) ||
      (i.skills || []).some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filter === 'all' || i.type === filter;
    return isPublic && matchesSearch && matchesFilter;
  });

  const matchColor = m => m >= 80 ? '#48bb78' : m >= 60 ? '#f6ad55' : '#fc8181';

  // 🎨 تم استرجاع تصميماتك الأصلية بالكامل هنا
  const styles = `
    ${globalStyles(isDark)}
    .search-page { padding: 100px 48px 60px; max-width: 1100px; margin: 0 auto; }
    .search-header { margin-bottom: 32px; }
    .search-title {
      font-family: 'DM Serif Display', serif;
      font-size: 36px; color: ${t.textPrimary}; margin-bottom: 8px;
    }
    .search-sub { font-size: 14px; color: ${t.textMuted}; }
    .search-bar-wrap {
      display: flex; gap: 12px; align-items: center; margin-bottom: 20px; flex-wrap: wrap;
    }
    .search-bar {
      flex: 1; min-width: 240px;
      display: flex; align-items: center; gap: 12px;
      background: ${t.bgCard};
      border: 1px solid ${t.border};
      border-radius: 12px; padding: 0 16px;
      transition: border-color 0.2s;
    }
    .search-bar:focus-within { border-color: ${t.accentLight}; }
    .search-bar input {
      flex: 1; background: none; border: none; outline: none;
      color: ${t.textPrimary}; font-family: 'Sora', sans-serif; font-size: 15px;
      padding: 13px 0;
    }
    .search-bar input::placeholder { color: ${t.textMuted}; }
    .search-icon { color: ${t.textMuted}; font-size: 16px; }
    .filter-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
    .filter-tab {
      padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;
      cursor: pointer; border: 1px solid ${t.border};
      background: ${t.bgCard}; color: ${t.textSecondary};
      transition: all 0.2s; font-family: 'Sora', sans-serif;
    }
    .filter-tab:hover { border-color: ${t.borderHover}; color: ${t.textPrimary}; }
    .filter-tab.active { background: ${t.accentMuted}; border-color: ${t.borderHover}; color: ${t.accentLight}; }
    .results-count { font-size: 13px; color: ${t.textMuted}; margin-bottom: 20px; }
    .intern-card {
      background: ${t.bgCard}; border: 1px solid ${t.border};
      border-radius: 16px; padding: 24px 28px; margin-bottom: 16px;
      cursor: pointer; transition: all 0.2s;
      display: flex; align-items: flex-start; gap: 20px;
    }
    .intern-card:hover { border-color: ${t.borderHover}; background: ${t.bgCardHover}; transform: translateY(-1px); }
    .intern-logo {
      width: 52px; height: 52px; border-radius: 12px;
      background: ${t.accentMuted}; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; border: 1px solid ${t.border};
    }
    .intern-body { flex: 1; }
    .intern-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px; }
    .intern-title { font-size: 17px; font-weight: 600; color: ${t.textPrimary}; }
    .intern-company { font-size: 14px; color: ${t.accentLight}; margin-bottom: 8px; }
    .intern-desc { font-size: 13px; color: ${t.textMuted}; line-height: 1.6; margin-bottom: 14px; }
    .intern-tags { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
    .intern-tag {
      font-size: 12px; padding: 4px 10px; border-radius: 6px;
      background: ${t.accentMuted}; color: ${t.accentLight};
      border: 1px solid ${t.border};
    }
    .intern-tag-neutral {
      font-size: 12px; padding: 4px 10px; border-radius: 6px;
      background: ${t.bgCardHover}; color: ${t.textSecondary};
      border: 1px solid ${t.border};
    }
    .match-pill {
      font-size: 13px; font-weight: 700; padding: 6px 14px; border-radius: 100px;
      flex-shrink: 0;
    }
    .apply-btn {
      background: #2b6cb0; color: #fff;
      padding: 10px 20px; border-radius: 10px;
      font-size: 13px; font-weight: 600; border: none;
      cursor: pointer; transition: background 0.2s;
      font-family: 'Sora', sans-serif; flex-shrink: 0;
    }
    .apply-btn:hover { background: #2c5282; }
    .empty-state { text-align: center; padding: 80px 40px; color: ${t.textMuted}; }
    .empty-state .icon { font-size: 48px; margin-bottom: 16px; }
    .ai-loading { text-align: center; padding: 60px; color: #2b6cb0; font-weight: 600; font-size: 16px; }
  `;

  const companyEmojis = { TechCo: '💻', DevCorp: '⚙️', DataInc: '📊', DesignHub: '🎨', AppCo: '📱' };

  return (
    <>
      <style>{styles}</style>
      <div className="ie-page">
        <div className="ie-bg" /><div className="ie-grid" />
        <StudentNavbar>
          <button className="ie-btn ie-btn-ghost" style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => navigate('/student/dashboard')}>← Dashboard</button>
        </StudentNavbar>
        <div className="ie-content search-page">
          <div className="search-header ie-animate">
            <h1 className="search-title">Find your internship</h1>
            <p className="search-sub">Browse opportunities matched to your skills using AI.</p>
          </div>
          <div className="ie-animate-2">
            <div className="search-bar-wrap">
              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input placeholder="Search by title, company or skill..."
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="filter-tabs" style={{ marginBottom: '20px' }}>
              {[
                { id: 'all', label: 'All Types' },
                { id: 'onsite', label: '🏢 On-site' },
                { id: 'remote', label: '🌐 Remote' },
                { id: 'hybrid', label: '🔀 Hybrid' },
              ].map(f => (
                <button key={f.id} className={`filter-tab ${filter === f.id ? 'active' : ''}`}
                  onClick={() => setFilter(f.id)}>{f.label}</button>
              ))}
            </div>
            <div className="results-count">
              {loading ? 'AI is analyzing matches...' : `${filtered.length} internship${filtered.length !== 1 ? 's' : ''} found`}
            </div>
          </div>

          <div className="ie-animate-3">
            {loading ? (
              <div className="ai-loading">
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>🤖</div>
                Analyzing your CV against available internships...
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="icon">🔍</div>
                <p>No internships match your search.</p>
                <button className="ie-btn ie-btn-ghost" style={{ marginTop: '16px' }}
                  onClick={() => { setSearch(''); setFilter('all'); }}>Clear filters</button>
              </div>
            ) : filtered.map(i => (
              <div className="intern-card" key={i.id}
                onClick={() => navigate(`/student/internship/${i.id}`)}>
                <div className="intern-logo">{companyEmojis[i.company] || '🏢'}</div>
                <div className="intern-body">
                  <div className="intern-top">
                    <div>
                      <div className="intern-title">{i.title}</div>
                      <div className="intern-company">{i.company}</div>
                    </div>
                    {/* هنا سيظهر الـ Match Score الحقيقي الخاص بالـ AI */}
                    <span className="match-pill"
                      style={{ background: `${matchColor(i.match)}18`, color: matchColor(i.match), border: `1px solid ${matchColor(i.match)}33` }}>
                      ⚡ {i.match}% AI Match
                    </span>
                    <button 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '700', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}
                      onClick={(e) => { e.stopPropagation(); saveInternship(i); }}>
                      <span style={{ fontSize: '18px' }}>{savedInternships.find(s => s.id === i.id) ? '🔖' : '🔖'}</span>
                      <span style={{ color: savedInternships.find(s => s.id === i.id) ? t.accentLight : t.textMuted }}>
                        {savedInternships.find(s => s.id === i.id) ? 'Saved' : 'Save'}
                      </span>
                    </button>
                  </div>
                  <div className="intern-desc">{i.description}</div>
                  <div className="intern-tags">
                    <span className="intern-tag-neutral">📍 {i.location || 'Unknown'}</span>
                    <span className="intern-tag-neutral">⏱ {i.duration_weeks} weeks</span>
                    <span className="intern-tag-neutral" style={{ textTransform: 'capitalize' }}>🔀 {i.type || 'Onsite'}</span>
                    {i.skills.slice(0, 3).map(s => <span className="intern-tag" key={s}>{s}</span>)}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button className="apply-btn" onClick={e => { e.stopPropagation(); navigate(`/student/apply/${i.id}`); }}>
                    Apply →
                  </button>
                  <button className="ie-btn ie-btn-ghost" 
                    style={{ padding: '8px 12px', fontSize: '11px', fontWeight: '700' }}
                    onClick={e => { e.stopPropagation(); navigate(`/company/profile/view/${i.company_id}`); }}>
                    🏢 Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default SearchInternships;
