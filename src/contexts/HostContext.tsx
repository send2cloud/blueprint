import { createContext, useContext, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

/** A link from Blueprint's sidebar to a live tool in the host app. */
export interface LiveConnector {
  id: string;
  label: string;
  url: string;
  icon?: LucideIcon;
  /** self = same tab, blank = new tab, top = break out of iframe */
  target?: 'self' | 'blank' | 'top';
  badge?: string;
  badgeVariant?: 'default' | 'success' | 'warning' | 'danger';
}

interface HostValue {
  liveConnectors: LiveConnector[];
}

const HostContext = createContext<HostValue>({ liveConnectors: [] });

export function HostProvider({ value, children }: { value: HostValue; children: ReactNode }) {
  return <HostContext.Provider value={value}>{children}</HostContext.Provider>;
}

export const useHost = () => useContext(HostContext);

export function openConnector(c: LiveConnector) {
  const target = c.target ?? 'blank';
  if (target === 'top') (window.top ?? window).location.href = c.url;
  else if (target === 'self') window.location.href = c.url;
  else window.open(c.url, '_blank', 'noopener,noreferrer');
}
