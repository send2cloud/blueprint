import { ExternalLink } from 'lucide-react';
import { useHost, openConnector } from '../../contexts/HostContext';
import {
  SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from '../ui/sidebar';

const BADGE: Record<string, string> = {
  default: 'bg-muted text-muted-foreground',
  success: 'bg-primary/15 text-primary',
  warning: 'bg-accent text-accent-foreground',
  danger: 'bg-destructive/15 text-destructive',
};

export function LiveConnectors({ collapsed }: { collapsed: boolean }) {
  const { liveConnectors } = useHost();
  if (liveConnectors.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Live</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {liveConnectors.map((c) => {
            const Icon = c.icon ?? ExternalLink;
            return (
              <SidebarMenuItem key={c.id}>
                <SidebarMenuButton tooltip={c.label} onClick={() => openConnector(c)}>
                  <Icon className="h-4 w-4" />
                  {!collapsed && (
                    <span className="flex-1 flex items-center justify-between">
                      <span>{c.label}</span>
                      {c.badge && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] ${BADGE[c.badgeVariant ?? 'default']}`}>
                          {c.badge}
                        </span>
                      )}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
