import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{ padding: '10px 20px', background: '#1a1a2e', color: 'white', display: 'flex', gap: '20px', alignItems: 'center' }}>
      <img src="/logo.png" alt="InternEra Logo" style={{ height: '24px', width: 'auto' }} />
      {!user && <Link to="/student/login" style={{ color: 'white' }}>Student Login</Link>}
      {!user && <Link to="/student/register" style={{ color: 'white' }}>Student Register</Link>}
      {!user && <Link to="/company/login" style={{ color: 'white' }}>Company Login</Link>}
      {user && <span>Welcome, {user.email}</span>}
      {user && <button onClick={handleLogout}>Logout</button>}
    </nav>
  );
}

export default Navbar;
