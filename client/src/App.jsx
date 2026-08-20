import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './api/AuthContext';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import CreateListingPage from './pages/CreateListingPage';
import LoginPage from './pages/LoginPage';

function NavBar() {
  const { isAuthenticated, username, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          <div className="brand-logo-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <span className="brand-name">Gimme</span>
        </Link>

        <nav className="navbar__nav">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'nav-link--active' : ''}`}
          >
            Browse
          </Link>

          <Link
            to="/create"
            className="btn btn--sell"
            id="nav-sell-btn"
          >
            Sell an Item
          </Link>

          {isAuthenticated ? (
            <div className="navbar__user-menu">
              <div className="user-pill">
                <span className="user-avatar">{username ? username[0].toUpperCase() : 'U'}</span>
                <span className="user-name">{username}</span>
              </div>
              <button
                type="button"
                className="btn btn--logout"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                id="nav-logout-btn"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className={`btn btn--login ${location.pathname === '/login' ? 'btn--login-active' : ''}`}
              id="nav-login-btn"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__left">
          <p className="footer__brand">Gimme</p>
          <p className="footer__text">Buy and sell pre-owned items locally.</p>
        </div>
        <div className="footer__right">
          <p className="footer__copyright">&copy; {new Date().getFullYear()} Gimme Marketplace</p>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="app-layout">
        <NavBar />
        <main className="container">
          <Routes>
            <Route path="/" element={<ListingsPage />} />
            <Route path="/listings/:id" element={<ListingDetailPage />} />
            <Route path="/create" element={<CreateListingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<ListingsPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
