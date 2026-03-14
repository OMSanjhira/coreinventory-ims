import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StaffLayout from '../../components/staff/StaffLayout';
import StatusBadge from '../../components/shared/StatusBadge';
import ConfirmModal from '../../components/shared/ConfirmModal';
import { transferService } from '../../services/operationService';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const StaffTransferDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transfer, setTransfer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  const load = async () => {
    try { const data = await transferService.get(id!); setTransfer(data); }
    catch { navigate('/staff/transfers'); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const handleValidate = async (confirmed = false) => {
    if (!confirmed) { setConfirmModal(true); return; }
    setTransitioning(true);
    try {
      await transferService.transition(id!, 'validate');
      toast.success('Transfer completed!');
      load();
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Failed'); }
    finally { setTransitioning(false); setConfirmModal(false); }
  };

  if (loading) return <StaffLayout title="Transfer"><div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div></StaffLayout>;
  if (!transfer) return null;

  return (
    <StaffLayout title={`Transfer — ${transfer.reference}`}>
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost p-2"><ArrowLeft size={20} /></button>
          <div className="flex-1 flex items-center gap-3">
            <h2 className="page-title">{transfer.reference}</h2>
            <StatusBadge status={transfer.status} />
          </div>
        </div>
        <div className="card p-5 grid grid-cols-2 gap-4">
          <div><p className="text-xs text-gray-400">From</p><p className="font-medium">{transfer.from_warehouse?.name || '-'}</p></div>
          <div><p className="text-xs text-gray-400">To</p><p className="font-medium">{transfer.to_warehouse?.name || '-'}</p></div>
        </div>
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-gray-50"><h3 className="font-semibold text-gray-900">Products to Move</h3></div>
          <table className="table">
            <thead><tr><th>Product</th><th>Quantity</th><th>UOM</th></tr></thead>
            <tbody>
              {(transfer.items || []).map((item: any) => (
                <tr key={item.id}>
                  <td className="font-medium">{item.product?.name || '-'}</td>
                  <td className="font-semibold">{item.quantity}</td>
                  <td className="text-gray-500 text-sm">{item.product?.uom || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(transfer.status === 'waiting' || transfer.status === 'draft') && (
          <div className="flex justify-end">
            <button onClick={() => handleValidate()} disabled={transitioning} className="btn-primary gap-2">
              <CheckCircle size={15} /> Complete Transfer
            </button>
          </div>
        )}
        {transfer.status === 'done' && (
          <div className="flex items-center gap-2 text-success-700 bg-success-50 rounded-xl px-4 py-3">
            <CheckCircle size={18} /><span className="text-sm font-medium">Transfer complete — stock relocated</span>
          </div>
        )}
      </div>
      <ConfirmModal isOpen={confirmModal} title="Complete Transfer"
        message="Confirm that you have physically moved these items to the destination warehouse."
        confirmLabel="Confirm Transfer"
        onConfirm={() => handleValidate(true)} onCancel={() => setConfirmModal(false)} loading={transitioning} />
    </StaffLayout>
  );
};

export default StaffTransferDetail;
