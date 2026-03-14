import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StaffLayout from '../../components/staff/StaffLayout';
import StatusBadge from '../../components/shared/StatusBadge';
import EmptyState from '../../components/shared/EmptyState';
import SkeletonLoader from '../../components/shared/SkeletonLoader';
import { adjustmentService } from '../../services/operationService';
import { Settings2, Eye } from 'lucide-react';

const StaffAdjustments = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try { const data = await adjustmentService.list(); setItems(Array.isArray(data) ? data : []); }
      catch { setItems([]); } finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <StaffLayout title="Adjustments">
      <div className="space-y-5">
        <div><h2 className="page-title">Stock Adjustments</h2><p className="page-subtitle">Submit physical count results</p></div>
        <div className="card overflow-hidden">
          {loading ? <SkeletonLoader rows={5} cols={4} /> : items.length === 0
            ? <EmptyState icon={Settings2} title="No adjustments assigned" message="Adjustment orders will appear here when ready" />
            : (
              <table className="table">
                <thead><tr><th>Reference</th><th>Type</th><th>Date</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {items.map((r) => (
                    <tr key={r.id}>
                      <td className="font-mono text-xs font-medium text-gray-600">{r.reference}</td>
                      <td className="text-sm text-gray-500">{r.adjustment_type || '-'}</td>
                      <td className="text-sm text-gray-500">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}</td>
                      <td><StatusBadge status={r.status} /></td>
                      <td><Link to={`/staff/adjustments/${r.id}`} className="btn-ghost p-2"><Eye size={15} /></Link></td>
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

export default StaffAdjustments;
