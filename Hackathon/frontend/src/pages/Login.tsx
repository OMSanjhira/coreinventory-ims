import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LogIn, Mail, Lock, Boxes, Eye, EyeOff, Zap } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'staff') navigate('/staff/dashboard');
      else navigate('/manager/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.18) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(139,92,246,0.12) 0%, transparent 50%), #06070d',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background grid pattern */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `radial-gradient(rgba(99,102,241,0.06) 1px, transparent 1px)`,
        backgroundSize: '28px 28px',
      }} />
      {/* Ambient orbs */}
      <div style={{
        position: 'absolute', top: '-80px', left: '15%', width: '300px', height: '300px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-60px', right: '10%', width: '250px', height: '250px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(30px)', pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        {/* Logo + headline */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '24px', textDecoration: 'none' }}>
            <div style={{
              width: '44px', height: '44px',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 24px rgba(99,102,241,0.5)',
            }}>
              <Boxes size={22} color="#fff" />
            </div>
            <span style={{
              fontSize: '22px', fontWeight: 900, letterSpacing: '-0.04em',
              background: 'linear-gradient(135deg, #f0f2ff, #a5b4fc)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>Stock<span style={{ WebkitTextFillColor: '#818cf8' }}>Flow</span></span>
          </Link>
          <h1 style={{
            fontSize: '28px', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '6px',
            background: 'linear-gradient(135deg, #f0f2ff 0%, #a5b4fc 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Welcome back</h1>
          <p style={{ color: '#8892b0', fontSize: '14px' }}>
            Sign in to your inventory workspace
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(13,17,23,0.85)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(99,102,241,0.18)',
          borderRadius: '20px',
          padding: '36px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1), 0 0 40px rgba(99,102,241,0.08)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Email */}
            <div>
              <label style={{
                display: 'block', fontSize: '11px', fontWeight: 700,
                color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '7px'
              }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#4a5568' }} />
                <input
                  type="email"
                  required
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: 'block', fontSize: '11px', fontWeight: 700,
                color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '7px'
              }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#4a5568' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  className="form-input"
                  style={{ paddingLeft: '38px', paddingRight: '40px' }}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#4a5568', background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div style={{ textAlign: 'right', marginTop: '-4px' }}>
              <Link to="/reset-password" style={{ fontSize: '12px', color: '#6366f1', fontWeight: 600 }}>
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: '14px', marginTop: '4px' }}
            >
              {loading ? (
                <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
              ) : <LogIn size={16} />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(99,102,241,0.12)', margin: '20px 0' }} />

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#8892b0' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#818cf8', fontWeight: 700 }}>Create one</Link>
          </p>
        </div>

        {/* Tagline */}
        <p style={{ textAlign: 'center', fontSize: '11px', color: '#4a5568', marginTop: '20px' }}>
          <Zap size={11} style={{ display: 'inline', marginRight: '4px', color: '#6366f1' }} />
          Enterprise Inventory Management System
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Login;
