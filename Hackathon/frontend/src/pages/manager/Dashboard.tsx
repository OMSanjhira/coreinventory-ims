import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ManagerLayout from '../../components/manager/ManagerLayout';
import { dashboardService } from '../../services/dashboardService';
import api from '../../services/api';
import StatusBadge from '../../components/shared/StatusBadge';
import { CardSkeleton } from '../../components/shared/SkeletonLoader';
import {
  Package, AlertTriangle, XCircle, PackagePlus, Truck, ArrowLeftRight,
  ArrowUpRight, Plus, Eye, TrendingDown
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, RadialBarChart, RadialBar, Legend
} from 'recharts';

const GLOW_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];
const GLOW_COLORS_DARK = ['#4f46e5', '#7c3aed', '#0891b2', '#059669', '#d97706', '#e11d48'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15, 15, 30, 0.95)',
        border: '1px solid rgba(99,102,241,0.4)',
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: '0 0 20px rgba(99,102,241,0.3)',
        backdropFilter: 'blur(10px)',
      }}>
        <p style={{ color: '#a5b4fc', fontSize: '11px', marginBottom: '4px', fontWeight: 600 }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color || '#fff', fontSize: '14px', fontWeight: 700 }}>
            {p.value} <span style={{ color: '#6b7280', fontSize: '11px' }}>{p.name}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ManagerDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recentOps, setRecentOps] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [radialData, setRadialData] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, recentOpsData, productsData] = await Promise.all([
          dashboardService.getManagerStats(),
          dashboardService.getRecentActivity(10),
          api.get('/products').then(res => res.data.data).catch(() => []),
        ]);
        
        setStats(statsData);

        if (Array.isArray(recentOpsData)) {
           const ops = recentOpsData.map(op => ({
             ...op,
             op_type: op.operation_type === 'receipt' ? 'Receipt' : 
                      op.operation_type === 'delivery' ? 'Delivery' : 
                      op.operation_type.includes('transfer') ? 'Transfer' : 'Adjustment',
             reference: op.reference_id.substring(0, 8).toUpperCase(),
             status: 'done'
           }));
           setRecentOps(ops);
        }

        if (Array.isArray(productsData)) {
          const lowStock = productsData.filter((p: any) => p.total_quantity > 0 && p.total_quantity <= p.reorder_level);
          setLowStockItems(lowStock);
          
          const top = [...productsData].sort((a, b) => (b.total_quantity || 0) - (a.total_quantity || 0)).slice(0, 6);
          const chartItems = top.map((p, i) => ({ 
            name: p.name.length > 16 ? p.name.substring(0, 14) + '…' : p.name, 
            fullName: p.name,
            quantity: p.total_quantity || 0,
          }));
          setChartData(chartItems);
          
          const radial = top.slice(0, 4).map((p, i) => ({
            name: p.name.length > 12 ? p.name.substring(0, 10) + '…' : p.name,
            value: p.total_quantity || 0,
            fill: GLOW_COLORS[i],
          }));
          setRadialData(radial);
        }

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const kpiCards = [
    { label: 'Total Products', value: stats?.total_products ?? '-', icon: <Package size={20} />, color: 'bg-blue-50 text-blue-600', link: '/manager/products' },
    { label: 'Low Stock Items', value: stats?.low_stock_count ?? '-', icon: <AlertTriangle size={20} />, color: 'bg-warning-50 text-warning-600', link: '/manager/products' },
    { label: 'Out of Stock', value: stats?.out_of_stock_count ?? '-', icon: <XCircle size={20} />, color: 'bg-danger-50 text-danger-600', link: '/manager/products' },
    { label: 'Pending Receipts', value: stats?.pending_receipts ?? '-', icon: <PackagePlus size={20} />, color: 'bg-purple-50 text-purple-600', link: '/manager/receipts' },
    { label: 'Pending Deliveries', value: stats?.pending_deliveries ?? '-', icon: <Truck size={20} />, color: 'bg-orange-50 text-orange-600', link: '/manager/deliveries' },
    { label: 'Scheduled Transfers', value: stats?.scheduled_transfers ?? '-', icon: <ArrowLeftRight size={20} />, color: 'bg-teal-50 text-teal-600', link: '/manager/transfers' },
  ];

  const getOperationLink = (op: any) => {
    const type = op.op_type?.toLowerCase();
    if (type === 'receipt') return `/manager/receipts`;
    if (type === 'delivery') return `/manager/deliveries`;
    if (type === 'transfer') return `/manager/transfers`;
    return `/manager/adjustments`;
  };

  return (
    <ManagerLayout title="Dashboard">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
            : kpiCards.map((card) => (
                <Link key={card.label} to={card.link} className="card-hover p-5 flex flex-col gap-3 group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-0.5">{card.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                  <ArrowUpRight size={14} className="text-gray-300 group-hover:text-primary-500 transition-colors self-end" />
                </Link>
              ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recent Activity Table */}
          <div className="card xl:col-span-2">
            <div className="p-5 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Recent Operations</h3>
              <div className="flex gap-2">
                <Link to="/manager/receipts/create" className="btn-primary text-xs px-3 py-1.5 gap-1">
                  <Plus size={13} /> New
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Reference</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recentOps.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-10 text-gray-400">No recent operations</td></tr>
                  ) : recentOps.map((op) => (
                    <tr key={op.id}>
                      <td>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          op.op_type === 'Receipt' ? 'bg-purple-100 text-purple-700' :
                          op.op_type === 'Delivery' ? 'bg-orange-100 text-orange-700' :
                          'bg-teal-100 text-teal-700'
                        }`}>{op.op_type}</span>
                      </td>
                      <td className="font-mono text-xs font-medium">{op.reference}</td>
                      <td className="text-xs text-gray-500">{op.created_at ? new Date(op.created_at).toLocaleDateString() : '-'}</td>
                      <td><StatusBadge status={op.status} /></td>
                      <td>
                        <Link to={getOperationLink(op)} className="btn-ghost text-xs px-2 py-1 gap-1">
                          <Eye size={12} /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="card">
            <div className="p-5 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <TrendingDown size={16} className="text-warning-500" />
                Low Stock Alerts
              </h3>
              {lowStockItems.length > 0 && (
                <span className="badge bg-warning-100 text-warning-700">{lowStockItems.length}</span>
              )}
            </div>
            {lowStockItems.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                <Package size={32} className="mx-auto mb-2 opacity-30" />
                All stock levels healthy
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                {lowStockItems.map((item: any) => (
                  <div key={item.id} className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.sku}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-danger-600">{item.quantity ?? 0}</p>
                      <p className="text-xs text-gray-400">/{item.reorder_level}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ✨ Stunning Glowing Chart Section */}
        {chartData.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #0f0c29 100%)',
            borderRadius: '20px',
            padding: '28px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 0 60px rgba(99,102,241,0.25), 0 20px 60px rgba(0,0,0,0.5)',
            border: '1px solid rgba(99,102,241,0.2)',
          }}>
            {/* Background glow orbs */}
            <div style={{
              position: 'absolute', top: '-60px', left: '10%', width: '220px', height: '220px',
              background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)',
              borderRadius: '50%', filter: 'blur(25px)', pointerEvents: 'none'
            }} />
            <div style={{
              position: 'absolute', bottom: '-40px', right: '15%', width: '200px', height: '200px',
              background: 'radial-gradient(circle, rgba(139,92,246,0.28) 0%, transparent 70%)',
              borderRadius: '50%', filter: 'blur(20px)', pointerEvents: 'none'
            }} />
            <div style={{
              position: 'absolute', top: '35%', right: '3%', width: '130px', height: '130px',
              background: 'radial-gradient(circle, rgba(6,182,212,0.22) 0%, transparent 70%)',
              borderRadius: '50%', filter: 'blur(15px)', pointerEvents: 'none'
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Header */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{
                  fontSize: '18px', fontWeight: 700, marginBottom: '4px',
                  background: 'linear-gradient(90deg, #a5b4fc, #c4b5fd, #67e8f9)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  display: 'inline-block'
                }}>
                  ⚡ Stock Intelligence Overview
                </h3>
                <p style={{ color: 'rgba(165,180,252,0.6)', fontSize: '12px' }}>
                  Real-time inventory levels · Top products by quantity
                </p>
              </div>

              {/* Charts grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '32px', alignItems: 'center' }}>
                {/* Bar Chart */}
                <div>
                  <p style={{ color: 'rgba(165,180,252,0.7)', fontSize: '10px', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                    Stock Volume by Product
                  </p>
                  <ResponsiveContainer width="100%" height={230}>
                    <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 55 }}>
                      <defs>
                        {GLOW_COLORS.map((color, i) => (
                          <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={1} />
                            <stop offset="100%" stopColor={GLOW_COLORS_DARK[i]} stopOpacity={0.5} />
                          </linearGradient>
                        ))}
                        <filter id="barGlow">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      <CartesianGrid strokeDasharray="2 4" stroke="rgba(99,102,241,0.08)" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 9, fill: 'rgba(165,180,252,0.65)', fontWeight: 500 }} 
                        angle={-40} textAnchor="end" interval={0}
                        axisLine={{ stroke: 'rgba(99,102,241,0.15)' }}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 10, fill: 'rgba(165,180,252,0.55)' }}
                        axisLine={false} tickLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)', radius: 4 } as any} />
                      <Bar dataKey="quantity" name="units" radius={[7, 7, 0, 0]} maxBarSize={42} filter="url(#barGlow)">
                        {chartData.map((_entry, i) => (
                          <Cell key={i} fill={`url(#barGrad${i % GLOW_COLORS.length})`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Radial Bar Chart */}
                <div>
                  <p style={{ color: 'rgba(165,180,252,0.7)', fontSize: '10px', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                    Top 4 Distribution
                  </p>
                  <ResponsiveContainer width="100%" height={230}>
                    <RadialBarChart
                      cx="45%" cy="50%"
                      innerRadius="28%" outerRadius="88%"
                      data={radialData}
                      startAngle={90} endAngle={-270}
                    >
                      <defs>
                        <filter id="radialGlow">
                          <feGaussianBlur stdDeviation="4" result="glow" />
                          <feMerge>
                            <feMergeNode in="glow" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      <RadialBar
                        dataKey="value"
                        background={{ fill: 'rgba(255,255,255,0.03)' }}
                        cornerRadius={10}
                        filter="url(#radialGlow)"
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        iconSize={7}
                        iconType="circle"
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        formatter={(_value: any, entry: any) => (
                          <span style={{ color: 'rgba(165,180,252,0.75)', fontSize: '10px', fontWeight: 500 }}>
                            {entry.payload?.name}
                          </span>
                        )}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Glowing legend / stats bar */}
              <div style={{
                display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '20px',
                paddingTop: '18px', borderTop: '1px solid rgba(99,102,241,0.12)'
              }}>
                {chartData.map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${GLOW_COLORS[i % GLOW_COLORS.length]}30`,
                    borderRadius: '20px', padding: '4px 10px',
                  }}>
                    <div style={{
                      width: '7px', height: '7px', borderRadius: '50%',
                      background: GLOW_COLORS[i % GLOW_COLORS.length],
                      boxShadow: `0 0 8px ${GLOW_COLORS[i % GLOW_COLORS.length]}, 0 0 16px ${GLOW_COLORS[i % GLOW_COLORS.length]}60`,
                    }} />
                    <span style={{ color: 'rgba(165,180,252,0.7)', fontSize: '10px', fontWeight: 500 }}>
                      {item.fullName || item.name}
                    </span>
                    <span style={{
                      color: GLOW_COLORS[i % GLOW_COLORS.length], fontSize: '11px', fontWeight: 800,
                      textShadow: `0 0 8px ${GLOW_COLORS[i % GLOW_COLORS.length]}80`
                    }}>
                      {item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ManagerLayout>
  );
};

export default ManagerDashboard;
