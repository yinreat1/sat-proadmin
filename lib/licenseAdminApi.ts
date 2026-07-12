import { License } from './types';

// Same Cloudflare Worker used by the desktop app. Admin endpoints require
// the `Authorization: Bearer <ADMIN_SECRET>` header, checked against the
// worker's ADMIN_SECRET (set via `wrangler secret put ADMIN_SECRET`).
export const LICENSE_API =
  process.env.NEXT_PUBLIC_LICENSE_API || 'https://autumn-dust-ac49.balamanyunus90.workers.dev';

export class UnauthorizedError extends Error {
  constructor() {
    super('unauthorized');
    this.name = 'UnauthorizedError';
  }
}

async function request<T>(path: string, secret: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${LICENSE_API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secret}`,
      ...options.headers,
    },
  });

  if (res.status === 401) throw new UnauthorizedError();

  let data: any;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Sunucudan geçersiz yanıt alındı (HTTP ${res.status}).`);
  }

  if (!res.ok && !data?.success && data?.error) {
    throw new Error(data.error === 'not-found' ? 'Lisans bulunamadı.' : data.error);
  }

  return data as T;
}

export const licenseAdminApi = {
  /** Verifies the secret is valid by making a harmless authenticated call. */
  async verifySecret(secret: string): Promise<boolean> {
    try {
      await request('/license-info', secret);
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedError) return false;
      throw err;
    }
  },

  async list(secret: string): Promise<License[]> {
    const data = await request<{ licenses: License[] }>('/license-info', secret);
    return data.licenses;
  },

  async search(secret: string, query: string): Promise<License[]> {
    const data = await request<{ licenses: License[] }>(
      `/license-info?search=${encodeURIComponent(query)}`,
      secret
    );
    return data.licenses;
  },

  async create(secret: string, expiresAt: number | null, notes: string): Promise<string> {
    const data = await request<{ success: true; licenseKey: string }>('/create-license', secret, {
      method: 'POST',
      body: JSON.stringify({ expiresAt, notes }),
    });
    return data.licenseKey;
  },

  async deactivate(secret: string, licenseKey: string): Promise<void> {
    await request('/deactivate', secret, { method: 'POST', body: JSON.stringify({ licenseKey }) });
  },

  async reset(secret: string, licenseKey: string): Promise<void> {
    await request('/reset', secret, { method: 'POST', body: JSON.stringify({ licenseKey }) });
  },

  async extend(secret: string, licenseKey: string, additionalDays: number): Promise<number> {
    const data = await request<{ success: true; expiresAt: number }>('/extend', secret, {
      method: 'POST',
      body: JSON.stringify({ licenseKey, additionalDays }),
    });
    return data.expiresAt;
  },

  async remove(secret: string, licenseKey: string): Promise<void> {
    await request('/delete-license', secret, { method: 'POST', body: JSON.stringify({ licenseKey }) });
  },
};
