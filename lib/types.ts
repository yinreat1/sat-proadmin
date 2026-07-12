export type LicenseStatus = 'unused' | 'active' | 'revoked' | 'expired';

/** Row shape as stored (and returned) by the Cloudflare Worker / D1 database. */
export interface License {
  id: string;
  license_key: string;
  hardware_id: string | null;
  status: LicenseStatus;
  created_at: number;
  activated_at: number | null;
  last_check: number | null;
  expires_at: number | null;
  notes: string;
}
