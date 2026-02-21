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
  const { storage, currentProjectId, setCurrentProject, settings, getProjectBySlug, projects, loading } = useBlueprint();
  const { projectId: projectSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading || projects.length === 0) return;

    if (projectSlug) {
      // Resolve slug to project (also checks slugAliases)
      const project = getProjectBySlug(projectSlug);
      if (project) {
        if (project.id !== currentProjectId) {
          setCurrentProject(project.id);
        }
        // If matched via alias, redirect to canonical slug
        if (project.slug !== projectSlug) {
          const subPath = location.pathname.slice(`/${projectSlug}`.length);
          navigate(`/${project.slug}${subPath}`, { replace: true });
        }
      } else {
        // Unknown slug — navigate to 404 so user knows it's invalid
        navigate('/404', { replace: true });
      }
    } else if (settings.mode === 'multi') {
      // In multi-mode, redirect bare paths to the current project's slug.
      // E.g., /settings becomes /slug/settings
      const current = projects.find(p => p.id === currentProjectId) || projects[0];
      const slug = current.slug;
      if (location.pathname === '/' || location.pathname === '') {
        navigate(`/${slug}`, { replace: true });
      } else {
        navigate(`/${slug}${location.pathname}`, { replace: true });
      }
    }
  }, [projectSlug, currentProjectId, setCurrentProject, navigate, settings.mode, location.pathname, getProjectBySlug, projects, loading]);

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
