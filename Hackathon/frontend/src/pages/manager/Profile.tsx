import React, { useState } from 'react';
import ManagerLayout from '../../components/manager/ManagerLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { User, Mail, Shield, Lock, Save, Eye, EyeOff } from 'lucide-react';

const ManagerProfile = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPass: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const handleSaveName = async () => {
    setSaving(true);
    try {
      await api.put('/auth/profile', { name });
      toast.success('Profile updated!');
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Update failed'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPass.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (pwForm.newPass !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    setChangingPw(true);
    try {
      await api.post('/auth/change-password', { current_password: pwForm.current, new_password: pwForm.newPass });
      toast.success('Password changed!');
      setPwForm({ current: '', newPass: '', confirm: '' });
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Failed to change password'); }
    finally { setChangingPw(false); }
  };

  return (
    <ManagerLayout title="My Profile">
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="page-title">My Profile</h2>

        {/* Profile Info */}
        <div className="card p-6 space-y-5">
          <h3 className="font-semibold text-gray-900">Account Information</h3>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center text-2xl font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.name}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Shield size={12} className="text-primary-500" />
                <span className="text-xs text-primary-600 font-medium capitalize">{user?.role}</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="form-input pl-9" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="form-input pl-9 bg-gray-50 cursor-not-allowed" readOnly value={user?.email || ''} />
            </div>
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <input className="form-input bg-gray-50 cursor-not-allowed capitalize" readOnly value={user?.role || ''} />
          </div>

          <button onClick={handleSaveName} disabled={saving} className="btn-primary gap-2">
            {saving ? '...' : <><Save size={15} /> Save Changes</>}
          </button>
        </div>

        {/* Change Password */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Lock size={18} className="text-gray-500" /> Change Password
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {[{ key: 'current', label: 'Current Password', placeholder: 'Your current password' },
              { key: 'newPass', label: 'New Password', placeholder: 'Min 8 characters' },
              { key: 'confirm', label: 'Confirm New Password', placeholder: 'Re-enter new password' }].map(({ key, label, placeholder }) => (
              <div key={key} className="form-group">
                <label className="form-label">{label}</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPass ? 'text' : 'password'} className="form-input pl-9 pr-10" placeholder={placeholder}
                    value={(pwForm as any)[key]} onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })} />
                  {key === 'newPass' && (
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      onClick={() => setShowPass(!showPass)}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="submit" disabled={changingPw} className="btn-primary gap-2">
              {changingPw ? '...' : <><Lock size={15} /> Update Password</>}
            </button>
          </form>
        </div>
      </div>
    </ManagerLayout>
  );
};

export default ManagerProfile;
