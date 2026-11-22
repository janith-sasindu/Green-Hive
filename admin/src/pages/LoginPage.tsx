import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import logo from '../assets/logo.png';
import { loginAdmin } from '../services/api';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      const response = await loginAdmin({ email, password });

      if (response.data.success && response.data.token) {
        localStorage.setItem('green_hive_admin_token', response.data.token);
        localStorage.setItem(
          'green_hive_admin_user',
          JSON.stringify(response.data.admin)
        );
        onLoginSuccess();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const msg =
        err.response?.data?.message ||
        'Unable to log in. Please check your credentials and make sure the backend is running.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative bg-cover bg-center bg-no-repeat select-none p-4"
      style={{
        // 📷 Real High-Resolution Camera Photo of lush agricultural green farm fields
        backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2070&auto=format&fit=crop')`,
      }}
    >
      {/* Light, natural transparent dark vignette */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      {/* ========================================================= */}
      {/* TRANSLUCENT FROSTED GLASS LOGIN CARD */}
      {/* ========================================================= */}
<div 
  className="w-full max-w-md rounded-3xl p-8 sm:p-10 border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative z-10 animate-fadeIn"
  style={{
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    backdropFilter: 'blur(10px)',                   
    WebkitBackdropFilter: 'blur(10px)',
  }}
>        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-7">
          <div 
            className="w-20 h-20 mb-3 rounded-2xl p-2.5 shadow-md flex items-center justify-center border border-white/40"
            style={{ backgroundColor: '#175524' }}
          >
            <img
              src={logo}
              alt="Green Hive Logo"
              className="w-full h-full object-contain drop-shadow"
            />
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Green Hive
          </h1>

          <p 
            className="text-[11px] font-bold tracking-widest uppercase mt-1"
            style={{ color: '#175524' }}
          >
            CONNECT · TRADE · TRANSPORT · GROW
          </p>

          <p className="text-xs text-slate-600 mt-1 max-w-[280px] leading-relaxed font-medium">
            Sri Lanka's agricultural marketplace — connecting farmers, sellers &amp; transporters
          </p>

          <div 
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-sm"
            style={{ 
              backgroundColor: 'rgba(239, 247, 241, 0.85)', 
              borderColor: '#C6E4CD',
              color: '#175524'
            }}
          >
            <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#175524' }} />
            <span className="text-[10px] font-bold tracking-wider uppercase">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-rose-50/90 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-slate-200/90 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#175524] focus:bg-white transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-10 pr-11 py-2.5 bg-white/70 border border-slate-200/90 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#175524] focus:bg-white transition-all shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: '#175524' }}
            className="w-full mt-3 py-3 px-4 hover:opacity-95 active:opacity-90 text-white font-semibold text-sm rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In to Dashboard</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200/60 text-center">
          <p style={{ color: '#a90000ff' }} className="text-[11px] text-slate-500 font-medium">
            Protected system. Authorized administrative personnel only.
          </p>
        </div>
      </div>
    </div>
  );
}