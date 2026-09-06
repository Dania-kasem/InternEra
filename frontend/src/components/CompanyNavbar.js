import { useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme';

export default function CompanyNavbar({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const t = getTheme(isDark);
  
  const showBack = location.pathname !== '/company/dashboard' && location.pathname !== '/';

  return (
    <>
      <nav className="ie-nav ie-content">
      <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
        <div className="ie-nav-logo" onClick={() => navigate('/')}>
          <span className="intern">Intern</span><span className="era">Era</span>
        </div>
        {children}
      </div>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <ThemeToggle />
      </div>
      </nav>
      {showBack && (
        <button 
          onClick={() => navigate(-1)}
          style={{ 
            position: 'fixed', 
            top: '85px', 
            left: '32px', 
            zIndex: 50, 
            padding: '8px 16px', 
            background: t.bgCard, 
            border: `1px solid ${t.border}`, 
            color: t.textPrimary, 
            borderRadius: '10px', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontWeight: '600', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            fontFamily: "'Sora', sans-serif",
            fontSize: '13px'
          }}
          onMouseOver={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textPrimary; }}
        >
          <span style={{ fontSize: '16px' }}>←</span> Back
        </button>
      )}
    </>
  );
}
