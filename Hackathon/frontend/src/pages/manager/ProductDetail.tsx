import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ManagerLayout from '../../components/manager/ManagerLayout';
import StatusBadge from '../../components/shared/StatusBadge';
import SkeletonLoader from '../../components/shared/SkeletonLoader';
import { productService } from '../../services/productService';
import { Edit2, Plus, ArrowLeft, Package2, TrendingUp } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [stockLevels, setStockLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, stock] = await Promise.all([
          productService.get(id!),
          productService.getStock(id!),
        ]);
        setProduct(p);
        setStockLevels(Array.isArray(stock) ? stock : []);
      } catch { navigate('/manager/products'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return <ManagerLayout title="Product Detail"><SkeletonLoader rows={6} cols={4} /></ManagerLayout>;
  if (!product) return null;

  const totalStock = stockLevels.reduce((sum, s) => sum + (s.quantity || 0), 0);
  const status = totalStock <= 0 ? 'out-of-stock' : totalStock <= (product.reorder_level || 0) ? 'low-stock' : 'in-stock';

  return (
    <ManagerLayout title={product.name}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost p-2"><ArrowLeft size={20} /></button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="page-title">{product.name}</h2>
              <StatusBadge status={status} />
            </div>
            <p className="page-subtitle font-mono">{product.sku}</p>
          </div>
          <div className="flex gap-2">
            <Link to={`/manager/products/create?edit=${id}`} className="btn-secondary gap-2">
              <Edit2 size={15} /> Edit
            </Link>
            <Link to={`/manager/receipts/create?product=${id}`} className="btn-primary gap-2">
              <Plus size={15} /> Create Receipt
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="card p-5 flex items-center gap-4 col-span-2">
            <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center">
              <Package2 size={24} className="text-primary-600" />
            </div>
            <div className="grid grid-cols-3 gap-6 flex-1">
              {[
                { label: 'Unit of Measure', value: product.uom },
                { label: 'Reorder Point', value: product.reorder_level || product.reorder_point || 0 },
                { label: 'Total Stock', value: <span className="text-xl font-bold">{totalStock}</span> },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <p className="text-xs text-gray-500 mb-1">Quick Actions</p>
            <div className="space-y-2 mt-2">
              <Link to={`/manager/adjustments/create?product=${id}`} className="btn-secondary w-full text-sm gap-2">
                <TrendingUp size={14} /> Create Adjustment
              </Link>
            </div>
          </div>
        </div>

        {/* Stock by Location */}
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-gray-50">
            <h3 className="font-semibold text-gray-900">Stock by Location</h3>
          </div>
          <table className="table">
            <thead>
              <tr><th>Warehouse</th><th>Location</th><th>Quantity</th></tr>
            </thead>
            <tbody>
              {stockLevels.length === 0
                ? <tr><td colSpan={3} className="text-center py-8 text-gray-400">No stock recorded</td></tr>
                : stockLevels.map((s, i) => (
                    <tr key={i}>
                      <td className="font-medium">{s.warehouse}</td>
                      <td className="text-gray-500">{s.location}</td>
                      <td><span className={`font-bold ${s.quantity <= 0 ? 'text-danger-600' : 'text-success-700'}`}>{s.quantity}</span></td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {product.description && (
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
          </div>
        )}
      </div>
    </ManagerLayout>
  );
};

export default ProductDetail;
