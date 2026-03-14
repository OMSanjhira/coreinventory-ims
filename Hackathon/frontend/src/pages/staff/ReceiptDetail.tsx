import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StaffLayout from '../../components/staff/StaffLayout';
import StatusBadge from '../../components/shared/StatusBadge';
import ConfirmModal from '../../components/shared/ConfirmModal';
import { receiptService } from '../../services/operationService';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const StaffReceiptDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<any>(null);
  const [receivedQtys, setReceivedQtys] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  const load = async () => {
    try {
      const data = await receiptService.get(id!);
      setReceipt(data);
      const qtys: Record<string, number> = {};
      (data.items || []).forEach((item: any) => { qtys[item.id] = item.received_qty ?? item.expected_qty; });
      setReceivedQtys(qtys);
    } catch { navigate('/staff/receipts'); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const handleValidate = async (confirmed = false) => {
    if (!confirmed) { setConfirmModal(true); return; }
    setTransitioning(true);
    try {
      await receiptService.transition(id!, 'validate');
      toast.success('Stock updated!');
      load();
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Failed'); }
    finally { setTransitioning(false); setConfirmModal(false); }
  };

  if (loading) return <StaffLayout title="Receipt"><div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div></StaffLayout>;
  if (!receipt) return null;

  return (
    <StaffLayout title={`Receipt — ${receipt.reference}`}>
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost p-2"><ArrowLeft size={20} /></button>
          <div className="flex-1 flex items-center gap-3">
            <h2 className="page-title">{receipt.reference}</h2>
            <StatusBadge status={receipt.status} />
          </div>
        </div>

        <div className="card p-5 grid grid-cols-2 gap-4">
          <div><p className="text-xs text-gray-400">Supplier</p><p className="font-medium">{receipt.supplier || '-'}</p></div>
          <div><p className="text-xs text-gray-400">Warehouse</p><p className="font-medium">{receipt.warehouse?.name || '-'}</p></div>
        </div>

        <div className="card overflow-hidden">
          <div className="p-5 border-b border-gray-50"><h3 className="font-semibold text-gray-900">Products to Receive</h3></div>
          <table className="table">
            <thead><tr><th>Product</th><th>Expected</th><th>Received</th><th>UOM</th></tr></thead>
            <tbody>
              {(receipt.items || []).map((item: any) => (
                <tr key={item.id}>
                  <td className="font-medium">{item.product?.name || '-'}</td>
                  <td>{item.expected_qty}</td>
                  <td>
                    {receipt.status === 'waiting' ? (
                      <input type="number" min={0} className="form-input w-24 text-sm py-1.5" value={receivedQtys[item.id] ?? item.expected_qty}
                        onChange={(e) => setReceivedQtys({ ...receivedQtys, [item.id]: Number(e.target.value) })} />
                    ) : <span>{item.received_qty ?? '-'}</span>}
                  </td>
                  <td className="text-gray-500 text-sm">{item.uom}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {receipt.status === 'waiting' && (
          <div className="flex justify-end">
            <button onClick={() => handleValidate()} disabled={transitioning} className="btn-primary gap-2">
              <CheckCircle size={15} /> Validate Receipt
            </button>
          </div>
        )}

        {receipt.status === 'done' && (
          <div className="flex items-center gap-2 text-success-700 bg-success-50 rounded-xl px-4 py-3">
            <CheckCircle size={18} /><span className="text-sm font-medium">Validated — stock updated</span>
          </div>
        )}
      </div>

      <ConfirmModal isOpen={confirmModal} title="Validate Receipt"
        message="Confirm that you have physically received these goods. Stock will be updated."
        confirmLabel="Confirm & Validate" onConfirm={() => handleValidate(true)}
        onCancel={() => setConfirmModal(false)} loading={transitioning} />
    </StaffLayout>
  );
};

export default StaffReceiptDetail;
