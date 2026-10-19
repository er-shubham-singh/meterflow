'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useCurrency } from '@/context/CurrencyContext';
import { api } from '@/services/api';
import Link from 'next/link';
import { 
  KeyRound, 
  Copy, 
  Check, 
  Terminal, 
  Zap, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Server, 
  ArrowUpRight, 
  Play, 
  RefreshCw,
  Code2,
  FileCode,
  Users
} from 'lucide-react';

export default function EmployeePortalPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { formatCurrency } = useCurrency();

  const [copied, setCopied] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState('curl');
  const [employeeDashboard, setEmployeeDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const [sendingTest, setSendingTest] = useState(false);

  // Dynamic values prioritizing live employeeDashboard
  const currentToken = employeeDashboard?.apiKey || user?.apiKey || 'sk_mf_live_vikash_3311defa7890';
  const monthlyLimit = employeeDashboard?.monthlyLimit || user?.monthlyLimitInr || 10000;
  const currentCost = employeeDashboard?.estimatedCostInr !== undefined ? employeeDashboard.estimatedCostInr : (user?.monthlyCostInr || 980);
  const requestsCount = employeeDashboard?.myUsageThisMonth !== undefined ? employeeDashboard.myUsageThisMonth : (user?.monthlyRequests || 18220);
  const remainingBudget = employeeDashboard?.remainingBudgetInr !== undefined ? employeeDashboard.remainingBudgetInr : Math.max(0, monthlyLimit - currentCost);
  const teamName = employeeDashboard?.team || user?.teamName || 'Marketing Team';
  const percentUsed = Math.min(100, Math.round((currentCost / monthlyLimit) * 100));

  const fetchDashboard = () => {
    api.getEmployeeDashboard()
      .then(res => {
        if (res && res.data) setEmployeeDashboard(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(currentToken);
    setCopied(true);
    addToast('API Key copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendTestRequest = async () => {
    setSendingTest(true);
    try {
      const res = await api.sendGatewayProxy({
        apiKey: currentToken,
        provider: 'brevo',
        method: 'POST',
        endpoint: '/v3/smtp/email',
        body: { to: 'vikash.marketing@example.com', message: 'Test live gateway trigger' }
      });
      addToast('Test API Request sent through gateway! Quota updated.', 'success');
      fetchDashboard();
    } catch (err) {
      addToast(err.message || 'Failed to send test request', 'error');
    } finally {
      setSendingTest(false);
    }
  };

  const allowedProviders = employeeDashboard?.allowedProviders || user?.allowedProviders || ['Brevo', 'Twilio', 'Razorpay'];

  return (
    <div className="w-full min-h-screen bg-[#F4F6F9] text-slate-800">
      <Header
        title="Employee Developer Portal"
        subtitle={`Personal API key, assigned monthly budget & gateway quota for ${user?.name || employeeDashboard?.employeeName || 'Vikash Yadav'}`}
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#0B132B] to-[#1E293B] text-white p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center text-lg font-bold">
              {user?.name ? user.name[0] : (employeeDashboard?.employeeName ? employeeDashboard.employeeName[0] : 'V')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white leading-tight">
                  {user?.name || employeeDashboard?.employeeName || 'Vikash Yadav'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {employeeDashboard?.role || user?.roleLabel || 'Growth Engineer'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {teamName} • Corporate Email: <span className="text-slate-300 font-mono">{user?.email || 'vikash.y@abctech.com'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSendTestRequest}
              disabled={sendingTest}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer transition-all active:scale-95"
            >
              <Zap size={14} className={sendingTest ? "animate-spin" : ""} />
              <span>{sendingTest ? "Executing..." : "Send Test Request"}</span>
            </button>
            <Link
              href="/playground"
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow-md shadow-blue-600/20 no-underline transition-all active:scale-95"
            >
              <Terminal size={14} />
              <span>Launch API Playground</span>
            </Link>
          </div>
        </div>

        {/* Top 4 Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Remaining Quota & Monthly Budget */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-500">Remaining Quota / Budget</div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Meter
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {formatCurrency(remainingBudget)}
                <span className="text-xs text-slate-400 font-normal ml-1">remaining</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Spent: <span className="font-semibold text-slate-700">{formatCurrency(currentCost)}</span> of {formatCurrency(monthlyLimit)}
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    percentUsed > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${percentUsed}%` }}
                />
              </div>
              <div className="text-[10px] font-bold text-slate-500 mt-1 flex justify-between">
                <span>{percentUsed}% Quota Utilized</span>
                <span className="text-emerald-600 font-medium">Within Limit</span>
              </div>
            </div>
          </div>

          {/* Card 2: Total Invocations */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500">Total API Requests (Oct)</div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {requestsCount.toLocaleString()}
              </div>
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
              <ArrowUpRight size={13} />
              <span>Real-time Ingested</span>
            </div>
          </div>

          {/* Card 3: Key Status */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500">API Key Status</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 mt-2 truncate">
              Production Gateway Ready
            </div>
          </div>

          {/* Card 4: Allowed APIs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500">Authorized Gateways</div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {allowedProviders.length} Providers
              </div>
            </div>
            <div className="text-[11px] text-blue-600 font-medium mt-2 truncate">
              {allowedProviders.slice(0, 2).join(', ')}...
            </div>
          </div>
        </div>

        {/* Personal API Key & Quickstart Code Snippets */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: API Key Box (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <KeyRound size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">Your Personal API Key</h3>
                  <p className="text-[11px] text-slate-500">Pass this in the Authorization header</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                Live
              </span>
            </div>

            {/* Token display box */}
            <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3 font-mono text-xs shadow-inner">
              <span className="truncate select-all text-emerald-400">{currentToken}</span>
              <button
                onClick={handleCopyKey}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 text-xs font-sans font-medium"
                title="Copy token to clipboard"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-3 bg-blue-50/80 border border-blue-200/80 rounded-xl text-xs text-blue-900 flex flex-col gap-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-blue-600" />
                <span>Security Guidelines</span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed m-0">
                Never commit this key to public Git repositories. Use environment variables (<code className="font-mono bg-blue-100 px-1 rounded">METERFLOW_API_KEY</code>). All usage is tracked against your employee budget.
              </p>
            </div>

            {/* Authorized Providers List */}
            <div className="mt-1">
              <div className="text-xs font-bold text-slate-700 mb-2">Authorized API Providers</div>
              <div className="flex flex-wrap gap-2">
                {allowedProviders.map((provider) => (
                  <span
                    key={provider}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5"
                  >
                    <Server size={12} className="text-slate-500" />
                    <span>{provider}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Code Snippets (7 cols) */}
          <div className="lg:col-span-7 bg-[#0B132B] text-slate-200 p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 size={16} className="text-blue-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Gateway Quickstart</span>
              </div>

              {/* Code Language Tabs */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                {[
                  { id: 'curl', label: 'cURL' },
                  { id: 'node', label: 'Node.js' },
                  { id: 'python', label: 'Python' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCodeTab(tab.id)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-all ${
                      activeCodeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Output */}
            <div className="mt-4 flex-1">
              {activeCodeTab === 'curl' && (
                <pre className="font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto p-3 bg-slate-950/80 rounded-xl border border-slate-800">
{`curl -X POST https://api.meterflow.io/v1/gateway/proxy \\
  -H "Authorization: Bearer ${currentToken}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "provider": "openai",
    "body": {
      "model": "gpt-4o-mini",
      "messages": [{"role": "user", "content": "Calculate quarterly churn"}]
    }
  }'`}
                </pre>
              )}

              {activeCodeTab === 'node' && (
                <pre className="font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto p-3 bg-slate-950/80 rounded-xl border border-slate-800">
{`import fetch from 'node-fetch';

const response = await fetch('https://api.meterflow.io/v1/gateway/proxy', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${currentToken}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    provider: 'openai',
    body: {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Generate report' }]
    }
  })
});

const data = await response.json();
console.log(data);`}
                </pre>
              )}

              {activeCodeTab === 'python' && (
                <pre className="font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto p-3 bg-slate-950/80 rounded-xl border border-slate-800">
{`import requests

url = "https://api.meterflow.io/v1/gateway/proxy"
headers = {
    "Authorization": "Bearer ${currentToken}",
    "Content-Type": "application/json"
}
payload = {
    "provider": "openai",
    "body": {
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": "Analyze telemetry"}]
    }
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`}
                </pre>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
              <span>Edge proxy automatically logs token telemetry & checks budget before forwarding.</span>
              <Link href="/docs" className="text-blue-400 hover:text-blue-300 font-semibold no-underline">
                View Full Docs →
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Invocations Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">My Recent API Requests</h3>
              <p className="text-xs text-slate-500 mt-0.5">Live telemetry authenticated under your personal token</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
              Live Stream Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Provider / API</th>
                  <th className="py-3 px-4">Endpoint</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Cost (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {[
                  { time: '10:24 AM', api: 'OpenAI (GPT-4o)', endpoint: '/v1/chat/completions', status: 200, cost: '₹0.18' },
                  { time: '10:22 AM', api: 'Internal API', endpoint: '/v1/orders', status: 200, cost: '₹0.00' },
                  { time: '10:21 AM', api: 'Brevo', endpoint: '/v3/smtp/email', status: 200, cost: '₹0.04' },
                  { time: '10:18 AM', api: 'Google Gemini', endpoint: '/v1/models/gemini-1.5:generate', status: 200, cost: '₹0.12' },
                  { time: '10:15 AM', api: 'OpenAI', endpoint: '/v1/embeddings', status: 200, cost: '₹0.02' }
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{row.time}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{row.api}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{row.endpoint}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                        {row.status} OK
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">{row.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
