import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ManagerLayout from '../../components/manager/ManagerLayout';
import { productService } from '../../services/productService';
import { warehouseService } from '../../services/warehouseService';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, RefreshCw, Plus } from 'lucide-react';

const UOM_OPTIONS = ['Units', 'Kg', 'Liters', 'Meters', 'Boxes', 'Cartons', 'Pieces', 'Bags', 'Rolls', 'Pallets'];

const generateSKU = () => `SKU-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const ProductCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [categories, setCategories] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [showNewCat, setShowNewCat] = useState(false);

  const [form, setForm] = useState({
    name: '', sku: generateSKU(), category_id: '', uom: 'Units',
    description: '', reorder_level: 0, initial_stock: 0, warehouse_id: '',
  });

  useEffect(() => {
    const load = async () => {
      const [cats, whs] = await Promise.all([productService.listCategories(), warehouseService.list()]);
      setCategories(Array.isArray(cats) ? cats : []);
      setWarehouses(Array.isArray(whs) ? whs : []);
      if (editId) {
        const p = await productService.get(editId);
        setForm((f) => ({ ...f, name: p.name, sku: p.sku, category_id: p.category_id || '', uom: p.uom, description: p.description || '', reorder_level: p.reorder_level || 0 }));
      }
    };
    load();
  }, [editId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const cat = await productService.createCategory(newCatName.trim());
      setCategories([...categories, cat]);
      setForm({ ...form, category_id: cat.id });
      setNewCatName('');
      setShowNewCat(false);
      toast.success('Category created!');
    } catch { toast.error('Failed to create category'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.sku || !form.category_id) { toast.error('Please fill all required fields'); return; }
    setLoading(true);
    try {
      const payload = {
        name: form.name, sku: form.sku, category_id: form.category_id,
        uom: form.uom, description: form.description, reorder_level: Number(form.reorder_level),
      };
      if (editId) { await productService.update(editId, payload); toast.success('Product updated!'); }
      else { await productService.create(payload); toast.success('Product created!'); }
      navigate('/manager/products');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to save product');
    } finally { setLoading(false); }
  };

  return (
    <ManagerLayout title={editId ? 'Edit Product' : 'New Product'}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="btn-ghost p-2"><ArrowLeft size={20} /></button>
          <h2 className="page-title">{editId ? 'Edit Product' : 'Add Product'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input name="name" required className="form-input" placeholder="e.g. Laptop Stand" value={form.name} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">SKU / Product Code *</label>
              <div className="relative">
                <input name="sku" required className="form-input pr-10" placeholder="e.g. SKU-001" value={form.sku} onChange={handleChange} />
                <button type="button" onClick={() => setForm({ ...form, sku: generateSKU() })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600" title="Auto-generate">
                  <RefreshCw size={15} />
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Unit of Measure</label>
              <select name="uom" className="form-input" value={form.uom} onChange={handleChange}>
                {UOM_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Category *</label>
            {showNewCat ? (
              <div className="flex gap-2">
                <input className="form-input flex-1" placeholder="New category name" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
                <button type="button" onClick={handleCreateCategory} className="btn-primary px-3 py-2 text-sm">Save</button>
                <button type="button" onClick={() => setShowNewCat(false)} className="btn-secondary px-3 py-2 text-sm">Cancel</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <select name="category_id" required className="form-input flex-1" value={form.category_id} onChange={handleChange}>
                  <option value="">Select a category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button type="button" onClick={() => setShowNewCat(true)} className="btn-secondary px-3 py-2 text-sm gap-1 whitespace-nowrap">
                  <Plus size={14} /> New
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" className="form-input h-24 resize-none" placeholder="Optional product description"
              value={form.description} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Reorder Point</label>
              <input name="reorder_level" type="number" min={0} className="form-input"
                value={form.reorder_level} onChange={handleChange} />
              <p className="text-xs text-gray-400 mt-1">Alert triggers when stock hits this</p>
            </div>
            {!editId && (
              <div className="form-group">
                <label className="form-label">Initial Stock (optional)</label>
                <input name="initial_stock" type="number" min={0} className="form-input"
                  value={form.initial_stock} onChange={handleChange} />
              </div>
            )}
          </div>

          {!editId && Number(form.initial_stock) > 0 && (
            <div className="form-group">
              <label className="form-label">Warehouse (for initial stock)</label>
              <select name="warehouse_id" className="form-input" value={form.warehouse_id} onChange={handleChange}>
                <option value="">Select warehouse</option>
                {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 gap-2">
              {loading ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Save size={16} />}
              {loading ? 'Saving...' : editId ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </ManagerLayout>
  );
};

export default ProductCreate;
