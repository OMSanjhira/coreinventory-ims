import { useEffect, useState } from 'react';
import ManagerLayout from '../../components/manager/ManagerLayout';
import ConfirmModal from '../../components/shared/ConfirmModal';
import EmptyState from '../../components/shared/EmptyState';
import SkeletonLoader from '../../components/shared/SkeletonLoader';
import { warehouseService } from '../../services/warehouseService';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Warehouse, X, Check } from 'lucide-react';

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });
  const [form, setForm] = useState({ name: '', code: '', address: '', description: '' });

  const load = async () => {
    try { const data = await warehouseService.list(); setWarehouses(Array.isArray(data) ? data : []); }
    catch { toast.error('Failed to load'); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditItem(null); setForm({ name:'',code:'',address:'',description:'' }); setModalOpen(true); };
  const openEdit = (w: any) => { setEditItem(w); setForm({ name:w.name,code:w.code||'',address:w.address||'',description:w.description||'' }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name || !form.code) { toast.error('Name and code are required'); return; }
    setSaving(true);
    try {
      if (editItem) await warehouseService.update(editItem.id, form);
      else await warehouseService.create(form);
      toast.success('Warehouse saved!');
      setModalOpen(false);
      load();
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await warehouseService.delete(deleteModal.id);
      toast.success('Warehouse deleted');
      setDeleteModal({ open: false, id: '', name: '' });
      load();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <ManagerLayout title="Warehouses">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="page-title">Warehouses</h2>
            <p className="page-subtitle">{warehouses.length} warehouse{warehouses.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={openCreate} className="btn-primary gap-2"><Plus size={16} /> New Warehouse</button>
        </div>
        <div className="card overflow-hidden">
          {loading ? <SkeletonLoader rows={5} cols={4} /> : warehouses.length === 0
            ? <EmptyState icon={Warehouse} title="No warehouses" message="Add your first warehouse to start tracking stock"
                action={{ label: '+ New Warehouse', onClick: openCreate }} />
            : (
              <table className="table">
                <thead><tr><th>Name</th><th>Code</th><th>Address</th><th>Actions</th></tr></thead>
                <tbody>
                  {warehouses.map((w) => (
                    <tr key={w.id}>
                      <td className="font-medium">{w.name}</td>
                      <td><span style={{ fontFamily: 'monospace', fontSize: '12px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc', padding: '2px 8px', borderRadius: '6px', display: 'inline-block' }}>{w.code}</span></td>
                      <td style={{ fontSize: '13px', color: '#8892b0' }}>{w.address || '-'}</td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(w)} className="btn-ghost p-2 text-gray-500"><Edit2 size={15} /></button>
                          <button onClick={() => setDeleteModal({ open: true, id: w.id, name: w.name })}
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div style={{
            position: 'relative',
            background: 'rgba(13,17,23,0.95)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '20px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.1)',
            width: '100%', maxWidth: '420px', padding: '28px',
          }} className="animate-fade-in space-y-4">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '16px', color: '#f0f2ff' }}>{editItem ? 'Edit Warehouse' : 'New Warehouse'}</h3>
              <button onClick={() => setModalOpen(false)} style={{ color: '#4a5568', background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            {[
              { key: 'name', label: 'Warehouse Name *', placeholder: 'e.g. Main Warehouse' },
              { key: 'code', label: 'Short Code *', placeholder: 'e.g. WH-MAIN' },
              { key: 'address', label: 'Address', placeholder: 'Full address' },
              { key: 'description', label: 'Description', placeholder: 'Optional' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="form-group">
                <label className="form-label">{label}</label>
                <input className="form-input" placeholder={placeholder} value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 gap-2">
                {saving ? '...' : <><Check size={15} /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={deleteModal.open} title="Delete Warehouse" danger
        message={`Delete "${deleteModal.name}"? This will affect stock level records.`}
        onConfirm={handleDelete} onCancel={() => setDeleteModal({ open: false, id: '', name: '' })} />
    </ManagerLayout>
  );
};

export default Warehouses;
