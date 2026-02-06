import { Home, Star, Settings, Moon, Sun, PanelLeftClose, PanelLeft, HelpCircle, Tag, Network } from 'lucide-react';
import { useTheme } from 'next-themes';
import { NavLink } from '@/components/NavLink';
import { useBlueprint } from '@/contexts/BlueprintContext';
import { TOOL_LIST, TOOL_CONFIG } from '@/lib/toolConfig';
import { useAllArtifacts } from '@/hooks/useArtifacts';
import { TagCloud } from '@/components/sidebar/TagCloud';
import { getStorageAdapterType } from '@/lib/storage/adapter';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const { isToolEnabled, loading } = useBlueprint();
  const { resolvedTheme, setTheme } = useTheme();
  const collapsed = state === 'collapsed';
  const { artifacts } = useAllArtifacts();
  const storageType = getStorageAdapterType();

  const visibleTools = loading 
    ? TOOL_LIST 
    : TOOL_LIST.filter(item => isToolEnabled(item.type));

  // Only count artifacts for non-singular tools
  const counts = artifacts.reduce<Record<string, number>>((acc, artifact) => {
    acc[artifact.type] = (acc[artifact.type] ?? 0) + 1;
    return acc;
  }, {});

  const favoriteCount = artifacts.filter((artifact) => artifact.favorite).length;

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  // Check if any artifacts have tags
  const hasAnyTags = artifacts.some(a => a.tags && a.tags.length > 0);

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
                <div className="relative">
                  <Home className="h-4 w-4" />
                  <span
                    className={`absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border border-sidebar-background ${
                      storageType === 'instantdb'
                        ? 'bg-emerald-500'
                        : 'bg-red-500'
                    }`}
                    title={
                      storageType === 'instantdb'
                        ? 'Connected to InstantDB'
                        : 'No database connected (local only)'
                    }
                  />
                </div>
                {!collapsed && (
                  <span className="font-semibold">Blueprint</span>
                )}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Tools */}
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
                            {!TOOL_CONFIG[item.type].singular && counts[item.type] > 0 && (
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

        {/* Library */}
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
                <SidebarMenuButton asChild tooltip="Relationships (R)">
                  <NavLink
                    to="/relationships"
                    className="flex items-center gap-2"
                    activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                  >
                    <Network className="h-4 w-4" />
                    {!collapsed && (
                      <span className="flex-1 flex items-center justify-between">
                        <span>Relationships</span>
                        <kbd className="text-[10px] font-mono text-muted-foreground">R</kbd>
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

        {/* Tags */}
        {hasAnyTags && (
          <SidebarGroup>
            <Collapsible defaultOpen>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/50 rounded px-2 -mx-2 flex items-center gap-2">
                  <Tag className="h-3 w-3" />
                  Tags
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent className="pt-2">
                  <TagCloud artifacts={artifacts} collapsed={collapsed} />
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}
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
