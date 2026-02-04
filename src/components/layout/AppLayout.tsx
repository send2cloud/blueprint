import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { BlueprintProvider } from '@/contexts/BlueprintContext';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

function AppLayoutContent() {
  useKeyboardShortcuts();
  
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <SidebarInset className="flex flex-col flex-1">
        <header className="flex h-12 items-center justify-between border-b border-border px-4">
          <SidebarTrigger className="-ml-1" />
          <ThemeToggle />
        </header>
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
