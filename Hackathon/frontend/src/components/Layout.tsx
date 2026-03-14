import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  PackagePlus,
  PackageMinus,
  Settings2,
  ArrowLeftRight, 
  History, 
  LogOut,
  Warehouse,
  ClipboardList,
  User
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Products', icon: <Package size={20} />, path: '/products' },
    { name: 'Receipts', icon: <PackagePlus size={20} />, path: '/receipts' },
    { name: 'Deliveries', icon: <PackageMinus size={20} />, path: '/deliveries' },
    { name: 'Transfers', icon: <ArrowLeftRight size={20} />, path: '/transfers' },
    { name: 'Adjustments', icon: <Settings2 size={20} />, path: '/adjustments' },
    { name: 'History', icon: <History size={20} />, path: '/history' },
    { name: 'Warehouses', icon: <Warehouse size={20} />, path: '/warehouses' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-white/10 flex flex-col">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-primary-500 p-2 rounded-lg">
              <ClipboardList className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white uppercase italic">Core<span className="text-primary-400">Inventory</span></span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  location.pathname === item.path 
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30 font-medium' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-2">
          <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-2xl mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-primary-400">
              <User size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">{user?.role}</p>
            </div>
          </div>
          
          <button className="flex items-center space-x-3 w-full px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <User size={20} />
            <span>My Profile</span>
          </button>

          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-transparent relative">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
