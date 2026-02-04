import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import DrawGallery from "./pages/DrawGallery";
import DrawPage from "./pages/DrawPage";
import FlowGallery from "./pages/FlowGallery";
import FlowPage from "./pages/FlowPage";
import MindMapGallery from "./pages/MindMapGallery";
import MindMapPage from "./pages/MindMapPage";
import KanbanGallery from "./pages/KanbanGallery";
import KanbanPage from "./pages/KanbanPage";
import WhiteboardGallery from "./pages/WhiteboardGallery";
import WhiteboardPage from "./pages/WhiteboardPage";
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
            
            {/* Draw */}
            <Route path="/draw" element={<DrawGallery />} />
            <Route path="/draw/new" element={<DrawPage />} />
            <Route path="/draw/:id" element={<DrawPage />} />
            
            {/* Flow */}
            <Route path="/flow" element={<FlowGallery />} />
            <Route path="/flow/new" element={<FlowPage />} />
            <Route path="/flow/:id" element={<FlowPage />} />
            
            {/* Mind Map */}
            <Route path="/mindmap" element={<MindMapGallery />} />
            <Route path="/mindmap/new" element={<MindMapPage />} />
            <Route path="/mindmap/:id" element={<MindMapPage />} />
            
            {/* Kanban */}
            <Route path="/kanban" element={<KanbanGallery />} />
            <Route path="/kanban/new" element={<KanbanPage />} />
            <Route path="/kanban/:id" element={<KanbanPage />} />
            
            {/* Whiteboard */}
            <Route path="/whiteboard" element={<WhiteboardGallery />} />
            <Route path="/whiteboard/new" element={<WhiteboardPage />} />
            <Route path="/whiteboard/:id" element={<WhiteboardPage />} />
            
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
