import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Loader2 } from 'lucide-react';
import AuthLayout from '../../components/AuthLayout/AuthLayout';
import { useAuth } from '../../hooks/useAuth';
import './Signup.css';

const Signup = () => {
  const { signup, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      await signup({ name, email, password });
      navigate('/home'); // Redirect after signup
    } catch (err) {
      console.error('Signup failed:', err);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Start building your connected knowledge today"
      footer={(
        <div className="auth-footer">
          Already have an account?
          <Link to="/login" className="auth-link">Log in</Link>
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
          <label className="auth-label" htmlFor="name">Full Name</label>
          <div className="auth-input-wrapper">
            <User className="auth-input-icon" size={18} />
            <input
              className="auth-input"
              type="text"
              name="name"
              id="name"
              placeholder="John Doe"
              required
            />
          </div>
        </div>

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
          <label className="auth-label" htmlFor="password">Password</label>
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
          {loading ? <Loader2 className="animate-spin" size={18} /> : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Signup;
