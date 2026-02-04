import { Home, Pencil, GitBranch, Brain, Columns3, StickyNote, Settings } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useBlueprint } from '@/contexts/BlueprintContext';
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

interface ToolItem {
  title: string;
  url: string;
  icon: typeof Home;
  toolType?: ToolType;
}

const toolItems: ToolItem[] = [
  { title: 'Draw', url: '/draw', icon: Pencil, toolType: 'draw' },
  { title: 'Flow', url: '/flow', icon: GitBranch, toolType: 'flow' },
  { title: 'Mind Map', url: '/mindmap', icon: Brain, toolType: 'mindmap' },
  { title: 'Kanban', url: '/kanban', icon: Columns3, toolType: 'kanban' },
  { title: 'Whiteboard', url: '/whiteboard', icon: StickyNote, toolType: 'whiteboard' },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { isToolEnabled, loading } = useBlueprint();
  const collapsed = state === 'collapsed';

  const visibleTools = loading 
    ? toolItems 
    : toolItems.filter(item => !item.toolType || isToolEnabled(item.toolType));

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
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink 
                      to={item.url} 
                      className="flex items-center gap-2"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
