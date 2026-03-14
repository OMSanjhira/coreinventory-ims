import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  ArrowRight,
  BarChart3,
  Truck,
  ArrowLeftRight,
  ClipboardList,
  Bell,
  CheckCircle,
  Boxes,
  Users,
  ShieldCheck,
  Zap,
  TrendingUp,
  Globe,
  ChevronRight,
} from 'lucide-react';

const AnimatedCounter = ({ target, suffix = '' }: { target: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let start = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { start = target; clearInterval(timer); }
      if (ref.current) ref.current.textContent = Math.floor(start).toLocaleString() + suffix;
    }, 20);
    return () => clearInterval(timer);
  }, [target, suffix]);
  return <span ref={ref}>0{suffix}</span>;
};

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'staff' ? '/staff/dashboard' : '/manager/dashboard');
    }
  }, [user, navigate]);

  const features = [
    { icon: <Package size={24} />, title: 'Product Management', desc: 'Track SKUs, categories, and units of measure across all your products.' },
    { icon: <ClipboardList size={24} />, title: 'Receipts & Incoming', desc: 'Log supplier receipts, validate goods, and auto-update stock levels.' },
    { icon: <Truck size={24} />, title: 'Delivery Orders', desc: 'Pick, pack, and ship to customers with real-time stock deduction.' },
    { icon: <ArrowLeftRight size={24} />, title: 'Internal Transfers', desc: 'Move stock between warehouses or zones with full traceability.' },
    { icon: <BarChart3 size={24} />, title: 'Stock Adjustments', desc: 'Reconcile physical counts, handle damage, expiry, and loss.' },
    { icon: <Bell size={24} />, title: 'Alerts & Reorder', desc: 'Get notified when products hit their reorder point automatically.' },
  ];

  const steps = [
    { num: '01', title: 'Receive Goods', desc: 'Log incoming shipments from vendors → stock increases instantly', color: 'bg-blue-500' },
    { num: '02', title: 'Move Internally', desc: 'Transfer items between warehouses → location records update', color: 'bg-indigo-500' },
    { num: '03', title: 'Ship to Customer', desc: 'Process delivery orders → stock decreases automatically', color: 'bg-violet-500' },
    { num: '04', title: 'Reconcile & Adjust', desc: 'Fix discrepancies from physical counts → ledger stays accurate', color: 'bg-purple-500' },
  ];

  const stats = [
    { value: 1000, suffix: '+', label: 'Products Tracked' },
    { value: 99, suffix: '.9%', label: 'Uptime Reliability' },
    { value: 5, suffix: '+', label: 'Warehouses Supported' },
    { value: 0, suffix: '%', label: 'Manual Entry Errors' },
  ];

  return (
    <div className="bg-white text-gray-900 overflow-x-hidden">
      {/* ─── Navbar ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Boxes size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Stock<span className="text-primary-600">Flow</span> IMS
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-primary-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary-600 transition-colors">How It Works</a>
            <a href="#roles" className="hover:text-primary-600 transition-colors">Roles</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-outline text-sm px-4 py-2">Log In</Link>
            <Link to="/signup" className="btn-primary text-sm px-4 py-2">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-gray-50 via-white to-primary-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 rounded-full px-4 py-2 text-sm font-medium">
              <Zap size={14} />
              Real-Time Inventory Intelligence
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
              Manage Your<br />
              <span className="text-primary-600">Inventory</span>
              <br />In Real Time.
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed max-w-lg">
              StockFlow IMS replaces manual registers and spreadsheets with a centralized, role-based platform for managers and warehouse staff.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/signup" className="btn-primary px-6 py-3 text-base gap-2">
                Get Started Free <ArrowRight size={18} />
              </Link>
              <a href="#how-it-works" className="btn-secondary px-6 py-3 text-base">
                See How It Works
              </a>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              {['No credit card required', 'Free to deploy', 'Open source'].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-success-500" />
                  {t}
                </div>
              ))}
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-violet-500" />
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-gray-400 font-medium">StockFlow Dashboard</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Total Products', value: '1,284', color: 'bg-blue-50 text-blue-700' },
                  { label: 'Low Stock', value: '23', color: 'bg-orange-50 text-orange-700' },
                  { label: 'Pending Receipts', value: '8', color: 'bg-purple-50 text-purple-700' },
                  { label: 'Deliveries Today', value: '15', color: 'bg-green-50 text-green-700' },
                ].map((card) => (
                  <div key={card.label} className={`rounded-xl p-4 ${card.color}`}>
                    <p className="text-xs font-medium opacity-70 mb-1">{card.label}</p>
                    <p className="text-2xl font-bold">{card.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Recent Operations</p>
                {[
                  { ref: 'REC-2024-0042', type: 'Receipt', status: 'Done', color: 'bg-green-100 text-green-700' },
                  { ref: 'DEL-2024-0089', type: 'Delivery', status: 'Pick', color: 'bg-yellow-100 text-yellow-700' },
                  { ref: 'TRF-2024-0017', type: 'Transfer', status: 'Ready', color: 'bg-teal-100 text-teal-700' },
                ].map((op) => (
                  <div key={op.ref} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-xs font-semibold text-gray-700">{op.ref}</p>
                      <p className="text-xs text-gray-400">{op.type}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${op.color}`}>{op.status}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-100 rounded-full opacity-60 blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-violet-100 rounded-full opacity-50 blur-xl" />
          </div>
        </div>
      </section>

      {/* ─── KPI Stats ───────────────────────────────────────────────────── */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-white text-center">
          {stats.map((s) => (
            <div key={s.label} className="space-y-1">
              <p className="text-4xl font-extrabold">
                <AnimatedCounter target={s.value} suffix={s.suffix} />
              </p>
              <p className="text-primary-200 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              A complete suite of inventory management tools built for modern warehouses.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card-hover p-6 group cursor-default">
                <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-600 group-hover:text-white transition-all duration-200">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-500">Four simple steps to keep your inventory accurate, always.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                <div className="card p-6 text-center h-full">
                  <div className={`w-12 h-12 ${step.color} text-white rounded-2xl flex items-center justify-center text-lg font-bold mx-auto mb-4`}>
                    {step.num}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-12 -right-3 z-10 text-gray-300">
                    <ChevronRight size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Roles ───────────────────────────────────────────────────────── */}
      <section id="roles" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Built for Two Roles</h2>
            <p className="text-xl text-gray-500">Each user sees exactly what they need — nothing more.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 text-white p-10">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
              <ShieldCheck size={40} className="mb-6 text-primary-200" />
              <h3 className="text-2xl font-bold mb-3">Manager</h3>
              <p className="text-primary-200 leading-relaxed mb-6">Full visibility across all operations. Create receipts, deliveries, transfers, and adjustments. Manage products, categories, and warehouse settings.</p>
              <ul className="space-y-2 text-sm">
                {['Full product & category CRUD', 'Create all operation types', 'View complete move history', 'Dashboard with charts & alerts', 'Warehouse configuration'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-primary-300" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="inline-flex items-center gap-2 mt-8 bg-white text-primary-700 font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-50 transition-colors">
                Sign up as Manager <ArrowRight size={16} />
              </Link>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-800 to-gray-900 text-white p-10">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
              <Users size={40} className="mb-6 text-gray-400" />
              <h3 className="text-2xl font-bold mb-3">Warehouse Staff</h3>
              <p className="text-gray-400 leading-relaxed mb-6">Focused on action. See assigned tasks, process receipts, pick & pack deliveries, confirm transfers, and submit physical counts.</p>
              <ul className="space-y-2 text-sm">
                {['Task-focused dashboard', 'Process incoming receipts', 'Pick & pack delivery orders', 'Confirm internal transfers', 'Submit stock count adjustments'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-gray-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="inline-flex items-center gap-2 mt-8 bg-white/10 border border-white/20 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-white/20 transition-colors">
                Sign up as Staff <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary-600 via-primary-700 to-violet-700">
        <div className="max-w-4xl mx-auto text-center text-white space-y-6">
          <TrendingUp size={40} className="mx-auto text-primary-200" />
          <h2 className="text-4xl font-bold">Ready to Go Digital?</h2>
          <p className="text-primary-200 text-xl">Replace your spreadsheets with StockFlow IMS today.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/signup" className="bg-white text-primary-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-primary-50 transition-colors flex items-center gap-2">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors">
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <Boxes size={14} className="text-white" />
            </div>
            <span className="font-bold text-white">StockFlow IMS</span>
          </div>
          <p className="text-sm">© 2024 StockFlow IMS. Built for hackathon.</p>
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
