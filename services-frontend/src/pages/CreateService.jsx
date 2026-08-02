import { useState, useEffect } from 'react';
import { serviceApi, categoryApi } from '../api';

export default function CreateService({ currentUser, onCreated }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    amount: '',
    unit: '',
    mainCategoryId: '',
    categoryId: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const cats = await categoryApi.getAll();
        setCategories(cats);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handle = async (e) => {
    e.preventDefault();
    const finalCategoryId = form.categoryId || form.mainCategoryId;
    if (!form.title || !form.amount || !finalCategoryId) {
      setError('Title, amount, and category are required'); return;
    }
    const body = {
      title: form.title,
      description: form.description,
      amount: parseFloat(form.amount),
      unit: form.unit,
      category: { id: parseInt(finalCategoryId) },
      user: { id: currentUser.id },
    };
    setSaving(true);
    try {
      await serviceApi.create(body);
      if (onCreated) onCreated();
      // Reset form
      setForm({ title: '', description: '', amount: '', unit: '', mainCategoryId: '', categoryId: '' });
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Create New Service</h2>
          <p>Add a new service listing to the platform</p>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /><p>Loading dependencies…</p></div>
      ) : (
        <div className="card" style={{ maxWidth: 600, margin: '0 auto', padding: '24px' }}>
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
            
            <div style={{ marginTop: '24px' }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
                {saving ? 'Creating…' : 'Create Service'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
