import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { 
  Plus, 
  Search, 
  QrCode, 
  Filter, 
  MoreVertical,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrModal, setQrModal] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getQrCode = async (productId: string) => {
    try {
      const res = await api.get(`/products/${productId}/qrcode`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      setQrModal(url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Product Catalog</h1>
            <p className="text-slate-400 mt-2 font-light">Manage and monitor master product data.</p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            New Product
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Search by SKU, name or category..." 
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-white placeholder-slate-500 transition-all font-light"
            />
          </div>
          <button className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white flex items-center gap-2 transition-all">
            <Filter size={20} />
            Filter
          </button>
        </div>

        {/* Table/List */}
        <div className="glass overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="p-5 text-sm font-semibold text-slate-300 uppercase tracking-widest">Product Info</th>
                <th className="p-5 text-sm font-semibold text-slate-300 uppercase tracking-widest">SKU</th>
                <th className="p-5 text-sm font-semibold text-slate-300 uppercase tracking-widest text-center">Reorder Level</th>
                <th className="p-5 text-sm font-semibold text-slate-300 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={4} className="p-10 text-center text-slate-500 animate-pulse">Loading data assets...</td></tr>
              ) : products.map((p) => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-5">
                    <div>
                      <p className="text-white font-medium mb-0.5">{p.name}</p>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Category: {p.category_id}</p>
                    </div>
                  </td>
                  <td className="p-5 text-slate-300 font-mono text-sm tracking-tight">{p.sku}</td>
                  <td className="p-5 text-center">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${p.reorder_level > 0 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-slate-500/10 text-slate-500'}`}>
                      {p.reorder_level} units
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => getQrCode(p.id)}
                        className="p-2 hover:bg-primary-500/20 text-slate-400 hover:text-primary-400 rounded-lg transition-all" 
                        title="Generate QR Code"
                       >
                        <QrCode size={18} />
                      </button>
                      <button className="p-2 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="p-5 bg-white/5 border-t border-white/10 flex items-center justify-between">
            <p className="text-sm text-slate-500">Showing <span className="text-white font-medium">{products.length}</span> results</p>
            <div className="flex gap-2">
              <button className="p-2 border border-white/10 rounded-lg text-slate-600 cursor-not-allowed"><ChevronLeft size={18} /></button>
              <button className="p-2 border border-white/10 rounded-lg text-slate-500 hover:bg-white/5 transition-all"><ChevronRight size={18} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {qrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setQrModal(null)}>
          <div className="glass-card max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-white mb-6">Product Identity QR</h3>
            <div className="bg-white p-4 rounded-3xl inline-block shadow-2xl shadow-primary-500/20">
              <img src={qrModal} alt="Product QR Code" className="w-48 h-48" />
            </div>
            <p className="mt-6 text-slate-400 text-sm font-light italic">Scan this code to verify product metadata instantly.</p>
            <button 
              onClick={() => setQrModal(null)}
              className="mt-8 btn-primary w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Products;
