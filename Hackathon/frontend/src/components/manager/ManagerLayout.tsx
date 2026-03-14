import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Package, Tag, PackagePlus, Truck, ArrowLeftRight,
  Settings2, History, Warehouse, User, LogOut, Menu, X, Bell, Search,
  ChevronRight, Boxes
} from 'lucide-react';

const SidebarSection = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="mb-5">
    <p className="sidebar-section-label mb-2">{label}</p>
    <div className="space-y-0.5">{children}</div>
  </div>
);

const NavLink = ({ to, icon, label }: { to: string; icon: ReactNode; label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
  return (
    <Link to={to} className={`sidebar-link ${isActive ? 'active' : ''}`}>
      <span className="flex-shrink-0" style={{ color: isActive ? '#a5b4fc' : '#8892b0' }}>{icon}</span>
      <span>{label}</span>
      {isActive && <ChevronRight size={13} className="ml-auto" style={{ color: '#a5b4fc' }} />}
    </Link>
  );
};

interface ManagerLayoutProps {
  children: ReactNode;
  title?: string;
}

const ManagerLayout = ({ children, title }: ManagerLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="sidebar" style={{ width: '256px' }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(99,102,241,0.12)' }}>
        <Link to="/manager/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99,102,241,0.5)',
          }}>
            <Boxes size={18} color="#fff" />
          </div>
          <div>
            <span style={{
              fontSize: '17px', fontWeight: 800, letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #f0f2ff, #a5b4fc)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              Stock<span style={{ WebkitTextFillColor: '#818cf8' }}>Flow</span>
            </span>
            <p style={{ fontSize: '9px', color: '#4a5568', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '-2px' }}>Enterprise IMS</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <NavLink to="/manager/dashboard" icon={<LayoutDashboard size={16} />} label="Dashboard" />

        <div style={{ height: '1px', background: 'rgba(99,102,241,0.1)', margin: '10px 0' }} />

        <SidebarSection label="Products">
          <NavLink to="/manager/products" icon={<Package size={16} />} label="Products" />
          <NavLink to="/manager/categories" icon={<Tag size={16} />} label="Categories" />
        </SidebarSection>

        <SidebarSection label="Operations">
          <NavLink to="/manager/receipts" icon={<PackagePlus size={16} />} label="Receipts" />
          <NavLink to="/manager/deliveries" icon={<Truck size={16} />} label="Deliveries" />
          <NavLink to="/manager/transfers" icon={<ArrowLeftRight size={16} />} label="Transfers" />
          <NavLink to="/manager/adjustments" icon={<Settings2 size={16} />} label="Adjustments" />
          <NavLink to="/manager/history" icon={<History size={16} />} label="Move History" />
        </SidebarSection>

        <SidebarSection label="Settings">
          <NavLink to="/manager/warehouses" icon={<Warehouse size={16} />} label="Warehouses" />
        </SidebarSection>
      </nav>

      {/* User footer */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(99,102,241,0.12)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'rgba(99,102,241,0.08)',
          border: '1px solid rgba(99,102,241,0.15)',
          borderRadius: '12px', padding: '10px 12px', marginBottom: '8px'
        }}>
          <div style={{
            width: '34px', height: '34px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 800, color: '#fff',
            flexShrink: 0, boxShadow: '0 0 12px rgba(99,102,241,0.4)'
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#f0f2ff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
            <p style={{ fontSize: '10px', color: '#6366f1', textTransform: 'capitalize', fontWeight: 600 }}>{user?.role}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <Link to="/manager/profile" className="sidebar-link" style={{ flex: 1, justifyContent: 'center', fontSize: '12px', padding: '7px 10px' }}>
            <User size={14} /> Profile
          </Link>
          <button onClick={handleLogout} className="sidebar-link" style={{ flex: 1, justifyContent: 'center', fontSize: '12px', padding: '7px 10px', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-base)', overflow: 'hidden' }}>
      {/* Desktop Sidebar */}
      <div style={{ display: 'none' }} className="lg:flex">
        <SidebarContent />
      </div>
      <div className="hidden lg:flex flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} className="lg:hidden">
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={() => setSidebarOpen(false)} />
          <div style={{ position: 'relative', display: 'flex' }}>
            <SidebarContent />
            <button style={{ position: 'absolute', top: '16px', right: '16px', color: '#8892b0' }} onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{
          background: 'rgba(13,17,23,0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(99,102,241,0.12)',
          padding: '0 24px',
          height: '60px',
          display: 'flex', alignItems: 'center', gap: '16px',
          flexShrink: 0,
          position: 'sticky', top: 0, zIndex: 30,
        }}>
          <button style={{ color: '#8892b0' }} className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>

          <div style={{ flex: 1 }}>
            {title && (
              <h1 style={{
                fontSize: '16px', fontWeight: 700, letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #f0f2ff, #a5b4fc)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>{title}</h1>
            )}
          </div>

          {/* Search bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(99,102,241,0.15)',
            borderRadius: '10px', padding: '8px 14px',
            width: '240px', transition: 'all 0.2s ease',
          }} className="hidden md:flex">
            <Search size={14} style={{ color: '#4a5568', flexShrink: 0 }} />
            <input
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: '13px', color: 'var(--text-primary)', flex: 1,
                fontFamily: 'inherit'
              }}
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Notification bell */}
          <Link to="/manager/products" state={{ search }}
            style={{
              width: '38px', height: '38px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(99,102,241,0.15)',
              borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#8892b0', transition: 'all 0.2s ease',
              position: 'relative'
            }}>
            <Bell size={17} />
            <span style={{
              position: 'absolute', top: '7px', right: '7px',
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#6366f1', boxShadow: '0 0 6px rgba(99,102,241,0.8)'
            }} />
          </Link>

          {/* Avatar */}
          <Link to="/manager/profile" style={{
            width: '38px', height: '38px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 800, color: '#fff',
            boxShadow: '0 0 12px rgba(99,102,241,0.4)', transition: 'box-shadow 0.2s',
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </Link>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)' }}>
          {/* Subtle grid pattern overlay */}
          <div style={{
            position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
            backgroundImage: `radial-gradient(rgba(99,102,241,0.04) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }} />
          <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;
