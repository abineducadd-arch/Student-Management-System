import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, ExternalLink, Key, Copy, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { updateSupabaseCredentials, isSupabaseConfigured } from '@/lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState(localStorage.getItem('aurelia_supabase_url') || '');
  const [key, setKey] = useState(localStorage.getItem('aurelia_supabase_key') || '');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copied, setCopied] = useState(false);

  const isConnected = isSupabaseConfigured();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const success = updateSupabaseCredentials(url.trim(), key.trim());
    if (success) {
      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
      }, 1000);
    } else {
      setStatus('error');
    }
  };

  const handleDisconnect = () => {
    updateSupabaseCredentials('', '');
    setUrl('');
    setKey('');
    setStatus('idle');
  };

  const schemaPath = 'supabase/schema.sql';
  const handleCopySchemaPath = () => {
    navigator.clipboard.writeText(schemaPath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Supabase Database Configuration"
      subtitle="Connect your PostgreSQL Supabase cloud instance or utilize the embedded high-performance local store."
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Status card */}
        <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
          isConnected
            ? 'bg-[#EBF2DE] border-[#CFDCBA] text-[#263329]'
            : 'bg-[#F7EEDF] border-[#E9D3B5] text-[#785429]'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isConnected ? 'bg-[#3E5C38] text-[#FBF9F4]' : 'bg-[#785429] text-[#FBF9F4]'}`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">
                {isConnected ? 'Supabase Connected & Active' : 'Operating on Persistent Local Engine'}
              </h4>
              <p className="text-xs opacity-90">
                {isConnected
                  ? 'All changes are synced live with your cloud PostgreSQL tables.'
                  : 'Full CRUD operations, student dossier records, attendance & analytics work offline with full persistence.'}
              </p>
            </div>
          </div>
          {isConnected && (
            <button
              onClick={handleDisconnect}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#CFDCBA] bg-surface hover:bg-black/5 transition-colors"
            >
              Disconnect
            </button>
          )}
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Supabase Project URL
            </label>
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://xyzproject.supabase.co"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-[#FBF9F4] text-ink placeholder:text-ink-muted/50 text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Supabase Anon Key / Public Key
            </label>
            <div className="relative">
              <input
                type="password"
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-[#FBF9F4] text-ink placeholder:text-ink-muted/50 text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none transition-all font-mono text-xs"
              />
              <Key className="w-4 h-4 text-ink-muted absolute right-3 top-3 pointer-events-none" />
            </div>
            <p className="text-[11px] text-ink-muted mt-1.5">
              Never enter your service-role key. Only supply your public anon key.
            </p>
          </div>

          {status === 'success' && (
            <div className="flex items-center gap-2 text-xs text-botanical-green font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Supabase credentials saved and verified!</span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-2 text-xs text-botanical-terracotta font-medium">
              <AlertCircle className="w-4 h-4" />
              <span>Failed to validate Supabase URL and key. Please check the credentials.</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-ink hover:bg-black/5 transition-colors border border-border"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-forest px-5 py-2 rounded-xl text-sm font-medium shadow-warm-sm"
            >
              Save Credentials
            </button>
          </div>
        </form>

        {/* Database setup help */}
        <div className="p-4 rounded-xl bg-porcelain/60 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-forest">Database Migration Script</span>
            <button
              onClick={handleCopySchemaPath}
              className="text-xs text-ink-muted hover:text-forest flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-botanical-green" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied path!' : 'Copy schema.sql path'}</span>
            </button>
          </div>
          <p className="text-xs text-ink-muted">
            The project includes a production-ready PostgreSQL migration script at <code className="px-1.5 py-0.5 rounded bg-surface border border-border font-mono text-[11px]">supabase/schema.sql</code> and <code className="px-1.5 py-0.5 rounded bg-surface border border-border font-mono text-[11px]">supabase/seed.sql</code>. Run this in your Supabase SQL editor to create all 20 tables with indexes and Row-Level Security policies.
          </p>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-forest hover:underline font-medium"
          >
            <span>Open Supabase Cloud Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </Modal>
  );
};

