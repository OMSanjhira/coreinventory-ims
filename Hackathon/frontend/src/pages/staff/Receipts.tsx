import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StaffLayout from '../../components/staff/StaffLayout';
import StatusBadge from '../../components/shared/StatusBadge';
import EmptyState from '../../components/shared/EmptyState';
import SkeletonLoader from '../../components/shared/SkeletonLoader';
import { receiptService } from '../../services/operationService';
import { PackagePlus, Eye } from 'lucide-react';

const StaffReceipts = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('waiting');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try { const data = await receiptService.list({ status: statusFilter || undefined }); setItems(Array.isArray(data) ? data : []); }
      catch { setItems([]); } finally { setLoading(false); }
    };
    load();
  }, [statusFilter]);

  return (
    <StaffLayout title="Receipts">
      <div className="space-y-5">
        <div>
          <h2 className="page-title">Receipts</h2>
          <p className="page-subtitle">Validate incoming goods</p>
        </div>
        <div className="card p-4 flex gap-2">
          {['waiting', 'done', ''].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="card overflow-hidden">
          {loading ? <SkeletonLoader rows={5} cols={4} /> : items.length === 0
            ? <EmptyState icon={PackagePlus} title="No receipts" message="Receipts will appear here when ready to process" />
            : (
              <table className="table">
                <thead><tr><th>Reference</th><th>Supplier</th><th>Date</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {items.map((r) => (
                    <tr key={r.id}>
                      <td className="font-mono text-xs font-medium text-gray-600">{r.reference}</td>
                      <td>{r.supplier || '-'}</td>
                      <td className="text-sm text-gray-500">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}</td>
                      <td><StatusBadge status={r.status} /></td>
                      <td><Link to={`/staff/receipts/${r.id}`} className="btn-ghost p-2"><Eye size={15} /></Link></td>
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

export default StaffReceipts;
