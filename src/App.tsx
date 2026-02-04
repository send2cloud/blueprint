import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import CanvasGallery from "./pages/CanvasGallery";
import CanvasPage from "./pages/CanvasPage";
import DiagramGallery from "./pages/DiagramGallery";
import DiagramPage from "./pages/DiagramPage";
import BoardGallery from "./pages/BoardGallery";
import BoardPage from "./pages/BoardPage";
import FavoritesPage from "./pages/FavoritesPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
            
            {/* Favorites */}
            <Route path="/favorites" element={<FavoritesPage />} />
            
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
