import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { globalStyles, getTheme } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import StudentNavbar from '../../components/StudentNavbar';
import API from '../../api/api';


function CompanyProfileView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const t = getTheme(isDark);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await API.get(`/companies/${id}`);
        const c = res?.data || {};
        setCompany({
          id: c.company_id,
          name: c.company_name || 'Company',
          location: c.location || 'N/A',
          employees: 'N/A',
          founded: 'N/A',
          website: c.website || 'N/A',
          email: c.company_email || 'N/A',
          industry: c.industry || 'Technology',
          description: c.description || 'No company description available.',
          logo: (c.company_name || 'CO').slice(0, 2).toUpperCase()
        });
      } catch {
        setCompany(null);
      }
    };
    fetchCompany();
  }, [id]);

  if (!company) {
    return (
      <div className="ie-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: t.textPrimary, marginBottom: 12 }}>Company not found</h2>
          <button className="ie-btn ie-btn-primary" onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  const styles = `
    ${globalStyles(isDark)}
    .profile-container { padding: 100px 48px 60px; max-width: 1000px; margin: 0 auto; }
    .profile-header {
      display: flex; align-items: center; gap: 32px; margin-bottom: 40px;
      padding-bottom: 40px; border-bottom: 1px solid ${t.border};
    }
    .profile-logo {
      width: 120px; height: 120px; border-radius: 24px;
      background: ${t.bgCard}; border: 1px solid ${t.border};
      display: flex; align-items: center; justify-content: center;
      font-size: 56px; flex-shrink: 0;
    }
    .profile-info h1 {
      font-family: 'DM Serif Display', serif; font-size: 42px;
      color: ${t.textPrimary}; margin-bottom: 8px;
    }
    .profile-meta { display: flex; gap: 20px; flex-wrap: wrap; }
    .meta-item { display: flex; align-items: center; gap: 8px; font-size: 14px; color: ${t.textSecondary}; }
    
    .profile-content { display: grid; grid-template-columns: 2fr 1fr; gap: 40px; }
    .content-section { margin-bottom: 32px; }
    .section-title { font-size: 18px; font-weight: 700; color: ${t.textPrimary}; margin-bottom: 16px; }
    .section-text { font-size: 15px; color: ${t.textSecondary}; line-height: 1.8; }
    
    .sidebar-card {
      background: ${t.bgCard}; border: 1px solid ${t.border};
      border-radius: 20px; padding: 24px; position: sticky; top: 100px;
    }
    .contact-item { margin-bottom: 20px; }
    .contact-label { font-size: 12px; font-weight: 700; color: ${t.textMuted}; text-transform: uppercase; margin-bottom: 4px; }
    .contact-value { font-size: 14px; color: ${t.textPrimary}; font-weight: 600; word-break: break-all; }
    
    .msg-btn { width: 100%; margin-top: 12px; }
    
    @media (max-width: 768px) {
      .profile-header { flex-direction: column; text-align: center; }
      .profile-content { grid-template-columns: 1fr; }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="ie-page">
        <div className="ie-bg" /><div className="ie-grid" />
        <StudentNavbar />
        
        <div className="ie-content profile-container">
          <div className="profile-header ie-animate">
            <div className="profile-logo">{company.logo}</div>
            <div className="profile-info">
              <div className="ie-badge" style={{ marginBottom: 12 }}>{company.industry}</div>
              <h1>{company.name}</h1>
              <div className="profile-meta">
                <span className="meta-item">📍 {company.location}</span>
                <span className="meta-item">👥 {company.employees} employees</span>
                <span className="meta-item">📅 Founded {company.founded}</span>
              </div>
            </div>
          </div>
          
          <div className="profile-content">
            <div className="ie-animate-2">
              <div className="content-section">
                <h2 className="section-title">About Company</h2>
                <p className="section-text">{company.description}</p>
              </div>
              
              <div className="content-section">
                <h2 className="section-title">Why Join Us?</h2>
                <p className="section-text">
                  We offer a collaborative environment where interns work on real-world projects. 
                  You'll be mentored by industry experts and have access to the latest tech stack. 
                  Many of our interns transition into full-time roles.
                </p>
              </div>
            </div>
            
            <div className="ie-animate-3">
              <aside className="sidebar-card">
                <div className="contact-item">
                  <div className="contact-label">Website</div>
                  <div className="contact-value">{company.website}</div>
                </div>
                <div className="contact-item">
                  <div className="contact-label">Contact Email</div>
                  <div className="contact-value">{company.email}</div>
                </div>
                
                <button className="ie-btn ie-btn-primary msg-btn"
                  onClick={() => navigate(`/messages/${company.id}?name=${company.name}`)}>
                  💬 Message This Company
                </button>
                
                <button className="ie-btn ie-btn-ghost msg-btn"
                  style={{ marginTop: 12 }}
                  onClick={() => navigate(-1)}>
                  ← Go Back
                </button>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CompanyProfileView;
