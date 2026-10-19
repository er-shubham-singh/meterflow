'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { 
  Zap, 
  ShieldCheck, 
  UserCheck, 
  Mail, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  AlertCircle,
  Shield,
  Key,
  CheckCircle2
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee'); // 'employee' | 'admin'
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both your corporate email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const res = await login({ 
      email: email.trim(), 
      password, 
      role 
    });

    setLoading(false);

    if (res.success && res.data) {
      const isRoleAdmin = res.data.role === 'organization_admin' || 
                          res.data.role === 'platform_super_admin' || 
                          res.data.role === 'admin';

      if (role === 'admin' && !isRoleAdmin) {
        setErrorMsg('Access Denied: This account does not possess Administrator privileges. Please select "Employee / Developer" in the role dropdown.');
        return;
      }

      if (role === 'employee' && isRoleAdmin) {
        setErrorMsg('Access Denied: Administrator account detected. Please select "Workspace Administrator" in the role dropdown to sign in as an admin.');
        return;
      }

      addToast(`Welcome back, ${res.data.name}!`, 'success');
      
      if (role === 'admin') {
        router.push('/');
      } else {
        router.push('/employee-portal');
      }
    } else {
      setErrorMsg(res.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#07090e] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background radial glow accents */}
      <div className="absolute top-0 left-1/3 w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-[440px] relative z-10 flex flex-col gap-6">
        {/* Brand Header */}
        <div className="text-center flex flex-col items-center">
          <Link href="/" className="flex items-center gap-2.5 mb-2.5 no-underline group">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
              <Zap size={22} className="text-white fill-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Meter<span className="text-blue-500">Flow</span>
            </span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Enterprise Sign In</h1>
          <p className="text-xs text-slate-400 mt-1">
            Usage-Based Pricing, API Gateway & Cost Showback Engine
          </p>
        </div>

        {/* Professional Login Form Card */}
        <div className="bg-[#0D111A]/95 border border-slate-800 p-6 sm:p-8 rounded-2xl backdrop-blur-2xl shadow-2xl flex flex-col gap-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Account Role Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Account Role</span>
                <span className="text-[10px] text-slate-500">Select your access level</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  {role === 'admin' ? (
                    <ShieldCheck size={16} className="text-purple-400" />
                  ) : (
                    <UserCheck size={16} className="text-blue-400" />
                  )}
                </div>
                <select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full bg-slate-950/90 border border-slate-800 hover:border-slate-700 focus:border-blue-500 rounded-xl pl-9 pr-9 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer appearance-none font-medium"
                >
                  <option value="employee" className="bg-slate-950 text-white py-1">
                    Employee / Developer
                  </option>
                  <option value="admin" className="bg-slate-950 text-white py-1">
                    Workspace Administrator
                  </option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Dynamic Role Capability Badge */}
              {role === 'admin' ? (
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-purple-950/30 border border-purple-800/40 text-[11px] text-purple-300 animate-in fade-in duration-150">
                  <Shield size={13} className="shrink-0 text-purple-400" />
                  <span>Admin Console: Full platform, billing, team quotas & employee management</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-blue-950/30 border border-blue-800/40 text-[11px] text-blue-300 animate-in fade-in duration-150">
                  <Key size={13} className="shrink-0 text-blue-400" />
                  <span>Developer Portal: Personal API token, monthly limits & telemetry</span>
                </div>
              )}
            </div>

            {/* Corporate Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Corporate Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder={role === 'admin' ? 'admin@company.com' : 'employee@company.com'}
                  required
                  autoComplete="email"
                  className="w-full bg-slate-950/90 border border-slate-800 hover:border-slate-700 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => addToast('Please contact your administrator at admin@meterflow.io to reset credentials.', 'info')}
                  className="text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer bg-transparent border-0 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full bg-slate-950/90 border border-slate-800 hover:border-slate-700 focus:border-blue-500 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember Me Option */}
            <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 py-3 px-4 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50 ${
                role === 'admin'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/30'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-600/30'
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <>
                  <span>Sign In as {role === 'admin' ? 'Workspace Administrator' : 'Employee / Developer'}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Security Footer Notice */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[10px] text-slate-500">
            <Shield size={12} className="text-slate-500" />
            <span>Secured with TLS 1.3 & Role-Based Access Control (RBAC)</span>
          </div>
        </div>

        {/* Bottom Navigation Links */}
        <div className="flex items-center justify-between px-2 text-xs text-slate-400">
          <Link href="/landing" className="hover:text-white transition-colors no-underline">
            ← Explore Public Landing Page
          </Link>
          <Link href="/docs" className="hover:text-white transition-colors no-underline">
            API Documentation →
          </Link>
        </div>
      </div>
    </div>
  );
}
