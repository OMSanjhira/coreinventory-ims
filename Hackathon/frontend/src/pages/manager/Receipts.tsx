import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ManagerLayout from '../../components/manager/ManagerLayout';
import StatusBadge from '../../components/shared/StatusBadge';
import EmptyState from '../../components/shared/EmptyState';
import SkeletonLoader from '../../components/shared/SkeletonLoader';
import { receiptService } from '../../services/operationService';
import { Plus, PackagePlus, Eye } from 'lucide-react';

const Receipts = () => {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await receiptService.list({ status: statusFilter || undefined });
        setReceipts(Array.isArray(data) ? data : []);
      } catch { setReceipts([]); } finally { setLoading(false); }
    };
    load();
  }, [statusFilter]);

  return (
    <ManagerLayout title="Receipts">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="page-title">Receipts</h2>
            <p className="page-subtitle">Incoming goods from suppliers</p>
          </div>
          <Link to="/manager/receipts/create" className="btn-primary gap-2"><Plus size={16} /> New Receipt</Link>
        </div>
        <div className="card p-4 flex gap-3">
          <select className="form-input w-44 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {['draft','waiting','ready','done','canceled'].map((s) => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
        </div>
        <div className="card overflow-hidden">
          {loading ? <SkeletonLoader rows={6} cols={5} /> : receipts.length === 0
            ? <EmptyState icon={PackagePlus} title="No receipts yet" message="Create a receipt to log incoming stock"
                action={{ label: '+ New Receipt', onClick: () => navigate('/manager/receipts/create') }} />
            : (
              <table className="table">
                <thead><tr><th>Reference</th><th>Supplier</th><th>Date</th><th>Status</th><th>Created By</th><th></th></tr></thead>
                <tbody>
                  {receipts.map((r) => (
                    <tr key={r.id}>
                      <td className="font-mono text-xs font-medium text-gray-600">{r.reference}</td>
                      <td className="font-medium">{r.supplier || '-'}</td>
                      <td className="text-sm text-gray-500">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}</td>
                      <td><StatusBadge status={r.status} /></td>
                      <td className="text-sm text-gray-500">{r.creator?.name || '-'}</td>
                      <td>
                        <Link to={`/manager/receipts/${r.id}`} className="btn-ghost p-2"><Eye size={15} /></Link>
                      </td>
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

export default Receipts;
