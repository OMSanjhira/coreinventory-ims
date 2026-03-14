import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ManagerLayout from '../../components/manager/ManagerLayout';
import { deliveryService } from '../../services/operationService';
import { productService } from '../../services/productService';
import { warehouseService } from '../../services/warehouseService';
import toast from 'react-hot-toast';
import { Plus, Trash2, ArrowLeft, Save, Send } from 'lucide-react';

const genRef = () => `DEL-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`;

const DeliveryCreate = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ reference: genRef(), customer: '', scheduled_date: '', warehouse_id: '', address: '', notes: '' });
  const [lines, setLines] = useState([{ product_id: '', requested_qty: 1, uom: 'Units' }]);

  useEffect(() => {
    const load = async () => {
      const [prods, whs] = await Promise.all([productService.list(), warehouseService.list()]);
      setProducts(Array.isArray(prods) ? prods : []);
      setWarehouses(Array.isArray(whs) ? whs : []);
    };
    load();
  }, []);

  const addLine = () => setLines([...lines, { product_id: '', requested_qty: 1, uom: 'Units' }]);
  const removeLine = (i: number) => setLines(lines.filter((_, idx) => idx !== i));
  const updateLine = (i: number, key: string, val: any) => {
    const updated = [...lines];
    if (key === 'product_id') {
      const p = products.find((x) => x.id === val);
      updated[i] = { ...updated[i], product_id: val, uom: p?.uom || 'Units' };
    } else { updated[i] = { ...updated[i], [key]: val }; }
    setLines(updated);
  };

  const submit = async (status: 'draft' | 'confirmed') => {
    if (!form.warehouse_id) { toast.error('Select a source warehouse'); return; }
    if (lines.some((l) => !l.product_id)) { toast.error('Select a product for each row'); return; }
    setLoading(true);
    try {
      await deliveryService.create({ ...form, status, items: lines });
      toast.success('Delivery order created!');
      navigate('/manager/deliveries');
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Failed to create delivery'); }
    finally { setLoading(false); }
  };

  return (
    <ManagerLayout title="New Delivery">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost p-2"><ArrowLeft size={20} /></button>
          <h2 className="page-title">Create Delivery Order</h2>
        </div>
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 mb-2">Delivery Header</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Reference Number</label>
              <input className="form-input" value={form.reference} onChange={(e) => setForm({...form,reference:e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Customer Name</label>
              <input className="form-input" placeholder="Customer name" value={form.customer} onChange={(e) => setForm({...form,customer:e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Source Warehouse *</label>
              <select className="form-input" value={form.warehouse_id} onChange={(e) => setForm({...form,warehouse_id:e.target.value})}>
                <option value="">Select warehouse</option>
                {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Scheduled Date</label>
              <input type="date" className="form-input" value={form.scheduled_date} onChange={(e) => setForm({...form,scheduled_date:e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-input h-20 resize-none" placeholder="Optional notes" value={form.notes} onChange={(e) => setForm({...form,notes:e.target.value})} />
          </div>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Products</h3>
          <div className="space-y-3">
            {lines.map((line, i) => {
              const prod = products.find((p) => p.id === line.product_id);
              return (
                <div key={i} className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-6">
                    <select className="form-input text-sm" value={line.product_id} onChange={(e) => updateLine(i,'product_id',e.target.value)}>
                      <option value="">Select product</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.sku}</option>)}
                    </select>
                    {prod && <p className="text-xs text-gray-400 mt-1">Available: {prod.total_stock ?? prod.stock ?? '?'} {prod.uom}</p>}
                  </div>
                  <div className="col-span-3">
                    <input type="number" min={1} className="form-input text-sm" placeholder="Qty" value={line.requested_qty}
                      onChange={(e) => updateLine(i,'requested_qty',Number(e.target.value))} />
                  </div>
                  <div className="col-span-2">
                    <input className="form-input text-sm bg-gray-50" readOnly value={line.uom} />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button onClick={() => removeLine(i)} className="text-danger-500 hover:text-danger-700 p-1"><Trash2 size={15} /></button>
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={addLine} className="btn-ghost text-sm gap-2 mt-4"><Plus size={15} /> Add Product</button>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button onClick={() => submit('draft')} disabled={loading} className="btn-secondary gap-2"><Save size={15} /> Save Draft</button>
          <button onClick={() => submit('confirmed')} disabled={loading} className="btn-primary gap-2"><Send size={15} /> Confirm Order</button>
        </div>
      </div>
    </ManagerLayout>
  );
};

export default DeliveryCreate;
