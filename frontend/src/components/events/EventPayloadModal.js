'use client';

import { X, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function EventPayloadModal({ event, onClose }) {
  const [copied, setCopied] = useState(false);
  if (!event) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(event, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-panel w-full max-w-2xl max-h-[80vh] overflow-y-auto flex flex-col bg-[var(--bg-secondary)] border border-[var(--border-medium)] rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[var(--text-heading)]">API Ingestion Payload</h3>
            <span className="text-[11px] text-[var(--text-subtle)] font-mono">
              {event.id}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] text-[var(--text-main)] px-3 py-1.5 rounded-lg text-xs cursor-pointer flex items-center gap-1.5 transition-all shadow-sm"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="bg-transparent border-0 text-[var(--text-muted)] hover:text-[var(--text-heading)] cursor-pointer p-1 rounded-md transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <pre className="bg-[var(--bg-code)] p-4 rounded-xl border border-[var(--border-subtle)] text-xs text-emerald-400 overflow-x-auto max-h-[400px] font-mono leading-relaxed">
          {JSON.stringify(event, null, 2)}
        </pre>
      </div>
    </div>
  );
}
