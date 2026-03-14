import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ManagerLayout from '../../components/manager/ManagerLayout';
import { transferService } from '../../services/operationService';
import { productService } from '../../services/productService';
import { warehouseService } from '../../services/warehouseService';
import toast from 'react-hot-toast';
import { Plus, Trash2, ArrowLeft, Send } from 'lucide-react';

const TransferCreate = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [fromLocations, setFromLocations] = useState<any[]>([]);
  const [toLocations, setToLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    from_warehouse_id: '', 
    to_warehouse_id: '', 
    from_location_id: '', 
    to_location_id: '', 
    notes: '' 
  });
  const [lines, setLines] = useState([{ product_id: '', quantity: 1, uom: 'Units' }]);

  useEffect(() => {
    const load = async () => {
      try {
        const [prods, whs] = await Promise.all([productService.list(), warehouseService.list()]);
        setProducts(Array.isArray(prods) ? prods : []);
        setWarehouses(Array.isArray(whs) ? whs : []);
      } catch (err) {
        toast.error('Failed to load initial data');
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (form.from_warehouse_id) {
      warehouseService.getLocations(form.from_warehouse_id).then(locs => {
        setFromLocations(locs);
        if (locs.length > 0) setForm(f => ({ ...f, from_location_id: locs[0].id }));
      });
    } else {
      setFromLocations([]);
    }
  }, [form.from_warehouse_id]);

  useEffect(() => {
    if (form.to_warehouse_id) {
      warehouseService.getLocations(form.to_warehouse_id).then(locs => {
        setToLocations(locs);
        if (locs.length > 0) setForm(f => ({ ...f, to_location_id: locs[0].id }));
      });
    } else {
      setToLocations([]);
    }
  }, [form.to_warehouse_id]);

  const addLine = () => setLines([...lines, { product_id: '', quantity: 1, uom: 'Units' }]);
  const removeLine = (i: number) => setLines(lines.filter((_, idx) => idx !== i));
  const updateLine = (i: number, key: string, val: any) => {
    const updated = [...lines];
    if (key === 'product_id') { 
      const p = products.find((x) => x.id === val); 
      updated[i] = { ...updated[i], product_id: val, uom: p?.uom || 'Units' }; 
    } else { 
      updated[i] = { ...updated[i], [key]: val }; 
    }
    setLines(updated);
  };

  const submit = async () => {
    if (!form.from_location_id || !form.to_location_id) { 
      toast.error('Select specific locations for both warehouses'); 
      return; 
    }
    if (form.from_location_id === form.to_location_id) { 
      toast.error('Source and destination cannot be the same'); 
      return; 
    }
    if (lines.some((l) => !l.product_id)) { 
      toast.error('Select a product for each row'); 
      return; 
    }
    setLoading(true);
    try {
      const payload = {
        from_location_id: form.from_location_id,
        to_location_id: form.to_location_id,
        note: form.notes,
        items: lines.map(l => ({
          product_id: l.product_id,
          quantity: l.quantity
        }))
      };
      await transferService.create(payload);
      toast.success('Transfer created successfully!');
      navigate('/manager/transfers');
    } catch (err: any) { 
      toast.error(err.response?.data?.detail || 'Failed to create transfer'); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <ManagerLayout title="New Transfer">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost p-2"><ArrowLeft size={20} /></button>
          <h2 className="page-title">Create Internal Transfer</h2>
        </div>
        
        <div className="card p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label text-sm font-semibold text-gray-700">From Warehouse</label>
                <select className="form-input" value={form.from_warehouse_id} onChange={(e) => setForm({...form, from_warehouse_id: e.target.value})}>
                  <option value="">Select source warehouse</option>
                  {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              {fromLocations.length > 0 && (
                <div className="form-group">
                  <label className="form-label text-xs font-medium text-gray-500 uppercase tracking-wider">Source Location</label>
                  <select className="form-input bg-gray-50" value={form.from_location_id} onChange={(e) => setForm({...form, from_location_id: e.target.value})}>
                    {fromLocations.map((l) => <option key={l.id} value={l.id}>{l.name} ({l.short_code})</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label text-sm font-semibold text-gray-700">To Warehouse</label>
                <select className="form-input" value={form.to_warehouse_id} onChange={(e) => setForm({...form, to_warehouse_id: e.target.value})}>
                  <option value="">Select destination warehouse</option>
                  {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              {toLocations.length > 0 && (
                <div className="form-group">
                  <label className="form-label text-xs font-medium text-gray-500 uppercase tracking-wider">Destination Location</label>
                  <select className="form-input bg-gray-50" value={form.to_location_id} onChange={(e) => setForm({...form, to_location_id: e.target.value})}>
                    {toLocations.map((l) => <option key={l.id} value={l.id}>{l.name} ({l.short_code})</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="form-group border-t pt-4">
            <label className="form-label text-sm font-semibold text-gray-700">Notes</label>
            <textarea className="form-input h-20 resize-none" placeholder="Reason for transfer, special instructions..." value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} />
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            Items to Relocate
            <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{lines.length} items</span>
          </h3>
          <div className="space-y-3">
            {lines.map((line, i) => (
              <div key={i} className="grid grid-cols-12 gap-3 items-center bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                <div className="col-span-7">
                  <select className="form-input text-sm bg-white" value={line.product_id} onChange={(e) => updateLine(i, 'product_id', e.target.value)}>
                    <option value="">Choose product...</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                  </select>
                </div>
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <input type="number" min={1} className="form-input text-sm bg-white w-full" placeholder="Qty" value={line.quantity}
                      onChange={(e) => updateLine(i, 'quantity', Number(e.target.value))} />
                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{line.uom}</span>
                  </div>
                </div>
                <div className="col-span-2 flex justify-end">
                  {lines.length > 1 && (
                    <button onClick={() => removeLine(i)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button onClick={addLine} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-all flex items-center justify-center gap-2 mt-4">
            <Plus size={16} /> Add Another Product
          </button>
        </div>

        <div className="flex gap-4 justify-end pt-2">
          <button onClick={() => navigate(-1)} className="btn-secondary px-6">Cancel</button>
          <button onClick={submit} disabled={loading} className="btn-primary px-8 gap-2 shadow-lg shadow-primary-200">
            <Send size={16} /> {loading ? 'Creating...' : 'Finalize & Create Transfer'}
          </button>
        </div>
      </div>
    </ManagerLayout>
  );
};

export default TransferCreate;
