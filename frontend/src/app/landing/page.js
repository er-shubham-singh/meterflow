'use client';

import Link from 'next/link';
import { 
  Zap, 
  ArrowRight, 
  Play, 
  Layers, 
  BarChart3, 
  Users, 
  ReceiptText, 
  ShieldCheck, 
  CheckCircle2, 
  Server, 
  Sparkles,
  Bot,
  Cloud,
  Mail,
  Phone,
  CreditCard,
  Code2
} from 'lucide-react';

const POPULAR_APIS = [
  { name: 'OpenAI', desc: 'AI Models', icon: Bot, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { name: 'Google AI', desc: 'Gemini', icon: Sparkles, color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: 'Azure', desc: 'AI Services', icon: Cloud, color: 'text-sky-600', bg: 'bg-sky-50' },
  { name: 'Twilio', desc: 'SMS & Voice', icon: Phone, color: 'text-rose-600', bg: 'bg-rose-50' },
  { name: 'Brevo', desc: 'Email', icon: Mail, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { name: 'Razorpay', desc: 'Payments', icon: CreditCard, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { name: 'AWS', desc: 'Cloud Services', icon: Server, color: 'text-amber-600', bg: 'bg-amber-50' },
  { name: 'Custom API', desc: 'Your Own APIs', icon: Code2, color: 'text-purple-600', bg: 'bg-purple-50' }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-500 selection:text-white">
      {/* Top Public Navigation Bar (Matching Panel 1) */}
      <nav className="h-20 border-b border-slate-100 px-6 sm:px-12 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-40">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Zap size={18} className="text-white fill-white" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">
            Meter<span className="text-blue-600">Flow</span>
          </span>
        </Link>

        {/* Public Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <Link href="#product" className="hover:text-blue-600 transition-colors">Product</Link>
          <Link href="#solutions" className="hover:text-blue-600 transition-colors">Solutions</Link>
          <Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
          <Link href="/docs" className="hover:text-blue-600 transition-colors">Developers</Link>
          <Link href="/playground" className="hover:text-blue-600 transition-colors">Playground</Link>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-sm font-bold text-slate-700 hover:text-blue-600 px-3 py-2 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition-all no-underline"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section (Matching Panel 1) */}
      <section className="pt-12 pb-20 px-6 sm:px-12 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>Usage-Based Pricing & Metering Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] mb-6">
              Control, Monitor and Scale Your <span className="text-blue-600">API Usage</span>
            </h1>

            {/* Subhead */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mb-8">
              One platform to manage third-party APIs and your own internal APIs. Track usage, set limits, allocate to teams, and get accurate billing.
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-4 flex-wrap mb-12">
              <Link
                href="/"
                className="px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-xl shadow-blue-600/30 transition-all no-underline"
              >
                <span>Get Started Free</span>
                <ArrowRight size={16} />
              </Link>

              <Link
                href="/"
                className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl flex items-center gap-2 transition-all no-underline"
              >
                <Play size={15} className="text-slate-600 fill-slate-600" />
                <span>View Demo</span>
              </Link>
            </div>

            {/* 4 Feature Pills in Hero */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full pt-8 border-t border-slate-100">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                  <Layers size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Multi-Provider</div>
                  <div className="text-[11px] text-slate-500">Support</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Usage Analytics</div>
                  <div className="text-[11px] text-slate-500">Real-time insights</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0">
                  <Users size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Team Management</div>
                  <div className="text-[11px] text-slate-500">Control & limits</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                  <ReceiptText size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Automated Billing</div>
                  <div className="text-[11px] text-slate-500">Accurate invoices</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Hero Graphic: 3D Layered Glassmorphic Card (Matching Panel 1) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Background glowing gradient */}
            <div className="absolute w-72 h-72 rounded-full bg-blue-400/20 blur-3xl -z-10 pointer-events-none"></div>

            {/* Main Floating Card */}
            <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-7 shadow-2xl shadow-blue-500/10 flex flex-col gap-5 transform hover:-translate-y-1 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-400">Total API Requests</div>
                  <div className="text-3xl font-black text-slate-900 font-mono tracking-tight mt-1">
                    2.4M
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold text-xs flex items-center gap-1">
                  +112%
                </span>
              </div>

              {/* Sparkline Graphic */}
              <div className="h-28 w-full bg-slate-50 rounded-xl p-3 flex items-end justify-between gap-1 border border-slate-100">
                {[30, 45, 38, 55, 60, 52, 75, 80, 70, 90, 85, 100].map((h, i) => (
                  <div 
                    key={i} 
                    style={{ height: `${h}%` }} 
                    className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-sm"
                  ></div>
                ))}
              </div>

              {/* Connected Provider Icons Row */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex -space-x-2 overflow-hidden">
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">AI</div>
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">G</div>
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">B</div>
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center">T</div>
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-cyan-600 text-white font-bold text-[10px] flex items-center justify-center">R</div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Latency</div>
                  <div className="text-xs font-black text-emerald-600 font-mono">&lt; 1.8ms</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Works with Popular APIs (Matching Panel 1) */}
      <section className="py-16 bg-slate-50/70 border-t border-slate-200/80 px-6 sm:px-12">
        <div className="max-w-[1400px] mx-auto text-center mb-10">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Works with Popular APIs
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Connect third-party providers or use your own internal APIs.
          </p>
        </div>

        {/* 8 Provider Cards Grid (Matching Panel 1) */}
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {POPULAR_APIS.map((api, idx) => {
            const Icon = api.icon;
            return (
              <div 
                key={idx}
                className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group"
              >
                <div className={`w-12 h-12 rounded-xl ${api.bg} ${api.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon size={24} />
                </div>
                <div className="text-xs font-extrabold text-slate-900 truncate w-full">{api.name}</div>
                <div className="text-[10px] text-slate-500 font-medium truncate w-full mt-0.5">{api.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 text-center text-xs text-slate-400">
        © 2026 MeterFlow — Usage-Based Pricing & Metering Platform. All rights reserved.
      </footer>
    </div>
  );
}
