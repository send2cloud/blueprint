import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '../ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { BlueprintProvider, useBlueprint } from '../../contexts/BlueprintContext';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useEffect } from 'react';
import { ensureSeedNote } from '../../lib/seed';
import { CommandPalette } from '../CommandPalette';

function AppLayoutContent() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useKeyboardShortcuts();
  const { storage, currentProjectId, setCurrentProject, settings } = useBlueprint();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (projectId && projectId !== currentProjectId) {
      setCurrentProject(projectId);
    } else if (!projectId && currentProjectId && settings.mode === 'multi') {
      // In multi-mode, if the user hits the root without a project slug, redirect them to their current project.
      if (location.pathname === '/' || location.pathname === '') {
        navigate(`/${currentProjectId}`, { replace: true });
      } else {
        // Redirect to the same path but prefixed with the project ID
        navigate(`/${currentProjectId}${location.pathname}`, { replace: true });
      }
    }
  }, [projectId, currentProjectId, setCurrentProject, navigate, settings.mode, location.pathname]);

  useEffect(() => {
    ensureSeedNote(storage).catch((error) => {
      console.error('Failed to seed default note:', error);
    });
  }, [storage]);

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <SidebarInset className="flex flex-col flex-1">
        <main className="flex-1 flex flex-col">
          <Outlet />
        </main>
      </SidebarInset>
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
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
