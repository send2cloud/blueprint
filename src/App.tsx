import { Toaster } from './components/ui/toaster';
import { Toaster as Sonner } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from './components/theme/ThemeProvider';
import { AppLayout } from './components/layout/AppLayout';
import Index from "./pages/Index";
import CanvasGallery from "./pages/CanvasGallery";
import CanvasPage from "./pages/CanvasPage";
import DiagramGallery from "./pages/DiagramGallery";
import DiagramPage from "./pages/DiagramPage";
import BoardGallery from "./pages/BoardGallery";
import BoardPage from "./pages/BoardPage";
import CalendarPage from "./pages/CalendarPage";
import FavoritesPage from "./pages/FavoritesPage";
import SettingsPage from "./pages/SettingsPage";
import HelpPage from "./pages/HelpPage";
import TagPage from "./pages/TagPage";
import RelationshipsPage from "./pages/RelationshipsPage";
import NotFound from "./pages/NotFound";
import { initializeStorageAdapter } from './lib/storage';
import { BasePathProvider } from './lib/basePath';

// Initialize storage as soon as this module loads — works in both
// Multi-Project (via main.tsx) and Solo (via dist-lib import) modes.
initializeStorageAdapter();

const queryClient = new QueryClient();

// Keep BlockNote (and its ProseMirror deps) out of the initial bundle so the home page
// doesn't blank-screen if the editor chunk fails to initialize.
const NotesGallery = lazy(() => import("./pages/NotesGallery"));
const NotesPage = lazy(() => import("./pages/NotesPage"));
// Randomly pick a landing page variant once per module load
const LandingPage = Math.random() < 0.5
  ? lazy(() => import("./pages/LandingPage"))
  : lazy(() => import("./pages/LandingPageV2"));

interface AppProps {
  // Solo mode: pass the sub-path Blueprint is mounted at in the host app.
  // e.g. basename="/blueprint" so internal navigate() calls go to /blueprint/canvas etc.
  // Multi-Project mode (via main.tsx): omit this — basePath defaults to ''.
  basename?: string;
}

/** Dashboard + tool routes (shared between Multi-Project and Solo) */
const coreRoutes = (
  <>
    {/* Dashboard is at /home in Multi-Project mode (/ is the landing page) */}
    <Route index element={<Index />} />
    <Route path="home" element={<Index />} />

    {/* Canvas (drawings, whiteboards) */}
    <Route path="canvas" element={<CanvasGallery />} />
    <Route path="canvas/new" element={<CanvasPage />} />
    <Route path="canvas/:id" element={<CanvasPage />} />

    {/* Diagram (flows, mind maps) */}
    <Route path="diagram" element={<DiagramGallery />} />
    <Route path="diagram/new" element={<DiagramPage />} />
    <Route path="diagram/:id" element={<DiagramPage />} />

    {/* Board (kanban) */}
    <Route path="board" element={<BoardGallery />} />
    <Route path="board/new" element={<BoardPage />} />
    <Route path="board/:id" element={<BoardPage />} />

    {/* Calendar (singular view, no gallery) */}
    <Route path="calendar" element={<CalendarPage />} />

    {/* Notes */}
    <Route path="notes" element={<NotesGallery />} />
    <Route path="notes/new" element={<NotesPage />} />
    <Route path="notes/:id" element={<NotesPage />} />

    {/* Tags */}
    <Route path="tag/:tag" element={<TagPage />} />

    {/* Relationships Graph */}
    <Route path="relationships" element={<RelationshipsPage />} />

    {/* Favorites */}
    <Route path="favorites" element={<FavoritesPage />} />

    {/* Help */}
    <Route path="help" element={<HelpPage />} />

    <Route path="settings" element={<SettingsPage />} />
  </>
);

// All routes are relative (no leading /) so React Router v6 resolves them
// correctly whether Blueprint is Multi-Project (standalone) or Solo (embedded).
// basePath is threaded via context rather than a nested router.
const AppRoutes = ({ isSolo }: { isSolo: boolean }) => (
  <div className="blueprint-app h-full">
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center text-muted-foreground">
                Loading…
              </div>
            }
          >
            <Routes>
              {/* Multi-Project mode: landing page at root (outside AppLayout) */}
              {!isSolo && (
                <Route path="/" element={<LandingPage />} />
              )}

              {/* App routes wrapped in layout — use /home as dashboard in Multi-Project */}
              <Route path="/home" element={<AppLayout />}>
                <Route index element={<Index />} />
              </Route>

              <Route element={<AppLayout />}>
                {/* Canvas (drawings, whiteboards) */}
                <Route path="canvas" element={<CanvasGallery />} />
                <Route path="canvas/new" element={<CanvasPage />} />
                <Route path="canvas/:id" element={<CanvasPage />} />

                {/* Diagram (flows, mind maps) */}
                <Route path="diagram" element={<DiagramGallery />} />
                <Route path="diagram/new" element={<DiagramPage />} />
                <Route path="diagram/:id" element={<DiagramPage />} />

                {/* Board (kanban) */}
                <Route path="board" element={<BoardGallery />} />
                <Route path="board/new" element={<BoardPage />} />
                <Route path="board/:id" element={<BoardPage />} />

                {/* Calendar */}
                <Route path="calendar" element={<CalendarPage />} />

                {/* Notes */}
                <Route path="notes" element={<NotesGallery />} />
                <Route path="notes/new" element={<NotesPage />} />
                <Route path="notes/:id" element={<NotesPage />} />

                {/* Tags */}
                <Route path="tag/:tag" element={<TagPage />} />

                {/* Relationships Graph */}
                <Route path="relationships" element={<RelationshipsPage />} />

                {/* Favorites */}
                <Route path="favorites" element={<FavoritesPage />} />

                {/* Help */}
                <Route path="help" element={<HelpPage />} />

                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Multi-Project mode: project-scoped routes */}
              <Route path=":projectId" element={<AppLayout />}>
                {coreRoutes}
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </div>
);

const App = ({ basename = '' }: AppProps = {}) => {
  // Solo mode = has a basename (embedded in host app). No landing page.
  const isSolo = basename !== '';

  return (
    <BasePathProvider value={basename}>
      <AppRoutes isSolo={isSolo} />
    </BasePathProvider>
  );
};

export default App;
