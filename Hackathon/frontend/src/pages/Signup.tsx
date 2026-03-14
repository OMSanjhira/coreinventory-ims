import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { UserPlus, Mail, Lock, User, Boxes, Eye, EyeOff } from 'lucide-react';

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm_password: '', role: 'staff' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email.includes('@')) e.email = 'Enter a valid email';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match';
    return e;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role });
      toast.success('Account created! Please log in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Boxes size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold">Stock<span className="text-primary-600">Flow</span> IMS</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-500">Join StockFlow IMS today</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="name" type="text" required className={`form-input pl-9 ${errors.name ? 'border-danger-500 ring-1 ring-danger-500' : ''}`}
                  placeholder="Jane Smith" value={form.name} onChange={handleChange} />
              </div>
              {errors.name && <p className="text-danger-600 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="email" type="email" required className={`form-input pl-9 ${errors.email ? 'border-danger-500 ring-1 ring-danger-500' : ''}`}
                  placeholder="you@company.com" value={form.email} onChange={handleChange} />
              </div>
              {errors.email && <p className="text-danger-600 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Role */}
            <div className="form-group">
              <label className="form-label">Role</label>
              <select name="role" className="form-input" value={form.role} onChange={handleChange}>
                <option value="manager">Manager — Full access & operations control</option>
                <option value="staff">Warehouse Staff — Process operations</option>
              </select>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="password" type={showPass ? 'text' : 'password'} required
                  className={`form-input pl-9 pr-10 ${errors.password ? 'border-danger-500 ring-1 ring-danger-500' : ''}`}
                  placeholder="Minimum 8 characters" value={form.password} onChange={handleChange} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-danger-600 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="confirm_password" type={showPass ? 'text' : 'password'} required
                  className={`form-input pl-9 ${errors.confirm_password ? 'border-danger-500 ring-1 ring-danger-500' : ''}`}
                  placeholder="Repeat password" value={form.confirm_password} onChange={handleChange} />
              </div>
              {errors.confirm_password && <p className="text-danger-600 text-xs mt-1">{errors.confirm_password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base gap-2 mt-2">
              {loading ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <UserPlus size={18} />}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
