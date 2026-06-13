import { useState, useEffect } from 'react';
import { categoryApi } from '../api';

function CategoryModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState({ categoryName: initial?.categoryName || '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    if (!form.categoryName.trim()) { setError('Category name is required'); return; }
    setSaving(true);
    try {
      await (initial ? categoryApi.update(initial.id, form) : categoryApi.create(form));
      onSave();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>{initial ? '✏️ Edit Category' : '➕ New Category'}</h3>
        {error && <div className="alert alert-error">⚠ {error}</div>}
        <form onSubmit={handle}>
          <div className="form-group">
            <label>Category Name</label>
            <input
              placeholder="e.g. Home Services"
              value={form.categoryName}
              onChange={e => setForm({ categoryName: e.target.value })}
              autoFocus
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Categories() {
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [modal, setModal]   = useState(null); // null | 'create' | {id,...}

  const load = async () => {
    setLoading(true);
    try { setData(await categoryApi.getAll()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!confirm('Delete this category?')) return;
    try { await categoryApi.delete(id); load(); }
    catch (err) { alert(err.message); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Categories</h2>
          <p>Manage service categories</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('create')}>+ New Category</button>
      </div>

      {error && <div className="alert alert-error">⚠ {error}</div>}

      <div className="card">
        <div className="card-header">
          <h3>All Categories ({data.length})</h3>
        </div>
        {loading ? (
          <div className="loading"><div className="spinner" /><p>Loading…</p></div>
        ) : data.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🗂️</div><p>No categories yet. Create one!</p></div>
        ) : (
          <table>
            <thead><tr><th>ID</th><th>Category Name</th><th>Actions</th></tr></thead>
            <tbody>
              {data.map(c => (
                <tr key={c.id}>
                  <td><span className="badge">#{c.id}</span></td>
                  <td>{c.categoryName}</td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => setModal(c)}>✏️ Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(c.id)}>🗑️ Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <CategoryModal
          initial={modal === 'create' ? null : modal}
          onSave={() => { setModal(null); load(); }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
