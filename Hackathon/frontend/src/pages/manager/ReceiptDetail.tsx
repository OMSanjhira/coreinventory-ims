import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ManagerLayout from '../../components/manager/ManagerLayout';
import StatusBadge from '../../components/shared/StatusBadge';
import ConfirmModal from '../../components/shared/ConfirmModal';
import { receiptService } from '../../services/operationService';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle, X, AlertTriangle } from 'lucide-react';

const ReceiptDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<any>(null);
  const [receivedQtys, setReceivedQtys] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [validateModal, setValidateModal] = useState(false);

  const load = async () => {
    try {
      const data = await receiptService.get(id!);
      setReceipt(data);
      const qtys: Record<string, number> = {};
      (data.items || []).forEach((item: any) => { qtys[item.id] = item.received_qty ?? item.expected_qty; });
      setReceivedQtys(qtys);
    } catch { navigate('/manager/receipts'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const transition = async (action: string, confirm = false) => {
    if (action === 'validate' && !confirm) { setValidateModal(true); return; }
    setTransitioning(true);
    try {
      const payload = action === 'validate' ? { received_qtys: receivedQtys } : undefined;
      await receiptService.transition(id!, action);
      toast.success('Status updated!');
      load();
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Action failed'); }
    finally { setTransitioning(false); setValidateModal(false); }
  };

  if (loading) return <ManagerLayout title="Receipt"><div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div></ManagerLayout>;
  if (!receipt) return null;

  const isEditable = receipt.status === 'ready';

  return (
    <ManagerLayout title={`Receipt — ${receipt.reference}`}>
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost p-2"><ArrowLeft size={20} /></button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="page-title">{receipt.reference}</h2>
              <StatusBadge status={receipt.status} />
            </div>
          </div>
        </div>

        {/* Meta info */}
        <div className="card p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Supplier', value: receipt.supplier || '-' },
            { label: 'Warehouse', value: receipt.warehouse?.name || '-' },
            { label: 'Scheduled', value: receipt.scheduled_date ? new Date(receipt.scheduled_date).toLocaleDateString() : '-' },
            { label: 'Created By', value: receipt.creator?.name || '-' },
          ].map((m) => (
            <div key={m.label}>
              <p className="text-xs text-gray-400">{m.label}</p>
              <p className="font-medium text-gray-900 mt-0.5">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Items */}
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-gray-50">
            <h3 className="font-semibold text-gray-900">Products</h3>
          </div>
          <table className="table">
            <thead><tr><th>Product</th><th>SKU</th><th>Expected Qty</th><th>Received Qty</th><th>UOM</th><th>Diff</th></tr></thead>
            <tbody>
              {(receipt.items || []).map((item: any) => {
                const received = receivedQtys[item.id] ?? item.expected_qty;
                const diff = received - item.expected_qty;
                return (
                  <tr key={item.id}>
                    <td className="font-medium">{item.product?.name || '-'}</td>
                    <td className="font-mono text-xs text-gray-500">{item.product?.sku}</td>
                    <td>{item.expected_qty}</td>
                    <td>
                      {isEditable ? (
                        <input type="number" min={0} className="form-input w-24 text-sm py-1.5" value={received}
                          onChange={(e) => setReceivedQtys({ ...receivedQtys, [item.id]: Number(e.target.value) })} />
                      ) : (
                        <span className="font-medium">{item.received_qty ?? '-'}</span>
                      )}
                    </td>
                    <td className="text-gray-500 text-sm">{item.uom}</td>
                    <td>
                      {receipt.status === 'done' && (
                        <span className={`text-sm font-medium ${diff === 0 ? 'text-gray-500' : diff > 0 ? 'text-success-600' : 'text-warning-600'}`}>
                          {diff > 0 ? `+${diff}` : diff === 0 ? '—' : diff}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Notes */}
        {receipt.note && (
          <div className="card p-5">
            <p className="text-xs text-gray-400 mb-1">Notes</p>
            <p className="text-gray-700 text-sm">{receipt.note}</p>
          </div>
        )}

        {/* Actions */}
        {receipt.status !== 'done' && receipt.status !== 'canceled' && (
          <div className="flex justify-end gap-3">
            <button onClick={() => transition('cancel')} disabled={transitioning} className="btn-secondary text-danger-600 gap-2">
              <X size={15} /> Cancel
            </button>
            {receipt.status === 'draft' && (
              <button onClick={() => transition('confirm')} disabled={transitioning} className="btn-primary gap-2">
                <CheckCircle size={15} /> Confirm Receipt
              </button>
            )}
            {receipt.status === 'waiting' && (
              <button onClick={() => transition('mark_ready')} disabled={transitioning} className="btn-primary gap-2">
                <CheckCircle size={15} /> Mark as Ready
              </button>
            )}
            {receipt.status === 'ready' && (
              <button onClick={() => transition('validate')} disabled={transitioning} className="btn-primary gap-2">
                <CheckCircle size={15} /> Validate & Update Stock
              </button>
            )}
          </div>
        )}

        {receipt.status === 'done' && (
          <div className="flex items-center gap-2 text-success-700 bg-success-50 rounded-xl px-4 py-3">
            <CheckCircle size={18} />
            <span className="text-sm font-medium">Validated — stock has been updated</span>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={validateModal}
        title="Validate Receipt"
        message="This will update stock levels in the warehouse. This action cannot be undone."
        confirmLabel="Validate"
        onConfirm={() => transition('validate', true)}
        onCancel={() => setValidateModal(false)}
        loading={transitioning}
      />
    </ManagerLayout>
  );
};

export default ReceiptDetail;
