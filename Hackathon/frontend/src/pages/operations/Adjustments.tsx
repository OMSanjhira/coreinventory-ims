import Layout from '../../components/Layout';
import { Settings2, Plus } from 'lucide-react';

const Adjustments = () => {
    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                    <Settings2 className="text-amber-400" size={32} />
                    Stock Adjustments
                    </h1>
                    <p className="text-slate-400 mt-2 font-light">Fix mismatches between recorded stock and physical counts.</p>
                </div>
                <button className="btn-primary bg-amber-600 hover:bg-amber-500 shadow-amber-500/20 flex items-center gap-2">
                    <Plus size={20} />
                    New Adjustment
                </button>
                </div>
                
                <div className="glass p-10 text-center rounded-2xl border border-white/10 shadow-2xl">
                     <p className="text-slate-500 italic">Adjustment ledger will be active here.</p>
                </div>
            </div>
        </Layout>
    );
};

export default Adjustments;
