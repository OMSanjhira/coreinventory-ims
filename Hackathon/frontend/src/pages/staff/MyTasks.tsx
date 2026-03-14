import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StaffLayout from '../../components/staff/StaffLayout';
import StatusBadge from '../../components/shared/StatusBadge';
import SkeletonLoader from '../../components/shared/SkeletonLoader';
import EmptyState from '../../components/shared/EmptyState';
import { receiptService, deliveryService, transferService, adjustmentService } from '../../services/operationService';
import { ClipboardList, Eye } from 'lucide-react';

const MyTasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const [receipts, deliveries, transfers, adjustments] = await Promise.all([
          receiptService.list({ status: 'ready' }),
          deliveryService.list({ status: 'pick' }),
          transferService.list({ status: 'confirmed' }),
          adjustmentService.list({ status: 'draft' }),
        ]);
        const merged = [
          ...(Array.isArray(receipts) ? receipts : []).map((r: any) => ({ ...r, op_type: 'Receipt', href: `/staff/receipts/${r.id}` })),
          ...(Array.isArray(deliveries) ? deliveries : []).map((d: any) => ({ ...d, op_type: 'Delivery', href: `/staff/deliveries/${d.id}` })),
          ...(Array.isArray(transfers) ? transfers : []).map((t: any) => ({ ...t, op_type: 'Transfer', href: `/staff/transfers/${t.id}` })),
          ...(Array.isArray(adjustments) ? adjustments : []).map((a: any) => ({ ...a, op_type: 'Adjustment', href: `/staff/adjustments/${a.id}` })),
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setTasks(merged);
      } catch { setTasks([]); } finally { setLoading(false); }
    };
    load();
  }, []);

  const OP_COLORS: Record<string, string> = {
    Receipt: 'bg-purple-100 text-purple-700',
    Delivery: 'bg-orange-100 text-orange-700',
    Transfer: 'bg-teal-100 text-teal-700',
    Adjustment: 'bg-yellow-100 text-yellow-700',
  };

  const filtered = typeFilter === 'all' ? tasks : tasks.filter((t) => t.op_type === typeFilter);

  return (
    <StaffLayout title="My Tasks">
      <div className="space-y-5">
        <div>
          <h2 className="page-title">My Tasks</h2>
          <p className="page-subtitle">{filtered.length} item{filtered.length !== 1 ? 's' : ''} awaiting action</p>
        </div>

        <div className="card p-4 flex gap-2 flex-wrap">
          {['all', 'Receipt', 'Delivery', 'Transfer', 'Adjustment'].map((type) => (
            <button key={type} onClick={() => setTypeFilter(type)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${typeFilter === type ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {type === 'all' ? 'All Tasks' : `${type}s`}
            </button>
          ))}
        </div>

        <div className="card overflow-hidden">
          {loading ? <SkeletonLoader rows={6} cols={4} /> : filtered.length === 0
            ? <EmptyState icon={ClipboardList} title="No pending tasks" message="All operations are up to date — great work!" />
            : (
              <table className="table">
                <thead><tr><th>Type</th><th>Reference</th><th>Date</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {filtered.map((task) => (
                    <tr key={`${task.op_type}-${task.id}`}>
                      <td>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${OP_COLORS[task.op_type]}`}>{task.op_type}</span>
                      </td>
                      <td className="font-mono text-xs font-medium text-gray-600">{task.reference}</td>
                      <td className="text-sm text-gray-500">{task.created_at ? new Date(task.created_at).toLocaleDateString() : '-'}</td>
                      <td><StatusBadge status={task.status} /></td>
                      <td>
                        <Link to={task.href} className="btn-primary text-xs px-3 py-1.5 gap-1">
                          <Eye size={12} /> Process
                        </Link>
                      </td>
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

export default MyTasks;
