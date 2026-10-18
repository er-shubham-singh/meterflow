'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { 
  BookOpen, 
  Search, 
  Copy, 
  Check, 
  Terminal, 
  Key, 
  ShieldCheck, 
  Zap, 
  Code2, 
  Server,
  Layers
} from 'lucide-react';

const DOC_NAV = [
  {
    category: 'Introduction',
    items: ['Quick Start', 'Authentication', 'API Keys', 'Rate Limits']
  },
  {
    category: 'Providers',
    items: ['OpenAI API', 'Google Gemini', 'Brevo (Email)', 'Twilio (SMS)', 'Razorpay', 'Internal APIs']
  },
  {
    category: 'Guides',
    items: ['Usage Examples', 'Error Handling', 'SDKs & Libraries', 'Webhooks']
  }
];

const CODE_EXAMPLES = {
  cURL: `curl -X POST "https://api.meterflow.com/v1/openai/chat" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "user", "content": "Explain machine learning"}
    ],
    "max_tokens": 500
  }'`,

  JavaScript: `import { MeterFlow } from '@meterflow/sdk';

const client = new MeterFlow({
  apiKey: process.env.METERFLOW_API_KEY
});

const response = await client.openai.chat.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'Explain machine learning' }],
  max_tokens: 500
});

console.log(response.choices[0].message.content);
console.log('Metered Tokens:', response.usage.total_tokens);`,

  Python: `from meterflow import MeterFlow

client = MeterFlow(api_key="YOUR_API_KEY")

response = client.openai.chat.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Explain machine learning"}],
    max_tokens=500
)

print(response.choices[0].message.content)
print("Billable Cost (INR):", response.meterflow_meta.cost_inr)`,

  PHP: `<?php
$ch = curl_init("https://api.meterflow.com/v1/openai/chat");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer YOUR_API_KEY",
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    "model" => "gpt-4o-mini",
    "messages" => [["role" => "user", "content" => "Explain machine learning"]]
]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$res = curl_exec($ch);
curl_close($ch);
?>`,

  'Node.js': `const fetch = require('node-fetch');

async function sendChat() {
  const res = await fetch('https://api.meterflow.com/v1/openai/chat', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.METERFLOW_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Explain machine learning' }]
    })
  });
  const data = await res.json();
  console.log(data);
}
sendChat();`
};

export default function DocsPage() {
  const [selectedTopic, setSelectedTopic] = useState('Quick Start');
  const [selectedLang, setSelectedLang] = useState('cURL');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedRes, setCopiedRes] = useState(false);

  const sampleResponse = {
    id: "chatcmpl-123",
    object: "chat.completion",
    created: 1792329100,
    model: "gpt-4o-mini",
    usage: {
      prompt_tokens: 12,
      completion_tokens: 45,
      total_tokens: 57
    },
    choices: [
      {
        message: {
          role: "assistant",
          content: "Machine learning is a subset of artificial intelligence where algorithms learn patterns from data to make predictions or decisions without explicit programming."
        },
        finish_reason: "stop"
      }
    ],
    meterflow_meta: {
      provider: "OpenAI",
      cost_inr: "₹0.057",
      ledger_status: "RECONCILED",
      latency: "1.4ms"
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(CODE_EXAMPLES[selectedLang]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyRes = () => {
    navigator.clipboard.writeText(JSON.stringify(sampleResponse, null, 2));
    setCopiedRes(true);
    setTimeout(() => setCopiedRes(false), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-[#F4F6F9] text-slate-800">
      <Header
        title="API Documentation"
        subtitle="Developer onboarding, authentication & proxy routing guide"
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Category Sidebar (Matching Panel 4) */}
          <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm sticky top-[84px]">
            {/* Search Docs */}
            <div className="relative mb-5">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search docs..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500 placeholder:text-slate-400"
              />
            </div>

            {/* Navigation Sections */}
            <div className="flex flex-col gap-5">
              {DOC_NAV.map((sec, idx) => (
                <div key={idx}>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                    {sec.category}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {sec.items.map((item) => (
                      <button
                        key={item}
                        onClick={() => setSelectedTopic(item)}
                        className={`text-left text-xs font-semibold py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer ${
                          selectedTopic === item
                            ? 'bg-blue-50 text-blue-600 font-bold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Area (Matching Panel 4) */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            {/* Quick Start Title & Description */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 mb-1">
                {selectedTopic}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Start making API requests using your MeterFlow API key. MeterFlow automatically authenticates your organization, verifies rate limits, extracts token metrics, and calculates costs in Indian Rupees (₹).
              </p>
            </div>

            {/* Code Snippet Box with Multi-Language Tabs */}
            <div className="bg-[#0B132B] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
              {/* Language Tabs & Copy Button */}
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex-wrap gap-2">
                <div className="flex items-center gap-1">
                  {Object.keys(CODE_EXAMPLES).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLang(lang)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        selectedLang === lang
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-semibold py-1 px-2.5 rounded bg-slate-800/60 hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  {copiedCode ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Code Editor Content */}
              <div className="p-5 font-mono text-xs leading-relaxed text-slate-200 overflow-x-auto">
                <pre>{CODE_EXAMPLES[selectedLang]}</pre>
              </div>
            </div>

            {/* Realistic Response Box */}
            <div className="bg-[#0B132B] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300">Response</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    200 OK
                  </span>
                </div>

                <button
                  onClick={handleCopyRes}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-semibold py-1 px-2.5 rounded bg-slate-800/60 hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  {copiedRes ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copiedRes ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-5 font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto">
                <pre>{JSON.stringify(sampleResponse, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
