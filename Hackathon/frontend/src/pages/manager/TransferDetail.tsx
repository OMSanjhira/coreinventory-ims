import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ManagerLayout from '../../components/manager/ManagerLayout';
import StatusBadge from '../../components/shared/StatusBadge';
import ConfirmModal from '../../components/shared/ConfirmModal';
import { transferService } from '../../services/operationService';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle, X } from 'lucide-react';

const TransferDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transfer, setTransfer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  const load = async () => {
    try { const data = await transferService.get(id!); setTransfer(data); }
    catch { navigate('/manager/transfers'); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const transition = async (action: string, confirmed = false) => {
    if (action === 'validate' && !confirmed) { setConfirmModal(true); return; }
    setTransitioning(true);
    try {
      await transferService.transition(id!, action);
      toast.success('Status updated!');
      load();
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Action failed'); }
    finally { setTransitioning(false); setConfirmModal(false); }
  };

  if (loading) return <ManagerLayout title="Transfer"><div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div></ManagerLayout>;
  if (!transfer) return null;

  return (
    <ManagerLayout title={`Transfer — ${transfer.reference}`}>
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost p-2"><ArrowLeft size={20} /></button>
          <div className="flex-1 flex items-center gap-3">
            <h2 className="page-title">{transfer.reference}</h2>
            <StatusBadge status={transfer.status} />
          </div>
        </div>

        <div className="card p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { 
              label: 'From', 
              value: transfer.from_location?.warehouse?.name 
                ? `${transfer.from_location.warehouse.name} (${transfer.from_location.name})` 
                : transfer.from_location?.name || '-' 
            },
            { 
              label: 'To', 
              value: transfer.to_location?.warehouse?.name 
                ? `${transfer.to_location.warehouse.name} (${transfer.to_location.name})` 
                : transfer.to_location?.name || '-' 
            },
            { label: 'Created', value: transfer.created_at ? new Date(transfer.created_at).toLocaleDateString() : '-' },
            { label: 'Created By', value: transfer.creator?.name || '-' },
          ].map((m) => (
            <div key={m.label}>
              <p className="text-xs text-gray-400">{m.label}</p>
              <p className="font-medium text-gray-900 mt-0.5">{m.value}</p>
            </div>
          ))}
        </div>

        <div className="card overflow-hidden">
          <div className="p-5 border-b border-gray-50"><h3 className="font-semibold text-gray-900">Products</h3></div>
          <table className="table">
            <thead><tr><th>Product</th><th>Quantity</th><th>UOM</th></tr></thead>
            <tbody>
              {(transfer.items || []).map((item: any) => (
                <tr key={item.id}>
                  <td className="font-medium">{item.product?.name || '-'}</td>
                  <td className="font-semibold">{item.quantity}</td>
                  <td className="text-gray-500">{item.product?.uom || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {transfer.status !== 'done' && transfer.status !== 'canceled' && (
          <div className="flex justify-end gap-3">
            <button onClick={() => transition('cancel')} disabled={transitioning} className="btn-secondary text-danger-600 gap-2">
              <X size={15} /> Cancel
            </button>
            {(transfer.status === 'confirmed' || transfer.status === 'draft' || transfer.status === 'ready') && (
              <button onClick={() => transition('validate')} disabled={transitioning} className="btn-primary gap-2">
                <CheckCircle size={15} /> Validate Transfer
              </button>
            )}
          </div>
        )}
        {transfer.status === 'done' && (
          <div className="flex items-center gap-2 text-success-700 bg-success-50 rounded-xl px-4 py-3">
            <CheckCircle size={18} />
            <span className="text-sm font-medium">Transfer complete — stock relocated</span>
          </div>
        )}
      </div>
      <ConfirmModal isOpen={confirmModal} title="Validate Transfer"
        message="This will move stock from source to destination warehouse. Cannot be undone."
        confirmLabel="Confirm Transfer" onConfirm={() => transition('validate', true)}
        onCancel={() => setConfirmModal(false)} loading={transitioning} />
    </ManagerLayout>
  );
};

export default TransferDetail;
