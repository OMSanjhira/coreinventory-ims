import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import { Mail, KeyRound, Lock, Boxes, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';

type Step = 1 | 2 | 3;

const ResetPassword = () => {
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      toast.success('OTP sent to your email!');
      setStep(2);
      setCountdown(60);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Email not found');
    } finally { setLoading(false); }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) { toast.error('Enter all 6 digits'); return; }
    setLoading(true);
    try {
      const data = await authService.verifyOTP(email, otpString);
      setResetToken(data.reset_token || data);
      toast.success('OTP verified!');
      setStep(3);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid or expired OTP');
    } finally { setLoading(false); }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    try {
      await authService.forgotPassword(email);
      toast.success('OTP resent!');
      setCountdown(60);
    } catch (err: any) {
      toast.error('Failed to resend OTP');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await authService.resetPassword(resetToken, newPassword);
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Reset failed');
    } finally { setLoading(false); }
  };

  const stepInfo = [
    { num: 1, label: 'Enter Email' },
    { num: 2, label: 'Verify OTP' },
    { num: 3, label: 'New Password' },
  ];

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-500">Follow the steps to recover your account</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {stepInfo.map((s, i) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-1.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s.num ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {step > s.num ? <CheckCircle size={16} /> : s.num}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${step >= s.num ? 'text-primary-600' : 'text-gray-400'}`}>{s.label}</span>
              </div>
              {i < stepInfo.length - 1 && <div className={`flex-1 h-0.5 max-w-8 ${step > s.num ? 'bg-primary-600' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Step 1 — Email */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Mail size={24} className="text-primary-600" />
                </div>
                <h2 className="font-semibold text-gray-900">Enter your email</h2>
                <p className="text-sm text-gray-500 mt-1">We'll send a 6-digit OTP to reset your password</p>
              </div>
              <div className="form-group">
                <label className="form-label">Registered Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" required className="form-input pl-9" placeholder="you@company.com"
                    value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
              <Link to="/login" className="flex items-center gap-2 justify-center text-sm text-gray-500 hover:text-gray-700">
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </form>
          )}

          {/* Step 2 — OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <KeyRound size={24} className="text-primary-600" />
                </div>
                <h2 className="font-semibold text-gray-900">Enter OTP</h2>
                <p className="text-sm text-gray-500 mt-1">Sent to <strong>{email}</strong></p>
              </div>
              <div className="flex gap-2 justify-center">
                {otp.map((digit, i) => (
                  <input key={i} type="text" inputMode="numeric" maxLength={1}
                    ref={(el) => (otpRefs.current[i] = el)}
                    className="w-11 h-12 text-center text-xl font-bold border-2 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                    value={digit}
                    onChange={(e) => handleOTPChange(i, e.target.value)}
                    onKeyDown={(e) => handleOTPKeyDown(i, e)}
                  />
                ))}
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <div className="text-center">
                <button type="button" onClick={handleResendOTP} disabled={countdown > 0}
                  className={`text-sm font-medium transition-colors ${countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-primary-600 hover:text-primary-700'}`}>
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          {/* Step 3 — New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-success-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Lock size={24} className="text-success-600" />
                </div>
                <h2 className="font-semibold text-gray-900">Set New Password</h2>
                <p className="text-sm text-gray-500 mt-1">Choose a strong password</p>
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPass ? 'text' : 'password'} required className="form-input pl-9 pr-10"
                    placeholder="Min 8 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPass ? 'text' : 'password'} required className="form-input pl-9"
                    placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Updating...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
