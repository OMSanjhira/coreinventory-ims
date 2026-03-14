import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ManagerLayout from '../../components/manager/ManagerLayout';
import StatusBadge from '../../components/shared/StatusBadge';
import EmptyState from '../../components/shared/EmptyState';
import SkeletonLoader from '../../components/shared/SkeletonLoader';
import { transferService } from '../../services/operationService';
import { Plus, ArrowLeftRight, Eye } from 'lucide-react';

const Transfers = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await transferService.list({ status: statusFilter || undefined });
        setItems(Array.isArray(data) ? data : []);
      } catch { setItems([]); } finally { setLoading(false); }
    };
    load();
  }, [statusFilter]);

  return (
    <ManagerLayout title="Internal Transfers">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="page-title">Internal Transfers</h2>
            <p className="page-subtitle">Move stock between warehouses</p>
          </div>
          <Link to="/manager/transfers/create" className="btn-primary gap-2"><Plus size={16} /> New Transfer</Link>
        </div>
        <div className="card p-4">
          <select className="form-input w-44 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {['draft','waiting','done','canceled'].map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
        </div>
        <div className="card overflow-hidden">
          {loading ? <SkeletonLoader rows={6} cols={5} /> : items.length === 0
            ? <EmptyState icon={ArrowLeftRight} title="No transfers" message="Move stock between your warehouses"
                action={{ label: '+ New Transfer', onClick: () => navigate('/manager/transfers/create') }} />
            : (
              <table className="table">
                <thead><tr><th>Reference</th><th>From</th><th>To</th><th>Date</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {items.map((r) => (
                    <tr key={r.id}>
                      <td className="font-mono text-xs font-medium text-gray-600">{r.reference}</td>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{r.from_location?.warehouse?.name || '-'}</span>
                          <span className="text-[10px] text-gray-400 uppercase tracking-tighter">{r.from_location?.name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{r.to_location?.warehouse?.name || '-'}</span>
                          <span className="text-[10px] text-gray-400 uppercase tracking-tighter">{r.to_location?.name}</span>
                        </div>
                      </td>
                      <td className="text-sm text-gray-500">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}</td>
                      <td><StatusBadge status={r.status} /></td>
                      <td><Link to={`/manager/transfers/${r.id}`} className="btn-ghost p-2"><Eye size={15} /></Link></td>
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

export default Transfers;
