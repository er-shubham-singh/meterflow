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
    <div className="glass-panel" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={18} color="#10b981" />
            API Event Listener Playground
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Test raw event ingestion directly via REST into the high-throughput listener pipeline.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {Object.keys(SAMPLE_PAYLOADS).map((k) => (
            <button
              key={k}
              onClick={() => handleTemplateChange(k)}
              style={{
                background: selectedTemplate === k ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border: selectedTemplate === k ? '1px solid #10b981' : '1px solid var(--border-subtle)',
                color: selectedTemplate === k ? '#34d399' : '#cbd5e1',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {k.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* JSON Editor */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
              Request Body (POST /api/v1/events):
            </span>
            <button
              onClick={copyCurl}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-subtle)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px'
              }}
            >
              {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
              <span>{copied ? 'Copied cURL' : 'Copy cURL'}</span>
            </button>
          </div>

          <textarea
            rows={12}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            style={{
              width: '100%',
              background: '#070a10',
              color: '#34d399',
              fontSize: '12px',
              lineHeight: '1.5',
              padding: '14px',
              borderRadius: '8px',
              fontFamily: 'var(--font-mono)'
            }}
          />

          <button
            disabled={loading}
            onClick={handleSend}
            style={{
              width: '100%',
              marginTop: '12px',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: '#10b981',
              color: '#022c22',
              fontWeight: '700',
              fontSize: '13px',
              cursor: loading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Send size={14} />
            <span>{loading ? 'Dispatching...' : 'Dispatch API Event (POST)'}</span>
          </button>
        </div>

        {/* Live Response Panel */}
        <div>
          <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px' }}>
            Listener Response / Ingestion Latency:
          </span>

          <pre style={{
            height: 'calc(100% - 60px)',
            minHeight: '260px',
            background: '#070a10',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            padding: '16px',
            color: response?.status === 'error' ? '#fb7185' : '#818cf8',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            overflowY: 'auto'
          }}>
            {response ? JSON.stringify(response, null, 2) : '// Ready. Press "Dispatch API Event" to send telemetry into the pipeline.'}
          </pre>
        </div>
      </div>
    </div>
  );
}
