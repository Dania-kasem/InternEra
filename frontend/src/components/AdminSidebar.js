import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { id: 'dashboard',         icon: '⊞',  label: 'Dashboard',      path: '/admin/dashboard' },
  { id: 'students',          icon: '🎓', label: 'Students',        path: '/admin/students' },
  { id: 'companies',         icon: '🏢', label: 'Companies',       path: '/admin/companies' },
  { id: 'internships',       icon: '💼', label: 'Internships',     path: '/admin/internships' },
  { id: 'applications',      icon: '📋', label: 'Applications',    path: '/admin/applications' },
  { id: 'reports',           icon: '📈', label: 'Reports',         path: '/admin/reports' },
  { id: 'verify-internships',icon: '🤖', label: 'AI Verification', path: '/admin/verify-internships' },
];

/**
 * Shared admin sidebar component.
 * @param {string} activeId — must match one of the navItems id values
 */
export default function AdminSidebar({ activeId }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    logout();
    navigate('/login');
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-avatar">🛡️</div>
      <div className="admin-name">Admin</div>
      <div className="admin-role">InternEra Admin Panel</div>

      <div className="sidebar-label">Menu</div>
      {navItems.map(item => (
        <button
          key={item.id}
          className={`sidebar-item ${activeId === item.id ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <span className="sidebar-icon">{item.icon}</span>
          {item.label}
        </button>
      ))}

      <button className="logout-btn" style={{ marginTop: '24px' }} onClick={handleLogout}>
        🚪 Sign Out
      </button>
    </aside>
  );
}
