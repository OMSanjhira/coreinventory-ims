import { useState } from 'react';
import Layout from '../../components/Layout';
import { PackageMinus, Plus, Search, Filter } from 'lucide-react';

const Deliveries = () => {
  const [deliveries] = useState<any[]>([]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
              <PackageMinus className="text-rose-400" size={32} />
              Delivery Orders
            </h1>
            <p className="text-slate-400 mt-2 font-light">Manage outgoing stock to customers.</p>
          </div>
          <button className="btn-primary bg-rose-600 hover:bg-rose-500 shadow-rose-500/20 flex items-center gap-2">
            <Plus size={20} />
            New Delivery
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Search delivery orders..." 
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-white placeholder-slate-500 transition-all font-light"
            />
          </div>
          <button className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white flex items-center gap-2 transition-all">
            <Filter size={20} />
            Filter
          </button>
        </div>

        <div className="glass overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="p-5 text-sm font-semibold text-slate-300 uppercase tracking-widest">Order ID</th>
                <th className="p-5 text-sm font-semibold text-slate-300 uppercase tracking-widest">Destination</th>
                <th className="p-5 text-sm font-semibold text-slate-300 uppercase tracking-widest text-center">Date</th>
                <th className="p-5 text-sm font-semibold text-slate-300 uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                {deliveries.length === 0 ? (
                <tr><td colSpan={4} className="p-10 text-center text-slate-500 italic">No delivery orders found.</td></tr>
               ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Deliveries;
