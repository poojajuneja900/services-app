import { useState, useEffect } from 'react';
import { userApi } from '../api';

function UserModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState({
    name:  initial?.name  || '',
    email: initial?.email || '',
  });
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handle = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) { setError('All fields are required'); return; }
    setSaving(true);
    try {
      await (initial ? userApi.update(initial.id, form) : userApi.create(form));
      onSave();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>{initial ? '✏️ Edit User' : '➕ New User'}</h3>
        {error && <div className="alert alert-error">⚠ {error}</div>}
        <form onSubmit={handle}>
          <div className="form-group">
            <label>Full Name</label>
            <input placeholder="e.g. Pooja Juneja" value={form.name} onChange={set('name')} autoFocus />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="e.g. pooja@example.com" value={form.email} onChange={set('email')} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Users() {
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [modal, setModal]   = useState(null);

  const load = async () => {
    setLoading(true);
    try { setData(await userApi.getAll()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!confirm('Delete this user?')) return;
    try { await userApi.delete(id); load(); }
    catch (err) { alert(err.message); }
  };

  const initials = (name) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Users</h2>
          <p>Manage registered users</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('create')}>+ New User</button>
      </div>

      {error && <div className="alert alert-error">⚠ {error}</div>}

      <div className="card">
        <div className="card-header">
          <h3>All Users ({data.length})</h3>
        </div>
        {loading ? (
          <div className="loading"><div className="spinner" /><p>Loading…</p></div>
        ) : data.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">👤</div><p>No users yet.</p></div>
        ) : (
          <table>
            <thead><tr><th>ID</th><th>User</th><th>Email</th><th>Actions</th></tr></thead>
            <tbody>
              {data.map(u => (
                <tr key={u.id}>
                  <td><span className="badge">#{u.id}</span></td>
                  <td style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                    }}>{initials(u.name)}</div>
                    {u.name}
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => setModal(u)}>✏️ Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(u.id)}>🗑️ Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <UserModal
          initial={modal === 'create' ? null : modal}
          onSave={() => { setModal(null); load(); }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
