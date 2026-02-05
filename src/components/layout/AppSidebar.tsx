import { Home, Star, Settings, Moon, Sun, PanelLeftClose, PanelLeft, HelpCircle } from 'lucide-react';
import { useTheme } from 'next-themes';
import { NavLink } from '@/components/NavLink';
import { useBlueprint } from '@/contexts/BlueprintContext';
import { TOOL_LIST } from '@/lib/toolConfig';
import { useAllArtifacts } from '@/hooks/useArtifacts';
import { ToolType } from '@/lib/storage';
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
  const { artifacts } = useAllArtifacts();

  const visibleTools = loading 
    ? TOOL_LIST 
    : TOOL_LIST.filter(item => isToolEnabled(item.type));

  const counts = artifacts.reduce<Record<ToolType, number>>((acc, artifact) => {
    acc[artifact.type] = (acc[artifact.type] ?? 0) + 1;
    return acc;
   }, { canvas: 0, diagram: 0, board: 0, notes: 0, calendar: 0 });

  const favoriteCount = artifacts.filter((artifact) => artifact.favorite).length;

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Blueprints">
              <NavLink 
                to="/" 
                end 
                className="flex items-center gap-2" 
                activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
              >
                <Home className="h-4 w-4" />
                {!collapsed && (
                  <span className="flex flex-col leading-tight">
                    <span className="font-semibold">Blueprints</span>
                    <span
                      className="inline-flex w-fit rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-medium text-amber-300"
                      title="Data is stored in this browser only. Connect InstantDB in Settings to sync with a project."
                    >
                      Using local storage
                    </span>
                  </span>
                )}
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
                          <span className="flex items-center gap-2">
                            <span>{item.title}</span>
                            {counts[item.type] > 0 && (
                              <span className="min-w-6 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground text-center">
                                {counts[item.type]}
                              </span>
                            )}
                          </span>
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
                        <span className="flex items-center gap-2">
                          <span>Favorites</span>
                          {favoriteCount > 0 && (
                            <span className="min-w-6 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground text-center">
                              {favoriteCount}
                            </span>
                          )}
                        </span>
                        <kbd className="text-[10px] font-mono text-muted-foreground">S</kbd>
                      </span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Help">
                  <NavLink
                    to="/help"
                    className="flex items-center gap-2"
                    activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                  >
                    <HelpCircle className="h-4 w-4" />
                    {!collapsed && <span>Help</span>}
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
