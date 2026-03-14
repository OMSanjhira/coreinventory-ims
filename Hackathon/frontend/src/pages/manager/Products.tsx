import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ManagerLayout from '../../components/manager/ManagerLayout';
import StatusBadge from '../../components/shared/StatusBadge';
import ConfirmModal from '../../components/shared/ConfirmModal';
import EmptyState from '../../components/shared/EmptyState';
import SkeletonLoader from '../../components/shared/SkeletonLoader';
import { productService } from '../../services/productService';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, History, ChevronLeft, ChevronRight, Package } from 'lucide-react';

const ITEMS_PER_PAGE = 20;

const ManagerProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        productService.list({ search: search || undefined, category_id: categoryFilter || undefined }),
        productService.listCategories(),
      ]);
      setProducts(Array.isArray(prods) ? prods : []);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [search, categoryFilter]);

  const getStockStatus = (qty: number, reorder: number) => {
    if (qty <= 0) return 'out-of-stock';
    if (qty <= reorder) return 'low-stock';
    return 'in-stock';
  };

  const filtered = products.filter((p) => {
    if (!statusFilter) return true;
    const status = getStockStatus(p.total_quantity ?? p.total_stock ?? p.stock ?? 0, p.reorder_level ?? p.reorder_point ?? 0);
    return status === statusFilter;
  });

  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await productService.delete(deleteModal.id);
      toast.success('Product deactivated');
      setDeleteModal({ open: false, id: '', name: '' });
      fetchProducts();
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(false); }
  };

  return (
    <ManagerLayout title="Products">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="page-title">Products</h2>
            <p className="page-subtitle">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/manager/products/create" className="btn-primary gap-2">
            <Plus size={16} /> New Product
          </Link>
        </div>

        {/* Filters */}
        <div className="card p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="form-input pl-9 text-sm" placeholder="Search name or SKU..."
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="form-input w-44 text-sm" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="form-input w-44 text-sm" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Stock Status</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? <SkeletonLoader rows={8} cols={6} /> : paginated.length === 0
            ? <EmptyState icon={Package} title="No products found" message="Add your first product to get started"
                action={{ label: '+ New Product', onClick: () => navigate('/manager/products/create') }} />
            : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>UOM</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((p) => {
                      const qty = p.total_quantity ?? p.total_stock ?? p.stock ?? 0;
                      const reorder = p.reorder_level ?? p.reorder_point ?? 0;
                      const status = getStockStatus(qty, reorder);
                      const cat = categories.find((c) => c.id === p.category_id);
                      return (
                        <tr key={p.id}>
                          <td className="font-mono text-xs font-medium text-gray-500">{p.sku}</td>
                          <td>
                            <Link to={`/manager/products/${p.id}`} className="font-medium text-primary-600 hover:text-primary-700 hover:underline">
                              {p.name}
                            </Link>
                          </td>
                          <td className="text-sm text-gray-500">{cat?.name || '-'}</td>
                          <td className="text-sm text-gray-500">{p.uom}</td>
                          <td className="font-semibold">{qty}</td>
                          <td><StatusBadge status={status} /></td>
                          <td>
                            <div className="flex items-center gap-1">
                              <Link to={`/manager/products/${p.id}`} className="btn-ghost p-2 text-gray-500" title="View Ledger">
                                <History size={15} />
                              </Link>
                              <Link to={`/manager/products/create?edit=${p.id}`} className="btn-ghost p-2 text-gray-500" title="Edit">
                                <Edit2 size={15} />
                              </Link>
                              <button onClick={() => setDeleteModal({ open: true, id: p.id, name: p.name })}
                                className="btn-ghost p-2 text-danger-500 hover:bg-danger-50" title="Delete">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-50 flex items-center justify-between text-sm">
              <p className="text-gray-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn-secondary py-1.5 px-3">
                  <ChevronLeft size={14} />
                </button>
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="btn-secondary py-1.5 px-3">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        <ConfirmModal
          isOpen={deleteModal.open}
          title="Delete Product"
          message={`Are you sure you want to deactivate "${deleteModal.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          danger
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteModal({ open: false, id: '', name: '' })}
        />
      </div>
    </ManagerLayout>
  );
};

export default ManagerProducts;
