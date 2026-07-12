'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminSession } from '@/contexts/AdminSessionContext';

export default function Home() {
  const { secret, loading } = useAdminSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.replace(secret ? '/lisanslar' : '/giris');
    }
  }, [secret, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
