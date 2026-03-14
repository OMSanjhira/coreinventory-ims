import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ResetPassword from './pages/ResetPassword';

// Manager pages
import ManagerDashboard from './pages/manager/Dashboard';
import ManagerProducts from './pages/manager/Products';
import ManagerProductCreate from './pages/manager/ProductCreate';
import ManagerProductDetail from './pages/manager/ProductDetail';
import ManagerCategories from './pages/manager/Categories';
import ManagerReceipts from './pages/manager/Receipts';
import ManagerReceiptCreate from './pages/manager/ReceiptCreate';
import ManagerReceiptDetail from './pages/manager/ReceiptDetail';
import ManagerDeliveries from './pages/manager/Deliveries';
import ManagerDeliveryCreate from './pages/manager/DeliveryCreate';
import ManagerDeliveryDetail from './pages/manager/DeliveryDetail';
import ManagerTransfers from './pages/manager/Transfers';
import ManagerTransferCreate from './pages/manager/TransferCreate';
import ManagerTransferDetail from './pages/manager/TransferDetail';
import ManagerAdjustments from './pages/manager/Adjustments';
import ManagerAdjustmentCreate from './pages/manager/AdjustmentCreate';
import ManagerHistory from './pages/manager/History';
import ManagerWarehouses from './pages/manager/Warehouses';
import ManagerProfile from './pages/manager/Profile';

// Staff pages
import StaffDashboard from './pages/staff/Dashboard';
import StaffReceipts from './pages/staff/Receipts';
import StaffReceiptDetail from './pages/staff/ReceiptDetail';
import StaffDeliveries from './pages/staff/Deliveries';
import StaffDeliveryDetail from './pages/staff/DeliveryDetail';
import StaffTransfers from './pages/staff/Transfers';
import StaffTransferDetail from './pages/staff/TransferDetail';
import StaffAdjustments from './pages/staff/Adjustments';
import StaffAdjustmentDetail from './pages/staff/AdjustmentDetail';
import StaffProfile from './pages/staff/Profile';
import StaffMyTasks from './pages/staff/MyTasks';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '10px',
              background: '#1f2937',
              color: '#f9fafb',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Manager Routes */}
          <Route element={<ProtectedRoute requiredRole="manager" />}>
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/products" element={<ManagerProducts />} />
            <Route path="/manager/products/create" element={<ManagerProductCreate />} />
            <Route path="/manager/products/:id" element={<ManagerProductDetail />} />
            <Route path="/manager/categories" element={<ManagerCategories />} />
            <Route path="/manager/receipts" element={<ManagerReceipts />} />
            <Route path="/manager/receipts/create" element={<ManagerReceiptCreate />} />
            <Route path="/manager/receipts/:id" element={<ManagerReceiptDetail />} />
            <Route path="/manager/deliveries" element={<ManagerDeliveries />} />
            <Route path="/manager/deliveries/create" element={<ManagerDeliveryCreate />} />
            <Route path="/manager/deliveries/:id" element={<ManagerDeliveryDetail />} />
            <Route path="/manager/transfers" element={<ManagerTransfers />} />
            <Route path="/manager/transfers/create" element={<ManagerTransferCreate />} />
            <Route path="/manager/transfers/:id" element={<ManagerTransferDetail />} />
            <Route path="/manager/adjustments" element={<ManagerAdjustments />} />
            <Route path="/manager/adjustments/create" element={<ManagerAdjustmentCreate />} />
            <Route path="/manager/history" element={<ManagerHistory />} />
            <Route path="/manager/warehouses" element={<ManagerWarehouses />} />
            <Route path="/manager/profile" element={<ManagerProfile />} />
          </Route>

          {/* Staff Routes */}
          <Route element={<ProtectedRoute requiredRole="staff" />}>
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
            <Route path="/staff/my-tasks" element={<StaffMyTasks />} />
            <Route path="/staff/receipts" element={<StaffReceipts />} />
            <Route path="/staff/receipts/:id" element={<StaffReceiptDetail />} />
            <Route path="/staff/deliveries" element={<StaffDeliveries />} />
            <Route path="/staff/deliveries/:id" element={<StaffDeliveryDetail />} />
            <Route path="/staff/transfers" element={<StaffTransfers />} />
            <Route path="/staff/transfers/:id" element={<StaffTransferDetail />} />
            <Route path="/staff/adjustments" element={<StaffAdjustments />} />
            <Route path="/staff/adjustments/:id" element={<StaffAdjustmentDetail />} />
            <Route path="/staff/profile" element={<StaffProfile />} />
          </Route>

          {/* Legacy redirects */}
          <Route path="/dashboard" element={<Navigate to="/manager/dashboard" replace />} />
          <Route path="/products" element={<Navigate to="/manager/products" replace />} />
          <Route path="*" element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-4">
              <h1 className="text-4xl font-bold text-gray-800">404</h1>
              <p className="text-gray-500">Page not found</p>
              <a href="/" className="btn-primary">Go Home</a>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
