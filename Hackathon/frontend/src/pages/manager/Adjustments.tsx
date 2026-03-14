import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ManagerLayout from '../../components/manager/ManagerLayout';
import StatusBadge from '../../components/shared/StatusBadge';
import EmptyState from '../../components/shared/EmptyState';
import SkeletonLoader from '../../components/shared/SkeletonLoader';
import { adjustmentService } from '../../services/operationService';
import { Plus, Settings2, Eye } from 'lucide-react';

const Adjustments = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try { const data = await adjustmentService.list(); setItems(Array.isArray(data) ? data : []); }
      catch { setItems([]); } finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <ManagerLayout title="Stock Adjustments">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="page-title">Adjustments</h2>
            <p className="page-subtitle">Reconcile physical counts and fix discrepancies</p>
          </div>
          <Link to="/manager/adjustments/create" className="btn-primary gap-2"><Plus size={16} /> New Adjustment</Link>
        </div>
        <div className="card overflow-hidden">
          {loading ? <SkeletonLoader rows={6} cols={5} /> : items.length === 0
            ? <EmptyState icon={Settings2} title="No adjustments" message="Create an adjustment to fix stock discrepancies"
                action={{ label: '+ New Adjustment', onClick: () => navigate('/manager/adjustments/create') }} />
            : (
              <table className="table">
                <thead><tr><th>Reference</th><th>Product</th><th>Reason</th><th>Date</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {items.map((r) => (
                    <tr key={r.id}>
                      <td className="font-mono text-xs font-medium text-gray-600">{r.reference}</td>
                      <td className="font-medium">{r.product?.name || '-'}</td>
                      <td className="text-sm text-gray-500 max-w-xs truncate">{r.reason || '-'}</td>
                      <td className="text-sm text-gray-500">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}</td>
                      <td><StatusBadge status={r.status} /></td>
                      <td><Link to={`/manager/adjustments/${r.id}`} className="btn-ghost p-2"><Eye size={15} /></Link></td>
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

export default Adjustments;
