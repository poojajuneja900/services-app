import { useState, useRef, useEffect } from 'react';
import './index.css';
import Dashboard    from './pages/Dashboard';
import Categories   from './pages/Categories';
import Users        from './pages/Users';
import Services     from './pages/Services';
import RegisterPage from './pages/RegisterPage';
import LoginPage    from './pages/LoginPage';
import { authApi }  from './api';

const PAGES = [
  { id: 'dashboard',  label: 'Dashboard',  icon: '📊' },
  { id: 'categories', label: 'Categories', icon: '🗂️' },
  { id: 'users',      label: 'Users',      icon: '👤' },
  { id: 'services',   label: 'Services',   icon: '🛠️' },
];

export default function App() {
  const [user,       setUser]       = useState(null);
  const [authView,   setAuthView]   = useState('register');
  const [page,       setPage]       = useState('dashboard');
  const [loggingOut, setLoggingOut] = useState(false);
  const [dropOpen,   setDropOpen]   = useState(false);
  const dropRef = useRef(null);

  /* Close dropdown when clicking outside */
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Auth handlers ── */
  const handleRegistered = (userData) => setUser(userData);
  const handleLoggedIn   = (userData) => setUser(userData);

  const handleLogout = async () => {
    setLoggingOut(true);
    setDropOpen(false);
    try { await authApi.logout(); } catch (_) { /* ignore */ }
    setUser(null);
    setAuthView('register');
    setLoggingOut(false);
  };

  /* ── Not logged in → show auth screens ── */
  if (!user) {
    return authView === 'register'
      ? <RegisterPage
          onRegistered={handleRegistered}
          onGoToLogin={() => setAuthView('login')}
        />
      : <LoginPage
          onLoggedIn={handleLoggedIn}
          onGoToRegister={() => setAuthView('register')}
        />;
  }

  /* ── Logged in → full dashboard ── */
  const renderPage = () => {
    switch (page) {
      case 'dashboard':  return <Dashboard />;
      case 'categories': return <Categories />;
      case 'users':      return <Users />;
      case 'services':   return <Services />;
      default:           return <Dashboard />;
    }
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>⚡ ServiceApp</h1>
          <p>Admin Dashboard</p>
        </div>
        <nav>
          {PAGES.map(p => (
            <button
              key={p.id}
              className={`nav-item ${page === p.id ? 'active' : ''}`}
              onClick={() => setPage(p.id)}
            >
              <span className="nav-icon">{p.icon}</span>
              {p.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            API: <span style={{ color: 'var(--accent2)' }}>localhost:8080</span>
          </p>
        </div>
      </aside>

      {/* ── Top bar ── */}
      <header className="topbar">
        <span className="topbar-title">
          {PAGES.find(p => p.id === page)?.icon} {PAGES.find(p => p.id === page)?.label}
        </span>

        {/* User dropdown */}
        <div className="user-menu" ref={dropRef}>
          <button
            id="btn-user-menu"
            className="user-pill"
            onClick={() => setDropOpen(o => !o)}
            aria-haspopup="true"
            aria-expanded={dropOpen}
          >
            <span className="user-pill-avatar">
              {user.name ? user.name[0].toUpperCase() : '?'}
            </span>
            <span className="user-pill-name">{user.name}</span>
            <span className={`user-pill-caret ${dropOpen ? 'open' : ''}`}>▾</span>
          </button>

          {dropOpen && (
            <div className="user-dropdown" role="menu">
              <div className="user-dropdown-header">
                <div className="user-dropdown-avatar">
                  {user.name ? user.name[0].toUpperCase() : '?'}
                </div>
                <div>
                  <div className="user-dropdown-name">{user.name}</div>
                  <div className="user-dropdown-email">{user.email}</div>
                  <span className="badge" style={{ marginTop: '4px', fontSize: '0.7rem' }}>
                    {user.userType}
                  </span>
                </div>
              </div>

              <div className="user-dropdown-divider" />

              <button
                id="btn-logout"
                className="user-dropdown-item user-dropdown-item--danger"
                onClick={handleLogout}
                disabled={loggingOut}
                role="menuitem"
              >
                <span>🚪</span>
                {loggingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="main">
        {renderPage()}
      </main>
    </div>
  );
}
