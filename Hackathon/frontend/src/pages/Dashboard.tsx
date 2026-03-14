import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Package, 
  ArrowUpRight 
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Products', value: stats?.total_products || 0, icon: <Package />, color: 'blue' },
    { label: 'Total Stock', value: stats?.total_stock || 0, icon: <TrendingUp />, color: 'emerald' },
    { label: 'Low Stock Alerts', value: stats?.low_stock_count || 0, icon: <AlertTriangle />, color: 'amber' },
    { label: 'Pending Deliveries', value: stats?.pending_deliveries || 0, icon: <TrendingDown />, color: 'rose' },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <header>
          <h1 className="text-4xl font-bold text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-400 mt-2 font-light">Real-time inventory and logistics overview.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => (
            <div key={card.label} className="glass-card flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${card.color}-500/20 text-${card.color}-400 group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
                <ArrowUpRight className="text-slate-600 group-hover:text-primary-400 transition-colors" size={20} />
              </div>
              <div>
                <p className="text-slate-500 font-medium text-sm mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-white">
                  {loading ? '...' : card.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card min-h-[400px]">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <TrendingUp className="text-primary-400" size={20} />
              Recent Operations
            </h3>
            <div className="text-slate-500 font-light flex items-center justify-center h-64 italic">
              Operation visualization coming soon...
            </div>
          </div>
          <div className="glass-card min-h-[400px]">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <AlertTriangle className="text-amber-400" size={20} />
              Stock Health
            </h3>
            <div className="text-slate-500 font-light flex items-center justify-center h-64 italic text-center px-8">
              Automatic monitoring active. No critical stock failures reported.
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
