'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { licenseAdminApi } from '@/lib/licenseAdminApi';

const STORAGE_KEY = 'satispro_admin_secret';

interface AdminSessionContextType {
  secret: string | null;
  loading: boolean;
  login: (secret: string) => Promise<boolean>;
  logout: () => void;
}

const AdminSessionContext = createContext<AdminSessionContextType>({} as AdminSessionContextType);

export function AdminSessionProvider({ children }: { children: React.ReactNode }) {
  const [secret, setSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      // Re-validate on load in case the secret was rotated/revoked server-side.
      licenseAdminApi
        .verifySecret(stored)
        .then((ok) => setSecret(ok ? stored : null))
        .catch(() => setSecret(stored)) // network hiccup — don't force a logout
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (candidate: string): Promise<boolean> => {
    const ok = await licenseAdminApi.verifySecret(candidate);
    if (ok) {
      sessionStorage.setItem(STORAGE_KEY, candidate);
      setSecret(candidate);
    }
    return ok;
  };

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setSecret(null);
  };

  return (
    <AdminSessionContext.Provider value={{ secret, loading, login, logout }}>
      {children}
    </AdminSessionContext.Provider>
  );
}

export const useAdminSession = () => useContext(AdminSessionContext);
