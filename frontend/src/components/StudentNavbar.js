import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function StudentNavbar({ children }) {
  const navigate = useNavigate();

  return (
    <nav className="ie-nav ie-content">
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <div className="ie-nav-logo" onClick={() => navigate('/')}>
          <span className="intern">Intern</span><span className="era">Era</span>
        </div>
        {children}
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <ThemeToggle />
      </div>
    </nav>
  );
}
