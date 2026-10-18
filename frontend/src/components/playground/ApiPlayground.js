'use client';

import { useState } from 'react';
import { api } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { Send, Copy, Check, Terminal, Plus, Trash2, Zap, Clock, ShieldAlert } from 'lucide-react';

const API_TEMPLATES = {
  OpenAI: {
    method: 'POST',
    endpoint: '/v1/chat/completions',
    headers: [
      { key: 'Authorization', value: 'Bearer sk_mf_1234abcd5678efgh' },
      { key: 'Content-Type', value: 'application/json' }
    ],
    body: {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: 'Explain machine learning' }
      ],
      max_tokens: 500
    }
  },
  'Google Gemini': {
    method: 'POST',
    endpoint: '/v1/models/gemini-pro:generateContent',
    headers: [
      { key: 'Authorization', value: 'Bearer sk_mf_1234abcd5678efgh' },
      { key: 'Content-Type', value: 'application/json' }
    ],
    body: {
      contents: [
        { parts: [{ text: 'Summarize quantum computing principles' }] }
      ]
    }
  },
  'Brevo (Email)': {
    method: 'POST',
    endpoint: '/v3/smtp/email',
    headers: [
      { key: 'Authorization', value: 'Bearer sk_mf_1234abcd5678efgh' },
      { key: 'Content-Type', value: 'application/json' }
    ],
    body: {
      sender: { name: 'MeterFlow Ops', email: 'ops@meterflow.co.in' },
      to: [{ email: 'client@abctech.com', name: 'ABC Technologies' }],
      subject: 'Daily Ingestion Ledger Summary',
      htmlContent: '<p>Your consumption for today has been logged.</p>'
    }
  },
  Twilio: {
    method: 'POST',
    endpoint: '/2010-04-01/Accounts/AC12345/Messages.json',
    headers: [
      { key: 'Authorization', value: 'Bearer sk_mf_1234abcd5678efgh' },
      { key: 'Content-Type', value: 'application/json' }
    ],
    body: {
      To: '+919876543210',
      From: '+12025550199',
      Body: 'MeterFlow OTP: 948212. Valid for 10 minutes.'
    }
  },
  Razorpay: {
    method: 'POST',
    endpoint: '/v1/orders',
    headers: [
      { key: 'Authorization', value: 'Bearer sk_mf_1234abcd5678efgh' },
      { key: 'Content-Type', value: 'application/json' }
    ],
    body: {
      amount: 50000,
      currency: 'INR',
      receipt: 'rcpt_meterflow_01',
      notes: { customer: 'ABC Technologies' }
    }
  },
  'Internal Orders API': {
    method: 'GET',
    endpoint: '/v1/internal/orders?status=active',
    headers: [
      { key: 'Authorization', value: 'Bearer sk_mf_1234abcd5678efgh' },
      { key: 'Content-Type', value: 'application/json' }
    ],
    body: {}
  }
};

