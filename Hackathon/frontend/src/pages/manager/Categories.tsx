import React, { useEffect, useState } from 'react';
import ManagerLayout from '../../components/manager/ManagerLayout';
import ConfirmModal from '../../components/shared/ConfirmModal';
import EmptyState from '../../components/shared/EmptyState';
import { productService } from '../../services/productService';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Tag, X, Check } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });

  const fetch = async () => {
    try { const cats = await productService.listCategories(); setCategories(Array.isArray(cats) ? cats : []); }
    catch { toast.error('Failed to load'); } finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditItem(null); setName(''); setModalOpen(true); };
  const openEdit = (cat: any) => { setEditItem(cat); setName(cat.name); setModalOpen(true); };

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      await productService.createCategory(name.trim());
      toast.success('Category saved!');
      setModalOpen(false);
      fetch();
    } catch { toast.error('Failed to save'); } finally { setSaving(false); }
  };

  return (
    <ManagerLayout title="Categories">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="page-title">Categories</h2>
            <p className="page-subtitle">{categories.length} categories</p>
          </div>
          <button onClick={openCreate} className="btn-primary gap-2"><Plus size={16} /> New Category</button>
        </div>

        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : categories.length === 0 ? (
            <EmptyState icon={Tag} title="No categories" message="Create a category to organize your products"
              action={{ label: '+ New Category', onClick: openCreate }} />
          ) : (
            <table className="table">
              <thead><tr><th>Category Name</th><th>Actions</th></tr></thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="font-medium">{cat.name}</td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(cat)} className="btn-ghost p-2 text-gray-500"><Edit2 size={15} /></button>
                        <button onClick={() => setDeleteModal({ open: true, id: cat.id, name: cat.name })}
                          className="btn-ghost p-2 text-danger-500 hover:bg-danger-50"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{editItem ? 'Edit Category' : 'New Category'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="form-group mb-4">
              <label className="form-label">Category Name</label>
              <input className="form-input" placeholder="e.g. Electronics" value={name}
                onChange={(e) => setName(e.target.value)} autoFocus />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 gap-2">
                {saving ? '...' : <><Check size={15} /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={deleteModal.open} title="Delete Category" danger
        message={`Delete "${deleteModal.name}"? Products in this category will be unassigned.`}
        onConfirm={async () => { setDeleteModal({ open: false, id: '', name: '' }); fetch(); }}
        onCancel={() => setDeleteModal({ open: false, id: '', name: '' })} />
    </ManagerLayout>
  );
};

export default Categories;
