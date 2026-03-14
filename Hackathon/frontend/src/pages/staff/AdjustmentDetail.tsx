import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StaffLayout from '../../components/staff/StaffLayout';
import StatusBadge from '../../components/shared/StatusBadge';
import ConfirmModal from '../../components/shared/ConfirmModal';
import { adjustmentService } from '../../services/operationService';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const StaffAdjustmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [adjustment, setAdjustment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  const load = async () => {
    try { const data = await adjustmentService.get(id!); setAdjustment(data); }
    catch { navigate('/staff/adjustments'); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const handleApply = async (confirmed = false) => {
    if (!confirmed) { setConfirmModal(true); return; }
    setTransitioning(true);
    try {
      await adjustmentService.transition(id!, 'apply');
      toast.success('Adjustment applied!');
      load();
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Failed'); }
    finally { setTransitioning(false); setConfirmModal(false); }
  };

  if (loading) return <StaffLayout title="Adjustment"><div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div></StaffLayout>;
  if (!adjustment) return null;

  return (
    <StaffLayout title={`Adjustment — ${adjustment.reference}`}>
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost p-2"><ArrowLeft size={20} /></button>
          <div className="flex-1 flex items-center gap-3">
            <h2 className="page-title">{adjustment.reference}</h2>
            <StatusBadge status={adjustment.status} />
          </div>
        </div>
        <div className="card p-5 grid grid-cols-2 gap-4">
          <div><p className="text-xs text-gray-400">Type</p><p className="font-medium">{adjustment.adjustment_type}</p></div>
          <div><p className="text-xs text-gray-400">Warehouse</p><p className="font-medium">{adjustment.warehouse?.name || '-'}</p></div>
          <div className="col-span-2"><p className="text-xs text-gray-400">Notes</p><p className="font-medium">{adjustment.notes || '-'}</p></div>
        </div>
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-gray-50"><h3 className="font-semibold text-gray-900">Products</h3></div>
          <table className="table">
            <thead><tr><th>Product</th><th>System Qty</th><th>Actual Qty</th><th>Diff</th></tr></thead>
            <tbody>
              {(adjustment.items || []).map((item: any) => {
                const diff = (item.new_qty ?? 0) - (item.old_qty ?? 0);
                return (
                  <tr key={item.id}>
                    <td className="font-medium">{item.product?.name || '-'}</td>
                    <td>{item.old_qty}</td>
                    <td className="font-semibold">{item.new_qty}</td>
                    <td>
                      <span className={`font-bold text-sm ${diff > 0 ? 'text-success-600' : diff < 0 ? 'text-danger-600' : 'text-gray-400'}`}>
                        {diff > 0 ? `+${diff}` : diff === 0 ? '—' : diff}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {adjustment.status === 'draft' && (
          <div className="flex justify-end">
            <button onClick={() => handleApply()} disabled={transitioning} className="btn-primary gap-2">
              <CheckCircle size={15} /> Apply Adjustment
            </button>
          </div>
        )}
        {adjustment.status === 'done' && (
          <div className="flex items-center gap-2 text-success-700 bg-success-50 rounded-xl px-4 py-3">
            <CheckCircle size={18} /><span className="text-sm font-medium">Applied — stock updated</span>
          </div>
        )}
      </div>
      <ConfirmModal isOpen={confirmModal} title="Apply Stock Adjustment"
        message="This will update stock levels based on the actual count. Cannot be undone."
        confirmLabel="Apply Adjustment"
        onConfirm={() => handleApply(true)} onCancel={() => setConfirmModal(false)} loading={transitioning} />
    </StaffLayout>
  );
};

export default StaffAdjustmentDetail;
