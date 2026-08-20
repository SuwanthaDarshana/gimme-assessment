import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../api/AuthContext';

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.redirectTo || '/';

  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanUser = username.trim();

    if (!cleanUser || !password) {
      setError('Please provide both username and password.');
      return;
    }

    if (isRegister) {
      if (cleanUser.length < 3) {
        setError('Username must be at least 3 characters.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setSubmitting(true);
    setError(null);
    try {
      if (isRegister) {
        await register(cleanUser, password);
      } else {
        await login(cleanUser, password);
      }
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || (isRegister ? 'Registration failed.' : 'Login failed. Please check your credentials.'));
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = () => {
    setIsRegister(false);
    setUsername('demo');
    setPassword('demo1234');
    setError(null);
  };

  const toggleMode = (mode) => {
    setIsRegister(mode === 'register');
    setError(null);
  };

  return (
    <div className="page page--narrow">
      <div className="form-card">
        <div className="form-card__header">
          <Link to="/" className="back-link">
            &larr; Back to marketplace
          </Link>
          <h1 className="form-card__title">
            {isRegister ? 'Create Account' : 'Sign In'}
          </h1>
          <p className="form-card__subtitle">
            {isRegister
              ? 'Join Gimme to list items and connect with local buyers.'
              : 'Sign in to create listings or manage your posted items.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tab-bar">
          <button
            type="button"
            className={`auth-tab ${!isRegister ? 'auth-tab--active' : ''}`}
            onClick={() => toggleMode('login')}
            id="tab-login"
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${isRegister ? 'auth-tab--active' : ''}`}
            onClick={() => toggleMode('register')}
            id="tab-register"
          >
            Register
          </button>
        </div>

        {!isRegister && (
          <div className="demo-credentials-banner">
            <div className="demo-credentials-text">
              <span>Demo account: <code>demo</code> / <code>demo1234</code></span>
            </div>
            <button type="button" className="btn-demo-fill" onClick={fillDemo}>
              Fill credentials
            </button>
          </div>
        )}

        {isRegister && (
          <div className="register-info-banner">
            <span>Choose a username (3+ chars) and password (6+ chars).</span>
          </div>
        )}

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
              placeholder={isRegister ? 'Choose a username (min 3 chars)' : 'Enter username'}
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
              placeholder={isRegister ? 'Choose a password (min 6 chars)' : 'Enter password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label htmlFor="login-confirm-password" className="form-label">
                Confirm Password
              </label>
              <input
                id="login-confirm-password"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn--primary btn--full"
              disabled={submitting}
              id="login-submit-btn"
            >
              {submitting
                ? (isRegister ? 'Creating account...' : 'Signing in...')
                : (isRegister ? 'Create Account' : 'Sign in')}
            </button>
          </div>

          <div className="auth-toggle-footer">
            <span>
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            </span>
            <button
              type="button"
              className="btn-link-toggle"
              onClick={() => toggleMode(isRegister ? 'login' : 'register')}
            >
              {isRegister ? 'Sign in here' : 'Register here'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