export default function ApiPlayground() {
  const [selectedApi, setSelectedApi] = useState('OpenAI');
  const [method, setMethod] = useState('POST');
  const [endpoint, setEndpoint] = useState('/v1/chat/completions');
  const [activeTab, setActiveTab] = useState('Headers'); // 'Headers' | 'Body'
  const [headers, setHeaders] = useState([
    { key: 'Authorization', value: 'Bearer sk_mf_1234abcd5678efgh' },
    { key: 'Content-Type', value: 'application/json' }
  ]);
  const [bodyText, setBodyText] = useState(JSON.stringify(API_TEMPLATES.OpenAI.body, null, 2));
  const [response, setResponse] = useState({
    id: 'chatcmpl-123',
    object: 'chat.completion',
    usage: {
      prompt_tokens: 12,
      completion_tokens: 45,
      total_tokens: 57
    },
    choices: [
      {
        message: {
          role: 'assistant',
          content: 'Machine learning is a subset of artificial intelligence where algorithms learn patterns from data.'
        }
      }
    ],
    meterflow_meta: {
      provider: 'OpenAI',
      cost_inr: '₹0.057',
      latency: '1.4ms'
    }
  });
  const [status, setStatus] = useState(200);
  const [latency, setLatency] = useState(1.4);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleApiSelect = (apiName) => {
    setSelectedApi(apiName);
    const tmpl = API_TEMPLATES[apiName] || API_TEMPLATES.OpenAI;
    setMethod(tmpl.method);
    setEndpoint(tmpl.endpoint);
    setHeaders([...tmpl.headers]);
    setBodyText(JSON.stringify(tmpl.body, null, 2));
    showToast(`Loaded ${apiName} template`, 'info', 2000);
  };

  const handleAddHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const handleHeaderChange = (index, field, val) => {
    const updated = [...headers];
    updated[index][field] = val;
    setHeaders(updated);
  };

  const handleRemoveHeader = (index) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    setLoading(true);
    const startTime = performance.now();
    try {
      let parsedBody = {};
      try {
        parsedBody = JSON.parse(bodyText);
      } catch {
        parsedBody = { raw: bodyText };
      }

      const authHeaderObj = headers.find(h => h.key.toLowerCase() === 'authorization');
      const apiKey = authHeaderObj ? authHeaderObj.value.replace(/^Bearer\s+/i, '') : 'sk_mf_1234abcd';

      const providerMap = {
        OpenAI: 'openai',
        'Google Gemini': 'gemini',
        'Brevo (Email)': 'brevo',
        Twilio: 'twilio',
        Razorpay: 'razorpay',
        'Internal Orders API': 'internal'
      };

      const res = await api.sendGatewayProxy({
        apiKey,
        provider: providerMap[selectedApi] || 'openai',
        method,
        endpoint,
        headers: headers.reduce((acc, h) => { if (h.key) acc[h.key] = h.value; return acc; }, {}),
        body: parsedBody
      });

      const execLatency = (performance.now() - startTime).toFixed(1);
      setLatency(execLatency);
      setStatus(200);
      setResponse(res);
      showToast(`200 OK — Ingestion recorded (${execLatency}ms)`, 'success');
    } catch (err) {
      setStatus(429);
      setResponse({
        error: {
          message: err.message || 'Gateway Proxy Execution Failed',
          type: 'execution_error'
        }
      });
      showToast(err.message || 'Gateway Proxy Execution Failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    setCopied(true);
    showToast('Copied JSON payload to clipboard', 'info', 2000);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <Terminal size={22} className="text-blue-600" />
          <span>API Playground</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Test your APIs directly from the browser. Proxy requests securely, monitor live tokens, and verify rate limits in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Request Configuration Form (Matching Panel 6) */}
        <div className="flex flex-col gap-4 bg-slate-50/70 p-5 rounded-xl border border-slate-200/70">
          {/* Row 1: Select API & Method Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Select API
              </label>
              <select
                value={selectedApi}
                onChange={(e) => handleApiSelect(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 transition-colors shadow-sm cursor-pointer"
              >
                {Object.keys(API_TEMPLATES).map((key) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-blue-600 outline-none focus:border-blue-500 transition-colors shadow-sm cursor-pointer"
              >
                <option value="POST">POST</option>
                <option value="GET">GET</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
          </div>

          {/* Row 2: Endpoint input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Endpoint
            </label>
            <input
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="/v1/chat/completions"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-medium text-slate-900 outline-none focus:border-blue-500 transition-colors shadow-sm"
            />
          </div>

          {/* Row 3: Tabs (Headers / Body) */}
          <div className="flex border-b border-slate-200 mt-2">
            <button
              onClick={() => setActiveTab('Headers')}
              className={`py-2 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'Headers'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Headers ({headers.length})
            </button>
            <button
              onClick={() => setActiveTab('Body')}
              className={`py-2 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'Body'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Body
            </button>
          </div>

          {/* Tab Content: Headers */}
          {activeTab === 'Headers' && (
            <div className="flex flex-col gap-2 min-h-[180px]">
              <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 uppercase px-1">
                <span className="col-span-5">Key</span>
                <span className="col-span-6">Value</span>
                <span className="col-span-1 text-center"></span>
              </div>

              {headers.map((h, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    value={h.key}
                    onChange={(e) => handleHeaderChange(i, 'key', e.target.value)}
                    placeholder="Header Key"
                    className="col-span-5 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono text-slate-800 outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={h.value}
                    onChange={(e) => handleHeaderChange(i, 'value', e.target.value)}
                    placeholder="Header Value"
                    className="col-span-6 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono text-slate-800 outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => handleRemoveHeader(i)}
                    className="col-span-1 text-slate-400 hover:text-rose-500 flex justify-center cursor-pointer"
                    title="Remove Header"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}

              <button
                onClick={handleAddHeader}
                className="mt-1 flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer self-start"
              >
                <Plus size={13} />
                <span>Add Header</span>
              </button>
            </div>
          )}

          {/* Tab Content: Body */}
          {activeTab === 'Body' && (
            <div className="flex flex-col min-h-[180px]">
              <textarea
                rows={9}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs font-mono text-slate-900 outline-none focus:border-blue-500 leading-relaxed resize-y shadow-inner"
              />
            </div>
          )}

          {/* Primary Action Button */}
          <button
            onClick={handleSend}
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50 mt-2"
          >
            <Send size={15} />
            <span>{loading ? 'Proxying Request...' : 'Send Request'}</span>
          </button>
        </div>

        {/* Right Column: Response Console (Matching Panel 6) */}
        <div className="flex flex-col bg-[#0B132B] rounded-xl border border-slate-800 shadow-xl overflow-hidden min-h-[430px]">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">Response</span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Clock size={11} /> {latency}ms
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono tracking-wide ${
                status === 200
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {status === 200 ? '200 OK' : `${status} ERROR`}
              </span>

              <button
                onClick={handleCopyResponse}
                className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] p-1 rounded transition-colors cursor-pointer"
                title="Copy JSON response"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* JSON Body Display with syntax styling and horizontal touch scroll */}
          <div className="p-4 flex-1 overflow-x-auto overflow-y-auto max-w-full font-mono text-xs text-emerald-400 leading-relaxed bg-[#0B132B] min-h-[280px]">
            <pre className="whitespace-pre-wrap break-all sm:break-normal font-mono max-w-full select-all">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>

          {/* Bottom Telemetry Notification */}
          <div className="px-4 py-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
            <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
              <Zap size={12} className="shrink-0" />
              <span>Live Gateway Ingestion Recorded</span>
            </span>
            <span className="font-mono text-[10px] text-slate-500">Auth: Bearer sk_mf_...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
