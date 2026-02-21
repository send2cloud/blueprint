import { useState, useRef, useEffect, useCallback } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Lock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const PIN_COOKIE_KEY = 'blueprint:pin-auth';
const PIN_HASH = '5555'; // Simple PIN — not cryptographic, just a gate
const REMEMBER_DAYS = 90;
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000; // 1 minute lockout after max attempts

function isPinRemembered(): boolean {
  try {
    const raw = localStorage.getItem(PIN_COOKIE_KEY);
    if (!raw) return false;
    const { expires, token } = JSON.parse(raw);
    if (token !== 'granted') return false;
    return new Date(expires).getTime() > Date.now();
  } catch {
    return false;
  }
}

function rememberPin(remember: boolean): void {
  if (!remember) return;
  const expires = new Date(Date.now() + REMEMBER_DAYS * 24 * 60 * 60 * 1000).toISOString();
  localStorage.setItem(PIN_COOKIE_KEY, JSON.stringify({ token: 'granted', expires }));
}

export function usePinGate() {
  const [authenticated, setAuthenticated] = useState(() => isPinRemembered());

  const authenticate = useCallback((remember: boolean) => {
    rememberPin(remember);
    setAuthenticated(true);
  }, []);

  return { authenticated, authenticate };
}

interface PinGateProps {
  onSuccess: (remember: boolean) => void;
}

export function PinGate({ onSuccess }: PinGateProps) {
  const [pin, setPin] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Anti-bot: honeypot field (hidden from real users)
  const honeypotRef = useRef<HTMLInputElement>(null);

  // Anti-bot: track submission timing (bots submit instantly)
  const mountTime = useRef(Date.now());

  // Lockout countdown timer
  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockedUntil(null);
        setCountdown(0);
        setAttempts(0);
        setError('');
      } else {
        setCountdown(remaining);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const handleSubmit = () => {
    // Anti-bot: check honeypot
    if (honeypotRef.current?.value) {
      // Silently reject — don't reveal it's a bot trap
      setError('Access denied.');
      return;
    }

    // Anti-bot: reject if submitted < 1 second after mount
    if (Date.now() - mountTime.current < 1000) {
      setError('Please wait a moment.');
      return;
    }

    // Check lockout
    if (lockedUntil && Date.now() < lockedUntil) {
      return;
    }

    if (pin === PIN_HASH) {
      onSuccess(remember);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPin('');
      if (newAttempts >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_MS;
        setLockedUntil(until);
        setError(`Too many attempts. Locked for 60 seconds.`);
      } else {
        setError(`Wrong PIN. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
      }
    }
  };

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0b' }}>
      <motion.div
        className="w-full max-w-sm mx-auto px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center gap-6">
          {/* Icon */}
          <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <Lock className="w-8 h-8" style={{ color: '#4ecdc4' }} />
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1
              className="text-2xl font-bold"
              style={{ color: '#f0f0f0', fontFamily: "'Inter', sans-serif" }}
            >
              Enter PIN
            </h1>
            <p
              className="text-sm"
              style={{ color: '#666', fontFamily: "'JetBrains Mono', monospace" }}
            >
              This workspace is protected
            </p>
          </div>

          {/* Anti-bot honeypot — invisible to users, visible to bots */}
          <input
            ref={honeypotRef}
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '-9999px',
              width: 0,
              height: 0,
              opacity: 0,
              overflow: 'hidden',
            }}
          />

          {/* PIN Input */}
          <div className="flex flex-col items-center gap-4">
            <InputOTP
              maxLength={4}
              value={pin}
              onChange={setPin}
              onComplete={handleSubmit}
              disabled={isLocked}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>

            {/* Error message */}
            {error && (
              <motion.p
                className="text-sm text-center"
                style={{ color: '#ef4444' }}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
                {isLocked && countdown > 0 && ` (${countdown}s)`}
              </motion.p>
            )}

            {/* Remember checkbox */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <Checkbox
                checked={remember}
                onCheckedChange={(checked) => setRemember(checked === true)}
                disabled={isLocked}
              />
              <span className="text-xs" style={{ color: '#888' }}>
                Remember for {REMEMBER_DAYS} days
              </span>
            </label>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={pin.length < 4 || isLocked}
              className="w-full gap-2"
              style={{
                background: pin.length === 4 && !isLocked ? '#4ecdc4' : '#333',
                color: '#0a0a0b',
                border: 'none',
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
                fontSize: '0.8rem',
              }}
            >
              <ShieldCheck className="w-4 h-4" />
              Unlock
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
