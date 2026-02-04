import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import DrawPage from "./pages/DrawPage";
import FlowPage from "./pages/FlowPage";
import MindMapPage from "./pages/MindMapPage";
import KanbanPage from "./pages/KanbanPage";
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
            <Route path="/draw" element={<DrawPage />} />
            <Route path="/flow" element={<FlowPage />} />
            <Route path="/mindmap" element={<MindMapPage />} />
            <Route path="/kanban" element={<KanbanPage />} />
            <Route path="/whiteboard" element={<WhiteboardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
