import { Home, Star, Settings, Moon, Sun, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useTheme } from 'next-themes';
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
  const { state, toggleSidebar } = useSidebar();
  const { isToolEnabled, loading } = useBlueprint();
  const { resolvedTheme, setTheme } = useTheme();
  const collapsed = state === 'collapsed';

  const visibleTools = loading 
    ? TOOL_LIST 
    : TOOL_LIST.filter(item => isToolEnabled(item.type));

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

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
                <SidebarMenuButton asChild tooltip="Favorites (S)">
                  <NavLink 
                    to="/favorites" 
                    className="flex items-center gap-2"
                    activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                  >
                    <Star className="h-4 w-4" />
                    {!collapsed && (
                      <span className="flex-1 flex items-center justify-between">
                        <span>Favorites</span>
                        <kbd className="text-[10px] font-mono text-muted-foreground">S</kbd>
                      </span>
                    )}
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
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={`Toggle theme (\\)`} onClick={toggleTheme}>
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              {!collapsed && <span>Toggle theme</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={toggleSidebar}>
              {collapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <>
                  <PanelLeftClose className="h-4 w-4" />
                  <span>Collapse</span>
                </>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
