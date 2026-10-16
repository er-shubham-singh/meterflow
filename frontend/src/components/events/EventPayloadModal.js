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
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '16px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '640px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-medium)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-heading)' }}>API Ingestion Payload</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>
              {event.id}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleCopy}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close modal"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <pre style={{
          background: 'var(--bg-code)',
          padding: '16px',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)',
          fontSize: '12px',
          color: 'var(--emerald-400)',
          overflowX: 'auto',
          maxHeight: '400px'
        }}>
          {JSON.stringify(event, null, 2)}
        </pre>
      </div>
    </div>
  );
}
