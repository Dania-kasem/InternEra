import StudentNavbar from '../../components/StudentNavbar';
import EmptyState from '../../components/EmptyState';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { globalStyles, getTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useActivity } from '../../context/ActivityContext';
import API from '../../api/api';

function Dashboard() {
  const { isDark } = useTheme();
  const t = getTheme(isDark);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { savedInternships, conversations } = useActivity();
  const [activeTab, setActiveTab] = useState('overview');
  const [reportData, setReportData] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get('/reports/my-student-report');
        setReportData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const applications = reportData?.applied_internships.map(a => ({
    id: a.internship_id,
    title: a.internship_title,
    company: a.company_name,
    match: a.ai_match_score || 0,
    status: a.status,
    applied_at: new Date(a.applied_at).toLocaleDateString(),
    applied_full: a.applied_at
  })) || [];
  
  const saved = savedInternships;

  const statusColor = s => ({ accepted: '#0c803c', rejected: '#ec6666', pending: '#ca8531' }[s] || '#718096');
  const statusBg = s => ({ accepted: 'rgba(72,187,120,0.1)', rejected: 'rgba(252,129,129,0.1)', pending: 'rgba(246,173,85,0.1)' }[s] || 'rgba(113,128,150,0.1)');

  const styles = `
    ${globalStyles(isDark)}
    .dash-layout { display: flex; min-height: 100vh; padding-top: 70px; }
    .dash-sidebar {
      width: 240px; flex-shrink: 0;
      background: ${t.bgCard};
      border-right: 1px solid ${t.border};
      padding: 32px 20px;
      position: fixed; top: 70px; bottom: 0; left: 0;
      overflow-y: auto;
    }
    .dash-main { flex: 1; margin-left: 240px; padding: 40px 48px; min-height: calc(100vh - 70px); }
    .sidebar-label {
      font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
      text-transform: uppercase; color: ${t.textMuted}; margin-bottom: 8px; padding: 0 12px;
    }
    .sidebar-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; border-radius: 10px; margin-bottom: 2px;
      cursor: pointer; font-size: 14px; color: #718096;
      transition: all 0.2s; border: none; background: none;
      width: 100%; text-align: left; font-family: 'Sora', sans-serif;
    }
    .sidebar-item:hover { background: ${t.bgCardHover}; color: ${t.textPrimary}; }
    .sidebar-item.active { background: ${t.accentMuted}; color: #90cdf4; font-weight: 600; }
    .sidebar-icon { font-size: 16px; width: 20px; text-align: center; }
    .dash-header { margin-bottom: 36px; }
    .dash-greeting {
      font-family: 'DM Serif Display', serif;
      font-size: 32px; color: ${t.textPrimary}; margin-bottom: 6px;
    }
    .dash-greeting span { color: ${t.accentLight}; font-style: italic; }
    .dash-sub { font-size: 14px; color: ${t.textMuted}; }
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 36px; }
    .stat-card {
      background: ${t.bgCard}; border: 1px solid ${t.border};
      border-radius: 16px; padding: 20px 24px;
    }
    .stat-card-label { font-size: 12px; color: ${t.textMuted}; margin-bottom: 8px; font-weight: 600; letter-spacing: 0.3px; }
    .stat-card-value { font-size: 28px; font-weight: 700; color: ${t.textPrimary}; }
    .stat-card-sub { font-size: 12px; color: ${t.textMuted}; margin-top: 4px; }
    .section-title { font-size: 16px; font-weight: 600; color: ${t.textPrimary}; margin-bottom: 16px; }
    .app-card {
      display: flex; align-items: center; padding: 18px 24px;
      background: ${t.bgCard}; border: 1px solid ${t.border};
      border-radius: 16px; margin-bottom: 12px; cursor: pointer;
      transition: all 0.2s;
    }
    .app-card:hover { border-color: ${t.borderHover}; background: ${t.bgCardHover}; transform: translateY(-2px); }
    .app-card.recent { border-color: ${t.accent}; background: ${t.accentMuted}; }
    .new-badge { 
      background: ${t.accent}; color: #fff; font-size: 8px; font-weight: 800; 
      padding: 2px 5px; border-radius: 4px; margin-left: 8px; 
      vertical-align: middle;
    }
    .app-info { flex: 1; }
    .app-title { font-size: 15px; font-weight: 600; color: ${t.textPrimary}; margin-bottom: 4px; }
    .app-company { font-size: 13px; color: ${t.textMuted}; }
    .app-right { display: flex; align-items: center; gap: 16px; }
    .app-match {
      font-size: 13px; font-weight: 700;
      color: #63b3ed;
    }
    .status-badge {
      font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
      text-transform: uppercase; padding: 4px 12px; border-radius: 100px;
    }
    .app-date { font-size: 12px; color: ${t.textMuted}; }
    .saved-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .saved-card {
      background: ${t.bgCard}; border: 1px solid ${t.border};
      border-radius: 14px; padding: 20px;
      transition: border-color 0.2s; cursor: pointer;
    }
    .saved-card:hover { border-color: ${t.borderHover}; }
    .saved-title { font-size: 15px; font-weight: 600; color: ${t.textPrimary}; margin-bottom: 6px; }
    .saved-company { font-size: 13px; color: ${t.textMuted}; margin-bottom: 12px; }
    .saved-tags { display: flex; gap: 8px; flex-wrap: wrap; }
    .tag {
      font-size: 11px; padding: 3px 10px; border-radius: 6px;
      background: ${t.accentMuted}; color: #63b3ed;
      border: 1px solid ${t.border};
    }
    .quick-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 36px; }
    .quick-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 18px; border-radius: 10px;
      background: ${t.bgCard};
      border: 1px solid ${t.border};
      color: ${t.textPrimary}; font-size: 13px; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
      font-family: 'Sora', sans-serif;
    }
    .quick-btn:hover { border-color: ${t.borderHover}; background: ${t.bgCardHover}; }
    .sidebar-avatar {
      width: 44px; height: 44px; border-radius: 12px;
      background: ${t.accentMuted};
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; margin-bottom: 16px;
    }
    .sidebar-name { font-size: 14px; font-weight: 600; color: ${t.textPrimary}; margin-bottom: 4px; }
    .sidebar-email { font-size: 11px; color: ${t.textMuted}; margin-bottom: 24px; }
    .logout-btn {
      width: 100%; padding: 10px 12px; border-radius: 10px;
      background: none; border: 1px solid rgba(252,129,129,0.2);
      color: #fc8181; font-size: 13px; font-family: 'Sora', sans-serif;
      cursor: pointer; margin-top: 16px; transition: all 0.2s;
    }
    .logout-btn:hover { background: rgba(252,129,129,0.08); }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="ie-page">
        <div className="ie-bg" /><div className="ie-grid" />
        <StudentNavbar>
          <button className="ie-btn ie-btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}
            onClick={() => navigate('/student/search')}>Browse Internships</button>
        </StudentNavbar>

        <div className="ie-content dash-layout">
          {/* Sidebar */}
          <aside className="dash-sidebar">
            <div className="sidebar-avatar"></div>
            <div className="sidebar-name">{user?.email?.split('@')[0] || 'Student'}</div>
            <div className="sidebar-email">{user?.email}</div>

            <div className="sidebar-label">Menu</div>
            {[
              { id: 'overview', icon: '🏠', label: 'Overview' },
              { id: 'applications', icon: '📄', label: 'Applications' },
              { id: 'saved', icon: '🔖', label: 'Saved' },
              { id: 'messages', icon: '💬', label: 'Messages' },
            ].map(item => (
              <button key={item.id}
                className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}>
                <span className="sidebar-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}

            <div className="sidebar-label" style={{ marginTop: '24px' }}>Account</div>
            {[
              { icon: '👤', label: 'My Profile', path: '/student/profile' },
              { icon: '📎', label: 'Upload CV', path: '/student/upload-cv' },
            ].map(item => (
              <button key={item.label} className="sidebar-item" onClick={() => navigate(item.path)}>
                <span className="sidebar-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}

            <button className="logout-btn" onClick={() => { logout(); navigate('/'); }}>
              Sign Out
            </button>
          </aside>

          {/* Main content */}
          <main className="dash-main">
            {activeTab === 'overview' && (
              <>
                <div className="dash-header ie-animate">
                  <h1 className="dash-greeting">
                    Good day, <span>{user?.email?.split('@')[0] || 'there'}</span> 
                  </h1>
                  <p className="dash-sub">Here's a summary of your internship journey.</p>
                </div>

                <div className="stat-grid ie-animate-2">
                  <div className="stat-card">
                    <div className="stat-card-label">Applications</div>
                    <div className="stat-card-value">{applications.length}</div>
                    <div className="stat-card-sub">Total submitted</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-label">Accepted</div>
                    <div className="stat-card-value" style={{ color: '#48bb78' }}>
                      {applications.filter(a => a.status === 'accepted').length}
                    </div>
                    <div className="stat-card-sub">Offers received</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-label">Pending</div>
                    <div className="stat-card-value" style={{ color: '#f6ad55' }}>
                      {applications.filter(a => a.status === 'pending').length}
                    </div>
                    <div className="stat-card-sub">Awaiting response</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-label">Saved</div>
                    <div className="stat-card-value" style={{ color: '#63b3ed' }}>{saved.length}</div>
                    <div className="stat-card-sub">Bookmarked listings</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-label">Messages</div>
                    <div className="stat-card-value" style={{ color: '#9f7aea' }}>
                      {conversations.length}
                    </div>
                    <div className="stat-card-sub">Active chats</div>
                  </div>
                </div>

                <div className="quick-actions ie-animate-3">
                  <button className="quick-btn" onClick={() => navigate('/student/search')}> Browse Internships</button>
                  <button className="quick-btn" onClick={() => navigate('/student/upload-cv')}> Upload / Update CV</button>
                  <button className="quick-btn" onClick={() => navigate('/student/profile')}> Edit Profile</button>
                  <button className="quick-btn" onClick={() => setActiveTab('applications')}> All Applications</button>
                  <button className="quick-btn" onClick={() => navigate('/student/report')}
                    style={{ background: 'rgba(43,108,176,0.12)', borderColor: 'rgba(99,179,237,0.3)', color: '#90cdf4' }}>
                     Generate Report
                  </button>
                </div>

                <div className="recent-apps-section">
                  <div className="section-title">Recent Applications</div>
                  {applications.length === 0 ? (
                    <EmptyState
                      icon=""
                      title="No applications yet"
                      message="You haven't applied to any internships yet. Start exploring opportunities that match your skills!"
                      btnLabel=" Browse Internships"
                      btnPath="/student/search"
                    />
                  ) : (
                    applications.slice(0, 3).map(app => {
                      const isRecent = app.applied_full && (new Date() - new Date(app.applied_full) < 60000);
                      return (
                        <div className={`app-card ${isRecent ? 'recent' : ''}`} key={app.id}
                          onClick={() => navigate(`/student/internship/${app.id}`)}>
                          <div className="app-info">
                            <div className="app-title">
                              {app.title}
                              {isRecent && <span className="new-badge">NEW</span>}
                            </div>
                            <div className="app-company">{app.company}</div>
                          </div>
                          <div className="app-right">
                            <span className="app-match"> {app.match}% match</span>
                            <span className="status-badge"
                              style={{ background: statusBg(app.status), color: statusColor(app.status) }}>
                              {app.status}
                            </span>
                            <span className="app-date">{app.applied_at}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}

            {activeTab === 'applications' && (
              <div className="ie-animate">
                <div className="dash-header">
                  <h1 className="dash-greeting">My <span>Applications</span></h1>
                  <p className="dash-sub">Track all your internship applications.</p>
                </div>
                {applications.length === 0 ? (
                  <EmptyState
                    icon=""
                    title="No applications yet"
                    message="You haven't applied to any internships yet. Browse listings and find your perfect match!"
                    btnLabel=" Browse Internships"
                    btnPath="/student/search"
                  />
                ) : (
                  applications.map(app => {
                    const isRecent = app.applied_full && (new Date() - new Date(app.applied_full) < 60000);
                    return (
                      <div className={`app-card ${isRecent ? 'recent' : ''}`} key={app.id}
                        onClick={() => navigate(`/student/internship/${app.id}`)}>
                        <div className="app-info">
                          <div className="app-title">
                            {app.title}
                            {isRecent && <span className="new-badge">NEW</span>}
                          </div>
                          <div className="app-company">{app.company}  Applied {app.applied_at}</div>
                        </div>
                        <div className="app-right">
                          <span className="app-match"> {app.match}% match</span>
                          <span className="status-badge"
                            style={{ background: statusBg(app.status), color: statusColor(app.status) }}>
                            {app.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'saved' && (
              <div className="ie-animate">
                <div className="dash-header">
                  <h1 className="dash-greeting">Saved <span>Internships</span></h1>
                  <p className="dash-sub">Internships you've bookmarked for later.</p>
                </div>
                <div className="saved-grid">
                  {saved.map(s => (
                    <div className="saved-card" key={s.id}
                      onClick={() => navigate(`/student/internship/${s.id}`)}>
                      <div className="saved-title">{s.title}</div>
                      <div className="saved-company">{s.company}</div>
                      <div className="saved-tags">
                        <span className="tag"> {s.location}</span>
                        <span className="tag"> {s.duration_weeks}w</span>
                      </div>
                    </div>
                  ))}
                </div>
                {saved.length === 0 && (
                  <EmptyState
                    icon=""
                    title="No saved internships"
                    message="You haven't bookmarked any internships yet. Save listings you're interested in to easily find them later."
                    btnLabel=" Browse Internships"
                    btnPath="/student/search"
                  />
                )}
              </div>
            )}
            {activeTab === 'messages' && (
              <div className="ie-animate">
                <div className="dash-header">
                  <h1 className="dash-greeting">My <span>Messages</span></h1>
                  <p className="dash-sub">Stay connected with companies you've messaged.</p>
                </div>
                
                <div className="conversations-list">
                  {conversations.length === 0 ? (
                    <EmptyState
                      icon=""
                      title="No messages yet"
                      message="You haven't started any conversations with companies yet. Find an internship and reach out to learn more!"
                      btnLabel=" Browse Internships"
                      btnPath="/student/search"
                    />
                  ) : (
                    conversations.map(c => (
                      <div key={c.partnerId} className="app-card"
                        onClick={() => navigate(`/messages/${c.partnerId}?name=${c.partnerName}`)}>
                        <div className="sidebar-avatar" style={{ marginBottom: 0, marginRight: 16 }}>{c.partnerName[0]}</div>
                        <div className="app-info">
                          <div className="app-title">{c.partnerName}</div>
                          <div className="app-company">{c.lastMessage}</div>
                        </div>
                        <div className="app-right">
                          <span className="app-date">{c.lastTimestamp}</span>
                          <span style={{ fontSize: 18 }}></span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

export default Dashboard;

