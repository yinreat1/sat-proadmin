import type { Metadata } from 'next';
import './globals.css';
import { AdminSessionProvider } from '@/contexts/AdminSessionContext';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'SatisPro Yönetim',
  description: 'Lisans yönetim paneli',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <AdminSessionProvider>
          {children}
          <Toaster richColors position="top-right" />
        </AdminSessionProvider>
      </body>
    </html>
  );
}
