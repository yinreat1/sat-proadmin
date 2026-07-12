'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminSession } from '@/contexts/AdminSessionContext';
import { ShieldCheck, KeyRound, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function GirisPage() {
  const { login } = useAdminSession();
  const router = useRouter();
  const [secret, setSecretValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!secret.trim()) {
      toast.error('Yönetici anahtarı gereklidir');
      return;
    }
    setLoading(true);
    try {
      const ok = await login(secret.trim());
      if (ok) {
        router.replace('/lisanslar');
      } else {
        toast.error('Yönetici anahtarı hatalı');
      }
    } catch (err: any) {
      toast.error('Bağlantı hatası: ' + (err?.message || 'sunucuya ulaşılamadı'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-950 p-4">
      <div className="bg-card rounded-3xl shadow-2xl w-full max-w-sm p-8 border border-border">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/25">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold">SatisPro Yönetim</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Devam etmek için yönetici anahtarınızı girin
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Yönetici Anahtarı</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecretValue(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Bu, Cloudflare Worker'da <code className="font-mono">ADMIN_SECRET</code> olarak ayarladığınız değerdir.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-blue-600/25 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Giriş Yap
          </button>
        </div>
      </div>
    </div>
  );
}
