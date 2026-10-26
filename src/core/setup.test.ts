import { describe, it, expect } from 'vitest';
import { needsSetup, setupSteps, validatePin, hashPin, verifyPin, pinRequired } from './setup';

describe('setup rules', () => {
  it('needs setup only for a new install', () => {
    expect(needsSetup({}, 0)).toBe(true);
    expect(needsSetup({}, 1)).toBe(false); // existing install
    expect(needsSetup({ setupComplete: true }, 0)).toBe(false);
  });

  it('skips the backend step when the backend is fixed', () => {
    expect(setupSteps(true)).toEqual(['access', 'workspace', 'done']);
    expect(setupSteps(false)[0]).toBe('backend');
  });

  it('accepts 4–8 digit PINs only', () => {
    expect(validatePin('123').success).toBe(false);
    expect(validatePin('1234').success).toBe(true);
    expect(validatePin('12a4').success).toBe(false);
  });

  it('verifies a hashed PIN and rejects a wrong one', async () => {
    const h = await hashPin('2468');
    expect(await verifyPin('2468', h)).toBe(true);
    expect(await verifyPin('5555', h)).toBe(false);
  });

  it('existing installs keep PIN 5555', async () => {
    expect(await verifyPin('5555', {})).toBe(true);
    expect(pinRequired({})).toBe(true);
    expect(pinRequired({ pinEnabled: false })).toBe(false);
  });
});
