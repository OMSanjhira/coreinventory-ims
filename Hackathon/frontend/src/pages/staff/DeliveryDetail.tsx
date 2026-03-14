import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StaffLayout from '../../components/staff/StaffLayout';
import StatusBadge from '../../components/shared/StatusBadge';
import ConfirmModal from '../../components/shared/ConfirmModal';
import { deliveryService } from '../../services/operationService';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const StaffDeliveryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState<any>(null);
  const [pickedQtys, setPickedQtys] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  const load = async () => {
    try {
      const data = await deliveryService.get(id!);
      setDelivery(data);
      const qtys: Record<string, number> = {};
      (data.items || []).forEach((item: any) => { qtys[item.id] = item.delivered_qty ?? item.requested_qty; });
      setPickedQtys(qtys);
    } catch { navigate('/staff/deliveries'); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const transition = async (action: string, confirmed = false) => {
    if (action === 'validate' && !confirmed) { setConfirmModal(true); return; }
    setTransitioning(true);
    try {
      await deliveryService.transition(id!, action);
      toast.success('Status updated!');
      load();
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Failed'); }
    finally { setTransitioning(false); setConfirmModal(false); }
  };

  if (loading) return <StaffLayout title="Delivery"><div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div></StaffLayout>;
  if (!delivery) return null;

  return (
    <StaffLayout title={`Delivery — ${delivery.reference}`}>
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost p-2"><ArrowLeft size={20} /></button>
          <div className="flex-1 flex items-center gap-3">
            <h2 className="page-title">{delivery.reference}</h2>
            <StatusBadge status={delivery.status} />
          </div>
        </div>

        <div className="card p-5 grid grid-cols-2 gap-4">
          <div><p className="text-xs text-gray-400">Customer</p><p className="font-medium">{delivery.customer || '-'}</p></div>
          <div><p className="text-xs text-gray-400">Warehouse</p><p className="font-medium">{delivery.warehouse?.name || '-'}</p></div>
        </div>

        <div className="card overflow-hidden">
          <div className="p-5 border-b border-gray-50"><h3 className="font-semibold text-gray-900">Products</h3></div>
          <table className="table">
            <thead><tr><th>Product</th><th>Demand Qty</th><th>Picked Qty</th><th>UOM</th></tr></thead>
            <tbody>
              {(delivery.items || []).map((item: any) => (
                <tr key={item.id}>
                  <td className="font-medium">{item.product?.name || '-'}</td>
                  <td>{item.requested_qty}</td>
                  <td>
                    {['pick', 'pack'].includes(delivery.status) ? (
                      <input type="number" min={0} className="form-input w-24 text-sm py-1.5" value={pickedQtys[item.id] ?? item.requested_qty}
                        onChange={(e) => setPickedQtys({ ...pickedQtys, [item.id]: Number(e.target.value) })} />
                    ) : <span>{item.delivered_qty ?? '-'}</span>}
                  </td>
                  <td className="text-gray-500 text-sm">{item.uom}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {delivery.status !== 'done' && delivery.status !== 'canceled' && (
          <div className="flex justify-end gap-3">
            {delivery.status === 'pick' && (
              <button onClick={() => transition('confirm_pick')} disabled={transitioning} className="btn-primary gap-2">
                <CheckCircle size={15} /> Confirm Picked
              </button>
            )}
            {delivery.status === 'pack' && (
              <button onClick={() => transition('validate')} disabled={transitioning} className="btn-primary gap-2">
                <CheckCircle size={15} /> Ship Out
              </button>
            )}
          </div>
        )}

        {delivery.status === 'done' && (
          <div className="flex items-center gap-2 text-success-700 bg-success-50 rounded-xl px-4 py-3">
            <CheckCircle size={18} /><span className="text-sm font-medium">Delivered — stock deducted</span>
          </div>
        )}
      </div>

      <ConfirmModal isOpen={confirmModal} title="Ship Delivery Order"
        message="Confirm all items are packed and ready for dispatch. Stock will be deducted from the warehouse."
        confirmLabel="Confirm Shipment" danger
        onConfirm={() => transition('validate', true)} onCancel={() => setConfirmModal(false)} loading={transitioning} />
    </StaffLayout>
  );
};

export default StaffDeliveryDetail;
