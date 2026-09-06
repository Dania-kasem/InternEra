import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function AdminNavbar({ children }) {
  const navigate = useNavigate();

  return (
    <nav className="ie-nav ie-content">
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <div className="ie-nav-logo" onClick={() => navigate('/admin/dashboard')}>
          <span className="intern">Intern</span><span className="era">Era</span>
          <span style={{ fontSize: '11px', fontWeight: 'bold', marginLeft: '10px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(99,179,237,0.15)', color: '#90cdf4', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Admin
          </span>
        </div>
        {children}
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <ThemeToggle />
      </div>
    </nav>
  );
}
