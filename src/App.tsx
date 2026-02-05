import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import CanvasGallery from "./pages/CanvasGallery";
import CanvasPage from "./pages/CanvasPage";
import DiagramGallery from "./pages/DiagramGallery";
import DiagramPage from "./pages/DiagramPage";
import BoardGallery from "./pages/BoardGallery";
import BoardPage from "./pages/BoardPage";
import CalendarGallery from "./pages/CalendarGallery";
import CalendarPage from "./pages/CalendarPage";
import FavoritesPage from "./pages/FavoritesPage";
import SettingsPage from "./pages/SettingsPage";
import HelpPage from "./pages/HelpPage";
import TagPage from "./pages/TagPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Keep BlockNote (and its ProseMirror deps) out of the initial bundle so the home page
// doesn't blank-screen if the editor chunk fails to initialize.
const NotesGallery = lazy(() => import("./pages/NotesGallery"));
const NotesPage = lazy(() => import("./pages/NotesPage"));

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center text-muted-foreground">
                Loading…
              </div>
            }
          >
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Index />} />

                {/* Canvas (drawings, whiteboards) */}
                <Route path="/canvas" element={<CanvasGallery />} />
                <Route path="/canvas/new" element={<CanvasPage />} />
                <Route path="/canvas/:id" element={<CanvasPage />} />

                {/* Diagram (flows, mind maps) */}
                <Route path="/diagram" element={<DiagramGallery />} />
                <Route path="/diagram/new" element={<DiagramPage />} />
                <Route path="/diagram/:id" element={<DiagramPage />} />

                {/* Board (kanban) */}
                <Route path="/board" element={<BoardGallery />} />
                <Route path="/board/new" element={<BoardPage />} />
                <Route path="/board/:id" element={<BoardPage />} />

                {/* Calendar (singular view, no gallery) */}
                <Route path="/calendar" element={<CalendarPage />} />

                {/* Notes */}
                <Route path="/notes" element={<NotesGallery />} />
                <Route path="/notes/new" element={<NotesPage />} />
                <Route path="/notes/:id" element={<NotesPage />} />

                {/* Tags */}
                <Route path="/tag/:tag" element={<TagPage />} />

                {/* Favorites */}
                <Route path="/favorites" element={<FavoritesPage />} />

                {/* Help */}
                <Route path="/help" element={<HelpPage />} />

                <Route path="/settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
