import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2 } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout/AuthLayout';
import { useAuth } from '../../features/auth/hooks/useAuth';
import './Login.css';

const Login = () => {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      await login({ email, password });
      navigate('/home'); // Redirect after login
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your credentials to access your second brain"
      footer={(
        <div className="auth-footer">
          Don't have an account?
          <Link to="/signup" className="auth-link">Sign up</Link>
        </div>
      )}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && (
          <div style={{
            color: '#ef4444',
            background: 'rgba(239, 68, 68, 0.1)',
            padding: '10px',
            borderRadius: '8px',
            fontSize: 'var(--text-xs)',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <div className="auth-field">
          <label className="auth-label" htmlFor="email">Email address</label>
          <div className="auth-input-wrapper">
            <Mail className="auth-input-icon" size={18} />
            <input
              className="auth-input"
              type="email"
              name="email"
              id="email"
              placeholder="name@company.com"
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="auth-label" htmlFor="password">Password</label>
            <a href="#" className="auth-forgot">Forgot password?</a>
          </div>
          <div className="auth-input-wrapper">
            <Lock className="auth-input-icon" size={18} />
            <input
              className="auth-input"
              type="password"
              name="password"
              id="password"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          className="auth-btn-primary"
          type="submit"
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;
