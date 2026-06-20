import { useState, useEffect } from 'react';
import { categoryApi } from '../api';

function CategoryModal({ initial, allCategories, onSave, onClose }) {
  const [form, setForm] = useState({
    categoryName:      initial?.categoryName      || '',
    parentCategoryId:  initial?.parentCategoryId  ?? '',
  });
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);

  // Exclude self from parent options to avoid self-reference
  const parentOptions = allCategories.filter(c => c.id !== initial?.id);

  const handle = async (e) => {
    e.preventDefault();
    if (!form.categoryName.trim()) { setError('Category name is required'); return; }
    const body = {
      categoryName:     form.categoryName,
      parentCategoryId: form.parentCategoryId === '' ? null : Number(form.parentCategoryId),
    };
    setSaving(true);
    try {
      await (initial ? categoryApi.update(initial.id, body) : categoryApi.create(body));
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
              onChange={e => setForm(f => ({ ...f, categoryName: e.target.value }))}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Parent Category <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
            <select
              value={form.parentCategoryId}
              onChange={e => setForm(f => ({ ...f, parentCategoryId: e.target.value }))}
            >
              <option value="">— None (top-level category) —</option>
              {parentOptions.map(c => (
                <option key={c.id} value={c.id}>
                  {c.parentCategoryId ? `    ↳ ${c.categoryName}` : c.categoryName}
                </option>
              ))}
            </select>
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

// Build a tree: top-level categories with their children
function buildTree(categories) {
  const topLevel = categories.filter(c => !c.parentCategoryId);
  return topLevel.map(parent => ({
    parent,
    children: categories.filter(c => c.parentCategoryId === parent.id),
  }));
}

function Row({ c, isChild, onEdit, onDelete }) {
  return (
    <tr>
      <td><span className="badge">#{c.id}</span></td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: isChild ? 24 : 0 }}>
          {isChild && <span style={{ color: 'var(--text-muted)' }}>↳</span>}
          <span style={{ fontWeight: isChild ? 400 : 500 }}>{c.categoryName}</span>
          {!isChild && (
            <span style={{
              fontSize: '0.7rem', padding: '2px 8px', borderRadius: 99,
              background: 'rgba(108,99,255,0.12)', color: 'var(--accent2)',
              border: '1px solid rgba(108,99,255,0.2)', fontWeight: 600,
            }}>Parent</span>
          )}
        </div>
      </td>
      <td>
        {isChild
          ? <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Sub-category of #{c.parentCategoryId}</span>
          : <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Top-level</span>
        }
      </td>
      <td>
        <div className="actions">
          <button className="btn btn-ghost btn-sm" onClick={() => onEdit(c)}>✏️ Edit</button>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(c.id)}>🗑️ Delete</button>
        </div>
      </td>
    </tr>
  );
}

export default function Categories() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [modal, setModal]     = useState(null);

  const load = async () => {
    setLoading(true);
    try { setData(await categoryApi.getAll()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!confirm('Delete this category? Sub-categories will lose their parent.')) return;
    try { await categoryApi.delete(id); load(); }
    catch (err) { alert(err.message); }
  };

  const tree    = buildTree(data);
  const orphans = data.filter(c =>
    c.parentCategoryId && !data.find(p => p.id === c.parentCategoryId)
  );
  const subCount = data.length - tree.length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Categories</h2>
          <p>Manage service categories &amp; sub-categories</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('create')}>+ New Category</button>
      </div>

      {error && <div className="alert alert-error">⚠ {error}</div>}

      <div className="card">
        <div className="card-header">
          <h3>All Categories ({data.length})</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {tree.length} parent · {subCount} sub-categor{subCount === 1 ? 'y' : 'ies'}
          </span>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /><p>Loading…</p></div>
        ) : data.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🗂️</div>
            <p>No categories yet. Create one!</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr><th>ID</th><th>Category Name</th><th>Type</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {tree.map(({ parent, children }) => (
                <>
                  <Row key={parent.id} c={parent} isChild={false}
                    onEdit={setModal} onDelete={del} />
                  {children.map(child => (
                    <Row key={child.id} c={child} isChild={true}
                      onEdit={setModal} onDelete={del} />
                  ))}
                </>
              ))}
              {orphans.map(c => (
                <Row key={c.id} c={c} isChild={true} onEdit={setModal} onDelete={del} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <CategoryModal
          initial={modal === 'create' ? null : modal}
          allCategories={data}
          onSave={() => { setModal(null); load(); }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
