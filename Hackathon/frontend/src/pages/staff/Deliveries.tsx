import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StaffLayout from '../../components/staff/StaffLayout';
import StatusBadge from '../../components/shared/StatusBadge';
import EmptyState from '../../components/shared/EmptyState';
import SkeletonLoader from '../../components/shared/SkeletonLoader';
import { deliveryService } from '../../services/operationService';
import { Truck, Eye } from 'lucide-react';

const StaffDeliveries = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pick');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try { const data = await deliveryService.list({ status: statusFilter || undefined }); setItems(Array.isArray(data) ? data : []); }
      catch { setItems([]); } finally { setLoading(false); }
    };
    load();
  }, [statusFilter]);

  return (
    <StaffLayout title="Deliveries">
      <div className="space-y-5">
        <div><h2 className="page-title">Deliveries</h2><p className="page-subtitle">Pick, pack, and ship orders</p></div>
        <div className="card p-4 flex gap-2">
          {['pick', 'pack', 'confirmed', 'done', ''].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="card overflow-hidden">
          {loading ? <SkeletonLoader rows={5} cols={4} /> : items.length === 0
            ? <EmptyState icon={Truck} title="No deliveries" message="Delivery orders will appear here when ready to pick" />
            : (
              <table className="table">
                <thead><tr><th>Reference</th><th>Customer</th><th>Date</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {items.map((r) => (
                    <tr key={r.id}>
                      <td className="font-mono text-xs font-medium text-gray-600">{r.reference}</td>
                      <td>{r.customer || '-'}</td>
                      <td className="text-sm text-gray-500">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}</td>
                      <td><StatusBadge status={r.status} /></td>
                      <td><Link to={`/staff/deliveries/${r.id}`} className="btn-ghost p-2"><Eye size={15} /></Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffDeliveries;
