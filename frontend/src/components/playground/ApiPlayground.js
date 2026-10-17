'use client';

import { useState } from 'react';
import { api, API_BASE } from '@/services/api';
import { Send, Copy, Check, Terminal, Sparkles } from 'lucide-react';

const SAMPLE_PAYLOADS = {
  ai_completion: {
    customerId: 'cust_anthropic_res',
    eventType: 'ai.completion',
    properties: {
      model: 'claude-3-5-sonnet',
      promptTokens: 1420,
      completionTokens: 680,
      tokens: 2100,
      latencyMs: 340
    }
  },
  api_request: {
    customerId: 'cust_acme_corp',
    eventType: 'api.request',
    properties: {
      endpoint: '/v1/inference',
      statusCode: 200,
      region: 'us-east-1',
      units: 1
    }
  },
  cloud_compute: {
    customerId: 'cust_scale_ai',
    eventType: 'cloud.compute',
    properties: {
      instanceType: 'gpu.a100.80gb',
      vCpuHours: 2.5,
      memoryGbHours: 16.0
    }
  }
};

export default function ApiPlayground({ onEventIngested }) {
  const [selectedTemplate, setSelectedTemplate] = useState('ai_completion');
  const [jsonText, setJsonText] = useState(JSON.stringify(SAMPLE_PAYLOADS.ai_completion, null, 2));
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTemplateChange = (key) => {
    setSelectedTemplate(key);
    setJsonText(JSON.stringify(SAMPLE_PAYLOADS[key], null, 2));
  };

  const handleSend = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const parsed = JSON.parse(jsonText);
      const res = await api.ingestEvent(parsed);
      setResponse({ status: 'success', data: res });
      if (onEventIngested) onEventIngested();
    } catch (err) {
      setResponse({ status: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const curlCommand = `curl -X POST ${API_BASE}/events \\
  -H "Content-Type: application/json" \\
  -d '${jsonText.replace(/\n/g, '').replace(/\s+/g, ' ')}'`;

  const copyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel w-full p-6 sm:p-7 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-heading)] flex items-center gap-2">
            <Terminal size={18} className="text-emerald-400" />
            <span>API Event Listener Playground</span>
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Test raw event ingestion directly via REST into the high-throughput listener pipeline.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {Object.keys(SAMPLE_PAYLOADS).map((k) => (
            <button
              key={k}
              onClick={() => handleTemplateChange(k)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                selectedTemplate === k
                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold shadow-sm'
                  : 'bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:border-[var(--border-medium)]'
              }`}
            >
              {k.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* JSON Editor */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-[var(--text-muted)] font-semibold">
              Request Body (POST /api/v1/events):
            </span>
            <button
              onClick={copyCurl}
              className="bg-transparent border-0 text-[var(--text-subtle)] hover:text-[var(--text-heading)] cursor-pointer flex items-center gap-1 text-xs transition-colors"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copied ? 'Copied cURL' : 'Copy cURL'}</span>
            </button>
          </div>

          <textarea
            rows={12}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="w-full bg-[var(--bg-code)] border border-[var(--border-subtle)] focus:border-emerald-500 text-emerald-400 text-xs leading-relaxed p-3.5 rounded-xl font-mono outline-none resize-y"
          />

          <button
            disabled={loading}
            onClick={handleSend}
            className="w-full mt-3 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-lg cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all disabled:opacity-70 disabled:cursor-wait"
          >
            <Send size={14} />
            <span>{loading ? 'Dispatching...' : 'Dispatch API Event (POST)'}</span>
          </button>
        </div>

        {/* Live Response Panel */}
        <div className="flex flex-col">
          <span className="block text-xs text-[var(--text-muted)] font-semibold mb-2">
            Listener Response / Ingestion Latency:
          </span>

          <pre className={`flex-1 min-h-[260px] max-w-full bg-[var(--bg-code)] border border-[var(--border-subtle)] rounded-xl p-4 text-xs font-mono overflow-auto leading-relaxed ${
            response?.status === 'error' ? 'text-rose-400' : 'text-indigo-400'
          }`}>
            {response ? JSON.stringify(response, null, 2) : '// Ready. Press "Dispatch API Event" to send telemetry into the pipeline.'}
          </pre>
        </div>
      </div>
    </div>
  );
}
