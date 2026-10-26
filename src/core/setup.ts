/**
 * First-run setup rules. Pure logic: no React, no storage, no DOM.
 */
export type Result<T> = { success: true; data: T; error: null } | { success: false; data: null; error: string };
const ok = <T,>(data: T): Result<T> => ({ success: true, data, error: null });
const fail = <T,>(error: string): Result<T> => ({ success: false, data: null, error });

export interface AccessSettings {
  setupComplete?: boolean;
  pinEnabled?: boolean;
  pinHash?: string;
  pinSalt?: string;
}

/** PIN used by installs created before setup existed. */
export const LEGACY_PIN = '5555';

export type SetupStep = 'backend' | 'access' | 'workspace' | 'done';

/** Setup is needed only for a brand-new install: not marked done and no projects yet. */
export function needsSetup(s: AccessSettings, projectCount: number): boolean {
  return !s.setupComplete && projectCount === 0;
}

/** Steps to show. Backend is skipped when the host or the build already fixed it. */
export function setupSteps(backendLocked: boolean): SetupStep[] {
  return backendLocked ? ['access', 'workspace', 'done'] : ['backend', 'access', 'workspace', 'done'];
}

export function validatePin(pin: string): Result<string> {
  return /^\d{4,8}$/.test(pin) ? ok(pin) : fail('PIN must be 4–8 digits');
}

export function validateWorkspaceName(name: string): Result<string> {
  const n = name.trim();
  if (!n) return fail('Name is required');
  if (n.length > 60) return fail('Name is too long');
  return ok(n);
}

export function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'workspace';
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPin(pin: string, salt = crypto.randomUUID()): Promise<{ pinHash: string; pinSalt: string }> {
  return { pinHash: await sha256(`${salt}:${pin}`), pinSalt: salt };
}

/** Whether a PIN screen should be shown at all. Legacy installs keep the old PIN. */
export function pinRequired(s: AccessSettings): boolean {
  return s.pinEnabled !== false;
}

export async function verifyPin(pin: string, s: AccessSettings): Promise<boolean> {
  if (!s.pinHash || !s.pinSalt) return pin === LEGACY_PIN;
  return (await hashPin(pin, s.pinSalt)).pinHash === s.pinHash;
}
