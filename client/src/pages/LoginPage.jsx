import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../api/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.redirectTo || '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please provide both username and password.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await login(username.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = () => {
    setUsername('demo');
    setPassword('demo1234');
    setError(null);
  };

  return (
    <div className="page page--narrow">
      <div className="form-card">
        <div className="form-card__header">
          <Link to="/" className="back-link">
            &larr; Back to marketplace
          </Link>
          <h1 className="form-card__title">Sign In</h1>
          <p className="form-card__subtitle">
            Sign in to create listings or manage your posted items.
          </p>
        </div>

        <div className="demo-credentials-banner">
          <div className="demo-credentials-text">
            <span>Demo account: <code>demo</code> / <code>demo1234</code></span>
          </div>
          <button type="button" className="btn-demo-fill" onClick={fillDemo}>
            Fill credentials
          </button>
        </div>

        {error && (
          <div className="alert alert--error" role="alert">
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" style={{ flexShrink: 0 }}>
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="login-username" className="form-label">
              Username
            </label>
            <input
              id="login-username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn--primary btn--full"
              disabled={submitting}
              id="login-submit-btn"
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
