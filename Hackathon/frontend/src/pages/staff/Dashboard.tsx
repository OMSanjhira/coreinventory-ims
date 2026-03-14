import { useEffect, useState } from 'react';
import StaffLayout from '../../components/staff/StaffLayout';
import { dashboardService } from '../../services/dashboardService';
import StatusBadge from '../../components/shared/StatusBadge';
import { CardSkeleton } from '../../components/shared/SkeletonLoader';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { ClipboardList, PackagePlus, Truck, ArrowLeftRight, CheckCircle, Clock, Eye } from 'lucide-react';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [myTasksPreview, setMyTasksPreview] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, recentOpsData] = await Promise.all([
          dashboardService.getStaffStats(),
          dashboardService.getRecentActivity(5),
        ]);
        setStats(statsData);
        
        if (Array.isArray(recentOpsData)) {
           const ops = recentOpsData.map(op => ({
             ...op,
             op_type: op.operation_type === 'receipt' ? 'Receipt' : 
                      op.operation_type === 'delivery' ? 'Delivery' : 
                      op.operation_type.includes('transfer') ? 'Transfer' : 'Adjustment',
             reference: op.reference_id.substring(0, 8).toUpperCase(),
             status: 'done', // Ledger entries are inherently done
             href: op.operation_type === 'receipt' ? `/staff/receipts` :
                   op.operation_type === 'delivery' ? `/staff/deliveries` :
                   op.operation_type.includes('transfer') ? `/staff/transfers` : `/staff/adjustments`
           }));
           setMyTasksPreview(ops);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const kpis = [
    { label: 'Tasks to Process', value: stats?.pending_tasks ?? '-', icon: <ClipboardList size={20} />, color: 'bg-primary-50 text-primary-600', link: '/staff/my-tasks' },
    { label: 'Receipts Ready', value: stats?.receipts_ready ?? '-', icon: <PackagePlus size={20} />, color: 'bg-purple-50 text-purple-600', link: '/staff/receipts' },
    { label: 'Deliveries to Pick', value: stats?.deliveries_to_pick ?? '-', icon: <Truck size={20} />, color: 'bg-orange-50 text-orange-600', link: '/staff/deliveries' },
    { label: 'Transfers Pending', value: stats?.transfers_pending ?? '-', icon: <ArrowLeftRight size={20} />, color: 'bg-teal-50 text-teal-600', link: '/staff/transfers' },
  ];

  return (
    <StaffLayout title="My Dashboard">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="page-title">Good day, {user?.name?.split(' ')[0]}!</h2>
            <p className="page-subtitle">Here's your work summary</p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
            : kpis.map((k) => (
                <Link key={k.label} to={k.link} className="card-hover p-5 flex flex-col gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${k.color}`}>{k.icon}</div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">{k.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{k.value}</p>
                  </div>
                </Link>
              ))}
        </div>

        {/* Assigned Work */}
        <div className="card">
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock size={16} className="text-primary-500" />
              Pending Actions
            </h3>
            <Link to="/staff/my-tasks" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          {myTasksPreview.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle size={32} className="mx-auto mb-2 text-success-400" />
              <p className="text-gray-500 text-sm">All caught up — no pending tasks!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {myTasksPreview.map((task) => (
                <div key={task.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        task.op_type === 'Receipt' ? 'bg-purple-100 text-purple-700' :
                        task.op_type === 'Delivery' ? 'bg-orange-100 text-orange-700' :
                        'bg-teal-100 text-teal-700'
                      }`}>{task.op_type}</span>
                      <span className="font-mono text-xs text-gray-500">{task.reference}</span>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                  <Link to={task.href} className="btn-primary text-xs px-3 py-1.5 gap-1">
                    <Eye size={12} /> Process
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffDashboard;
