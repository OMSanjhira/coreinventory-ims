import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, ClipboardList, PackagePlus, Truck, ArrowLeftRight,
  Settings2, User, LogOut, Menu, X, ChevronRight, Boxes
} from 'lucide-react';

const NavLink = ({ to, icon, label }: { to: string; icon: ReactNode; label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
  return (
    <Link to={to} className={`sidebar-link ${isActive ? 'active' : ''}`}>
      <span className="flex-shrink-0">{icon}</span>
      <span>{label}</span>
      {isActive && <ChevronRight size={14} className="ml-auto text-primary-500" />}
    </Link>
  );
};

interface StaffLayoutProps {
  children: ReactNode;
  title?: string;
}

const StaffLayout = ({ children, title }: StaffLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="sidebar w-64 flex-shrink-0 overflow-y-auto">
      <div className="p-5 border-b border-gray-100">
        <Link to="/staff/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
            <Boxes size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Stock<span className="text-primary-600">Flow</span>
          </span>
        </Link>
      </div>

      <nav className="p-4 flex flex-col gap-0.5 flex-1">
        <NavLink to="/staff/dashboard" icon={<LayoutDashboard size={18} />} label="My Dashboard" />
        <NavLink to="/staff/my-tasks" icon={<ClipboardList size={18} />} label="My Tasks" />

        <div className="my-3 border-t border-gray-100">
          <p className="sidebar-section-label mt-3 mb-2">Operations</p>
        </div>

        <NavLink to="/staff/receipts" icon={<PackagePlus size={18} />} label="Receipts" />
        <NavLink to="/staff/deliveries" icon={<Truck size={18} />} label="Deliveries" />
        <NavLink to="/staff/transfers" icon={<ArrowLeftRight size={18} />} label="Transfers" />
        <NavLink to="/staff/adjustments" icon={<Settings2 size={18} />} label="Adjustments" />
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-2">
          <div className="w-9 h-9 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400">Warehouse Staff</p>
          </div>
        </div>
        <Link to="/staff/profile" className="sidebar-link mb-0.5">
          <User size={16} /> My Profile
        </Link>
        <button onClick={handleLogout} className="sidebar-link w-full text-left text-danger-600 hover:bg-danger-50 hover:text-danger-700">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="hidden lg:flex">
        <SidebarContent />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex">
            <SidebarContent />
            <button className="absolute top-4 right-4 text-gray-400" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 flex-shrink-0">
          <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="flex-1">
            {title && <h1 className="text-xl font-bold text-gray-900">{title}</h1>}
          </div>
          <Link to="/staff/profile" className="w-9 h-9 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-sm hover:bg-primary-200 transition-colors">
            {user?.name?.[0]?.toUpperCase()}
          </Link>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-[1200px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
