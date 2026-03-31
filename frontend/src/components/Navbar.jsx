import { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0 32px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link to="/dashboard" style={{ textDecoration: 'none' }}>
        <span style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: '20px', color: 'var(--accent)' }}>
          🔍 LostFound
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Link to="/dashboard" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '14px' }}>Dashboard</Link>
        <Link to="/add-item" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '14px' }}>Report Item</Link>
        {user && (
          <>
            <span style={{ color: 'var(--text)', fontSize: '14px' }}>👤 {user.name}</span>
            <button className="btn-secondary" style={{ padding: '8px 18px', fontSize: '13px' }} onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}