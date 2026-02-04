import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { BlueprintProvider } from '@/contexts/BlueprintContext';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

function AppLayoutContent() {
  useKeyboardShortcuts();
  
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <SidebarInset className="flex flex-col flex-1">
        <main className="flex-1 flex flex-col">
          <Outlet />
        </main>
      </SidebarInset>
    </div>
  );
}

export function AppLayout() {
  return (
    <BlueprintProvider>
      <SidebarProvider>
        <AppLayoutContent />
      </SidebarProvider>
    </BlueprintProvider>
  );
}
