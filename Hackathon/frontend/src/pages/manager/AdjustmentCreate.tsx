import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ManagerLayout from '../../components/manager/ManagerLayout';
import { adjustmentService } from '../../services/operationService';
import { productService } from '../../services/productService';
import { warehouseService } from '../../services/warehouseService';
import toast from 'react-hot-toast';
import { Plus, Trash2, ArrowLeft, Send } from 'lucide-react';

const ADJUSTMENT_TYPES = ['Manual Count', 'Damaged Goods', 'Expired Goods', 'Theft/Loss', 'Correction'];
const genRef = () => `ADJ-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`;

const AdjustmentCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ reference: genRef(), adjustment_type: 'Manual Count', warehouse_id: '', date: '', notes: '' });
  const [lines, setLines] = useState([{ product_id: '', current_stock: 0, actual_qty: 0, uom: 'Units' }]);

  useEffect(() => {
    const load = async () => {
      const [prods, whs] = await Promise.all([productService.list(), warehouseService.list()]);
      setProducts(Array.isArray(prods) ? prods : []);
      setWarehouses(Array.isArray(whs) ? whs : []);
      const pid = searchParams.get('product');
      if (pid) {
        const p = (prods as any[]).find((x: any) => x.id === pid);
        if (p) setLines([{ product_id: p.id, current_stock: p.total_stock ?? 0, actual_qty: p.total_stock ?? 0, uom: p.uom || 'Units' }]);
      }
    };
    load();
  }, []);

  const updateLine = (i: number, key: string, val: any) => {
    const updated = [...lines];
    if (key === 'product_id') {
      const p = products.find((x) => x.id === val);
      updated[i] = { ...updated[i], product_id: val, current_stock: p?.total_stock ?? 0, actual_qty: p?.total_stock ?? 0, uom: p?.uom || 'Units' };
    } else { updated[i] = { ...updated[i], [key]: val }; }
    setLines(updated);
  };

  const submit = async () => {
    if (!form.warehouse_id) { toast.error('Select a warehouse'); return; }
    if (lines.some((l) => !l.product_id)) { toast.error('Select a product for each row'); return; }
    setLoading(true);
    try {
      await adjustmentService.create({ ...form, items: lines.map((l) => ({ product_id: l.product_id, old_qty: l.current_stock, new_qty: Number(l.actual_qty), uom: l.uom })) });
      toast.success('Adjustment created!');
      navigate('/manager/adjustments');
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <ManagerLayout title="New Adjustment">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost p-2"><ArrowLeft size={20} /></button>
          <h2 className="page-title">Create Stock Adjustment</h2>
        </div>
        <div className="card p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Reference</label>
              <input className="form-input" value={form.reference} onChange={(e) => setForm({...form,reference:e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Adjustment Type</label>
              <select className="form-input" value={form.adjustment_type} onChange={(e) => setForm({...form,adjustment_type:e.target.value})}>
                {ADJUSTMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Warehouse *</label>
              <select className="form-input" value={form.warehouse_id} onChange={(e) => setForm({...form,warehouse_id:e.target.value})}>
                <option value="">Select warehouse</option>
                {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="form-input" value={form.date} onChange={(e) => setForm({...form,date:e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes / Reason *</label>
            <textarea className="form-input h-20 resize-none" placeholder="Required for audit trail" value={form.notes} onChange={(e) => setForm({...form,notes:e.target.value})} />
          </div>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-1">Products</h3>
          <p className="text-xs text-gray-400 mb-4">Enter the actual counted quantity. The system will compute the difference.</p>
          <div className="space-y-3">
            {lines.map((line, i) => {
              const diff = Number(line.actual_qty) - Number(line.current_stock);
              return (
                <div key={i} className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-5">
                    <select className="form-input text-sm" value={line.product_id} onChange={(e) => updateLine(i,'product_id',e.target.value)}>
                      <option value="">Select product</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.sku}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input className="form-input text-sm bg-gray-50" readOnly value={line.current_stock} title="System stock" />
                    <p className="text-xs text-gray-400 mt-0.5 text-center">Current</p>
                  </div>
                  <div className="col-span-2">
                    <input type="number" min={0} className="form-input text-sm" value={line.actual_qty}
                      onChange={(e) => updateLine(i,'actual_qty',e.target.value)} />
                    <p className="text-xs text-gray-400 mt-0.5 text-center">Actual</p>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`font-bold text-sm ${diff > 0 ? 'text-success-600' : diff < 0 ? 'text-danger-600' : 'text-gray-400'}`}>
                      {diff > 0 ? `+${diff}` : diff === 0 ? '—' : diff}
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">Diff</p>
                  </div>
                  <div className="col-span-1">
                    <button onClick={() => setLines(lines.filter((_, idx) => idx !== i))} className="text-danger-500 hover:text-danger-700 p-1"><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={() => setLines([...lines, { product_id: '', current_stock: 0, actual_qty: 0, uom: 'Units' }])} className="btn-ghost text-sm gap-2 mt-4">
            <Plus size={15} /> Add Product
          </button>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button onClick={submit} disabled={loading} className="btn-primary gap-2"><Send size={15} /> Create Adjustment</button>
        </div>
      </div>
    </ManagerLayout>
  );
};

export default AdjustmentCreate;
