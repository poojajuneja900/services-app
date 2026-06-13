import { useState } from 'react';
import './index.css';
import Dashboard  from './pages/Dashboard';
import Categories from './pages/Categories';
import Users      from './pages/Users';
import Services   from './pages/Services';

const PAGES = [
  { id: 'dashboard',   label: 'Dashboard',   icon: '📊' },
  { id: 'categories',  label: 'Categories',  icon: '🗂️' },
  { id: 'users',       label: 'Users',       icon: '👤' },
  { id: 'services',    label: 'Services',    icon: '🛠️' },
];

export default function App() {
  const [page, setPage] = useState('dashboard');

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
      <main className="main">
        {renderPage()}
      </main>
    </div>
  );
}
