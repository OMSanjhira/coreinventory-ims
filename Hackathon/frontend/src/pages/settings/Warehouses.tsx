import Layout from '../../components/Layout';
import { Warehouse, Plus } from 'lucide-react';

const Warehouses = () => {
    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                    <Warehouse className="text-primary-400" size={32} />
                    Warehouse Management
                    </h1>
                    <p className="text-slate-400 mt-2 font-light">Manage physical locations and storage racks.</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Plus size={20} />
                    New Warehouse
                </button>
                </div>
                
                 <div className="glass p-10 text-center rounded-2xl border border-white/10 shadow-2xl">
                     <p className="text-slate-500 italic">Warehouse configurations will load here.</p>
                </div>
            </div>
        </Layout>
    );
};

export default Warehouses;
