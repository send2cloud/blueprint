import { Home, Star, Settings } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useBlueprint } from '@/contexts/BlueprintContext';
import { TOOL_LIST } from '@/lib/toolConfig';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';

export function AppSidebar() {
  const { state } = useSidebar();
  const { isToolEnabled, loading } = useBlueprint();
  const collapsed = state === 'collapsed';

  const visibleTools = loading 
    ? TOOL_LIST 
    : TOOL_LIST.filter(item => isToolEnabled(item.type));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Idea Room">
              <NavLink 
                to="/" 
                end 
                className="flex items-center gap-2" 
                activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
              >
                <Home className="h-4 w-4" />
                {!collapsed && <span className="font-semibold">Idea Room</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleTools.map((item) => (
                <SidebarMenuItem key={item.type}>
                  <SidebarMenuButton asChild tooltip={`${item.title} (${item.shortcut})`}>
                    <NavLink 
                      to={item.path} 
                      className="flex items-center gap-2"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && (
                        <span className="flex-1 flex items-center justify-between">
                          <span>{item.title}</span>
                          <kbd className="text-[10px] font-mono text-muted-foreground">{item.shortcut}</kbd>
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Library</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Favorites">
                  <NavLink 
                    to="/favorites" 
                    className="flex items-center gap-2"
                    activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                  >
                    <Star className="h-4 w-4" />
                    {!collapsed && <span>Favorites</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <NavLink 
                to="/settings" 
                className="flex items-center gap-2"
                activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
              >
                <Settings className="h-4 w-4" />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
