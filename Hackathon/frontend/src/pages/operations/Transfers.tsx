import Layout from '../../components/Layout';
import { ArrowLeftRight, Plus } from 'lucide-react';

const Transfers = () => {
    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                    <ArrowLeftRight className="text-emerald-400" size={32} />
                    Internal Transfers
                    </h1>
                    <p className="text-slate-400 mt-2 font-light">Move stock between warehouses or locations.</p>
                </div>
                <button className="btn-primary bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20 flex items-center gap-2">
                    <Plus size={20} />
                    New Transfer
                </button>
                </div>

                 <div className="glass p-10 text-center rounded-2xl border border-white/10 shadow-2xl">
                     <p className="text-slate-500 italic">Transfer history will be displayed here.</p>
                </div>
            </div>
        </Layout>
    );
};

export default Transfers;
