import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:8080/api/auth/login', {
        email: form.email.trim(),
        password: form.password,
      });

      const user = res.data;

      if (user && user.id) {
        login(user);
        navigate('/dashboard');
      } else {
        setError('Invalid response from server. Try again.');
      }

    } catch (err) {
      // Show the REAL error message
      if (err.response) {
        // Server responded with error status
        const status = err.response.status;
        const msg = err.response.data;

        if (status === 401) {
          setError('Wrong email or password. Please try again.');
        } else if (status === 400) {
          setError('Bad request: ' + msg);
        } else if (status === 500) {
          setError('Server error: ' + msg);
        } else {
          setError(`Error ${status}: ${msg}`);
        }
      } else if (err.request) {
        // No response — backend not running
        setError('Cannot connect to server. Is Spring Boot running on port 8080?');
      } else {
        setError('Error: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Welcome back</h1>
          <p style={{ color: 'var(--muted)', fontSize: '15px' }}>
            Sign in to your LostFound account
          </p>
        </div>

        <div className="card">

          {/* Error box */}
          {error && (
            <div style={{
              background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: '#f87171',
              fontSize: '14px',
              lineHeight: 1.5,
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            <div>
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              className="btn-primary"
              type="submit"
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

          </form>
        </div>

        <p style={{
          textAlign: 'center',
          marginTop: '20px',
          color: 'var(--muted)',
          fontSize: '14px',
        }}>
          No account?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
            Register here
          </Link>
        </p>

      </div>
    </div>
  );
}