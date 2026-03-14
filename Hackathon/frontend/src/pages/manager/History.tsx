import { useEffect, useState } from 'react';
import ManagerLayout from '../../components/manager/ManagerLayout';
import SkeletonLoader from '../../components/shared/SkeletonLoader';
import EmptyState from '../../components/shared/EmptyState';
import { historyService } from '../../services/historyService';
import { productService } from '../../services/productService';
import { History as HistoryIcon, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const History = () => {
  const [moves, setMoves] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ move_type: '', product_id: '', start_date: '', end_date: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [data, prods] = await Promise.all([
        historyService.list({ ...filters }),
        productService.list(),
      ]);
      setMoves(Array.isArray(data) ? data : (data?.items || []));
      setProducts(Array.isArray(prods) ? prods : []);
    } catch { setMoves([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filters]);

  const handleExport = async () => {
    try {
      const blob = await historyService.exportCSV(filters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `stock-moves-${Date.now()}.csv`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Export failed'); }
  };

  const TYPE_LABELS: Record<string, string> = { in: 'Receipt', out: 'Delivery', transfer: 'Transfer', adjustment: 'Adjustment' };
  const TYPE_COLORS: Record<string, string> = { in: 'bg-purple-100 text-purple-700', out: 'bg-orange-100 text-orange-700', transfer: 'bg-teal-100 text-teal-700', adjustment: 'bg-yellow-100 text-yellow-700' };

  return (
    <ManagerLayout title="Move History">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="page-title">Stock Move History</h2>
            <p className="page-subtitle">Complete audit log of all stock movements</p>
          </div>
          <button onClick={handleExport} className="btn-secondary gap-2"><Download size={15} /> Export CSV</button>
        </div>

        <div className="card p-4 flex flex-wrap gap-3">
          <select className="form-input w-44 text-sm" value={filters.move_type} onChange={(e) => setFilters({...filters,move_type:e.target.value})}>
            <option value="">All Types</option>
            <option value="in">Receipt (In)</option>
            <option value="out">Delivery (Out)</option>
            <option value="transfer">Transfer</option>
            <option value="adjustment">Adjustment</option>
          </select>
          <select className="form-input w-48 text-sm" value={filters.product_id} onChange={(e) => setFilters({...filters,product_id:e.target.value})}>
            <option value="">All Products</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input type="date" className="form-input w-40 text-sm" value={filters.start_date} onChange={(e) => setFilters({...filters,start_date:e.target.value})} />
          <input type="date" className="form-input w-40 text-sm" value={filters.end_date} onChange={(e) => setFilters({...filters,end_date:e.target.value})} />
          <button onClick={() => setFilters({ move_type:'',product_id:'',start_date:'',end_date:'' })} className="btn-ghost text-sm">Clear</button>
        </div>

        <div className="card overflow-hidden">
          {loading ? <SkeletonLoader rows={8} cols={6} /> : moves.length === 0
            ? <EmptyState icon={HistoryIcon} title="No stock moves yet" message="Stock movements will appear here after operations are validated" />
            : (
              <table className="table">
                <thead><tr><th>Date & Time</th><th>Type</th><th>Product</th><th>SKU</th><th>Qty</th><th>From</th><th>To</th><th>Done By</th></tr></thead>
                <tbody>
                  {moves.map((m: any) => (
                    <tr key={m.id}>
                      <td className="text-xs text-gray-500 whitespace-nowrap">{m.created_at ? new Date(m.created_at).toLocaleString() : '-'}</td>
                      <td>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${TYPE_COLORS[m.move_type] || 'bg-gray-100 text-gray-600'}`}>
                          {TYPE_LABELS[m.move_type] || m.move_type}
                        </span>
                      </td>
                      <td className="font-medium">{m.product?.name || '-'}</td>
                      <td className="font-mono text-xs text-gray-500">{m.product?.sku || '-'}</td>
                      <td className={`font-bold ${m.move_type === 'out' ? 'text-danger-600' : 'text-success-600'}`}>
                        {m.move_type === 'out' ? `-${m.quantity}` : `+${m.quantity}`}
                      </td>
                      <td className="text-sm text-gray-500">{m.from_warehouse?.name || m.from_location?.name || '-'}</td>
                      <td className="text-sm text-gray-500">{m.to_warehouse?.name || m.to_location?.name || '-'}</td>
                      <td className="text-xs text-gray-500">{m.done_by?.name || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      </div>
    </ManagerLayout>
  );
};

export default History;
