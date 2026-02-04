import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TOOL_CONFIG, TOOL_LIST } from '@/lib/toolConfig';
import { ToolType } from '@/lib/storage';

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current tool context from the route
  const getCurrentTool = useCallback((): ToolType | null => {
    const path = location.pathname;
    for (const tool of TOOL_LIST) {
      if (path.startsWith(tool.path)) {
        return tool.type;
      }
    }
    return null;
  }, [location.pathname]);

  // Check if we're in a gallery view (not editing an artifact)
  const isGalleryView = useCallback((): boolean => {
    const path = location.pathname;
    const currentTool = getCurrentTool();
    if (!currentTool) return false;
    const toolPath = TOOL_CONFIG[currentTool].path;
    return path === toolPath;
  }, [location.pathname, getCurrentTool]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if user is typing in an input, textarea, or contenteditable
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable ||
      target.closest('[contenteditable="true"]')
    ) {
      return;
    }

    // Ignore if modifier keys are pressed (except for our shortcuts)
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }

    const key = e.key.toUpperCase();
    const currentTool = getCurrentTool();

    // Tool shortcuts: W, F, T, D - navigate to tool gallery
    for (const tool of TOOL_LIST) {
      if (key === tool.shortcut) {
        e.preventDefault();
        navigate(tool.path);
        return;
      }
    }

    // N - New artifact (contextual)
    if (key === 'N') {
      e.preventDefault();
      if (currentTool) {
        navigate(`${TOOL_CONFIG[currentTool].path}/new`);
      } else {
        // Default to whiteboard if not in a tool context
        navigate('/canvas/new');
      }
      return;
    }

    // G - Gallery view (contextual)
    if (key === 'G') {
      e.preventDefault();
      if (currentTool) {
        navigate(TOOL_CONFIG[currentTool].path);
      }
      return;
    }
  }, [navigate, getCurrentTool]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
