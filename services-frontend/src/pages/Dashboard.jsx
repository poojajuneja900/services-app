import { useEffect, useState } from 'react';
import { categoryApi, userApi, serviceApi } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({ categories: 0, users: 0, services: 0 });
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([categoryApi.getAll(), userApi.getAll(), serviceApi.getAll()])
      .then(([cats, usrs, svcs]) => {
        setStats({ categories: cats.length, users: usrs.length, services: svcs.length });
        setServices(svcs.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Welcome back — here's what's happening</p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon purple">🗂️</div>
          <div className="stat-info">
            <h3>{loading ? '—' : stats.categories}</h3>
            <p>Categories</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">👤</div>
          <div className="stat-info">
            <h3>{loading ? '—' : stats.users}</h3>
            <p>Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">🛠️</div>
          <div className="stat-info">
            <h3>{loading ? '—' : stats.services}</h3>
            <p>Services</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Recent Services</h3>
        </div>
        {loading ? (
          <div className="loading"><div className="spinner" /><p>Loading…</p></div>
        ) : services.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🛠️</div><p>No services yet.</p></div>
        ) : (
          <table>
            <thead>
              <tr><th>Title</th><th>Category</th><th>Provider</th><th>Amount</th></tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id}>
                  <td><strong>{s.title}</strong></td>
                  <td><span className="badge">{s.category?.categoryName}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{s.user?.name}</td>
                  <td><span className="amount">₹{parseFloat(s.amount).toFixed(2)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
