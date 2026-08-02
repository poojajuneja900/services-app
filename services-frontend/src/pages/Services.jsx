import { useState, useEffect } from 'react';
import { serviceApi, categoryApi, userApi } from '../api';

function ServiceModal({ initial, categories, currentUser, onSave, onClose }) {
  const [form, setForm] = useState({
    title:       initial?.title       || '',
    description: initial?.description || '',
    amount:      initial?.amount      || '',
    unit:        initial?.unit        || '',
    mainCategoryId: initial?.category?.parentCategoryId || (initial?.category ? initial?.category?.id : ''),
    categoryId: initial?.category?.parentCategoryId ? initial?.category?.id : '',
  });
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handle = async (e) => {
    e.preventDefault();
    const finalCategoryId = form.categoryId || form.mainCategoryId;
    if (!form.title || !form.amount || !finalCategoryId) {
      setError('Title, amount, and category are required'); return;
    }
    const body = {
      title:       form.title,
      description: form.description,
      amount:      parseFloat(form.amount),
      unit:        form.unit,
      category:    { id: parseInt(finalCategoryId) },
      user:        { id: initial?.user?.id || currentUser.id },
    };
    setSaving(true);
    try {
      await (initial ? serviceApi.update(initial.id, body) : serviceApi.create(body));
      onSave();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <h3>{initial ? '✏️ Edit Service' : '➕ New Service'}</h3>
        {error && <div className="alert alert-error">⚠ {error}</div>}
        <form onSubmit={handle}>
          <div className="form-group">
            <label>Title</label>
            <input placeholder="e.g. House Cleaning" value={form.title} onChange={set('title')} autoFocus />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea placeholder="Describe the service…" value={form.description} onChange={set('description')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Amount (₹)</label>
              <input type="number" step="0.01" placeholder="499.99" value={form.amount} onChange={set('amount')} />
            </div>
            <div className="form-group">
              <label>Unit</label>
              <input placeholder="per visit / hr" value={form.unit} onChange={set('unit')} />
            </div>
          </div>
          <div className="form-group">
            <label>Category</label>
            <select 
              value={form.mainCategoryId} 
              onChange={(e) => setForm(f => ({ ...f, mainCategoryId: e.target.value, categoryId: '' }))}
            >
              <option value="">Select category…</option>
              {categories.filter(c => !c.parentCategoryId).map(c => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
            </select>
          </div>
          
          {form.mainCategoryId && (() => {
            const selectedMainCat = categories.find(c => c.id === Number(form.mainCategoryId));
            const isOthers = selectedMainCat && selectedMainCat.categoryName.toLowerCase() === 'others';
            
            if (isOthers) return null;

            return (
              <div className="form-group">
                <label>Sub Category</label>
                <select 
                  value={form.categoryId} 
                  onChange={set('categoryId')}
                  disabled={!form.mainCategoryId || !categories.some(c => c.parentCategoryId === Number(form.mainCategoryId))}
                >
                  <option value="">
                    {!form.mainCategoryId 
                      ? "Select main category first…" 
                      : !categories.some(c => c.parentCategoryId === Number(form.mainCategoryId)) 
                        ? "No subcategories available" 
                        : "Select sub category…"}
                  </option>
                  {form.mainCategoryId && categories.filter(c => c.parentCategoryId === Number(form.mainCategoryId)).map(c => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
                </select>
              </div>
            );
          })()}
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Services({ currentUser }) {
  const [data, setData]           = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [modal, setModal]         = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [svcs, cats] = await Promise.all([
        serviceApi.getAll(), categoryApi.getAll()
      ]);
      setData(svcs); setCategories(cats);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!confirm('Delete this service?')) return;
    try { await serviceApi.delete(id); load(); }
    catch (err) { alert(err.message); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Services</h2>
          <p>Manage service listings</p>
        </div>
      </div>

      {error && <div className="alert alert-error">⚠ {error}</div>}

      <div className="card">
        <div className="card-header">
          <h3>All Services ({data.length})</h3>
        </div>
        {loading ? (
          <div className="loading"><div className="spinner" /><p>Loading…</p></div>
        ) : data.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🛠️</div><p>No services yet.</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Title</th><th>Category</th>
                <th>Provider</th><th>Amount</th><th>Unit</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(s => (
                <tr key={s.id}>
                  <td><span className="badge">#{s.id}</span></td>
                  <td>
                    <strong>{s.title}</strong>
                    {s.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 2 }}>
                      {s.description.length > 50 ? s.description.slice(0, 50) + '…' : s.description}
                    </p>}
                  </td>
                  <td><span className="badge">{s.category?.categoryName}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{s.user?.name}</td>
                  <td><span className="amount">₹{parseFloat(s.amount).toFixed(2)}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{s.unit || '—'}</td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => setModal(s)}>✏️ Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(s.id)}>🗑️ Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <ServiceModal
          initial={modal === 'create' ? null : modal}
          categories={categories}
          currentUser={currentUser}
          onSave={() => { setModal(null); load(); }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
