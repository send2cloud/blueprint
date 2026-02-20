import { useEffect, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { TOOL_CONFIG, TOOL_LIST } from '../lib/toolConfig';
import { ToolType } from '../lib/storage';
import { useBlueprintNavigate } from '../lib/basePath';

export function useKeyboardShortcuts() {
  const navigate = useBlueprintNavigate();
  const location = useLocation();
  const { resolvedTheme, setTheme } = useTheme();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

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

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Cmd+K / Ctrl+K for command palette
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setCommandPaletteOpen(true);
      return;
    }

    // Ignore if user is typing in an input, textarea, or contenteditable
    const target = e.target as HTMLElement;
    const tagName = target.tagName?.toUpperCase();

    // Check for direct input elements
    if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
      return;
    }

    // Check for contenteditable (BlockNote, rich text editors)
    if (target.isContentEditable || target.closest('[contenteditable="true"]')) {
      return;
    }

    // Check for common editor containers (tldraw, xyflow, etc.)
    if (
      target.closest('.tl-container') ||      // tldraw
      target.closest('.react-flow') ||        // xyflow/react-flow
      target.closest('.bn-container') ||      // BlockNote
      target.closest('[data-editor]') ||      // Generic editor marker
      target.closest('[role="textbox"]')      // ARIA textbox
    ) {
      return;
    }

    // Ignore if modifier keys are pressed (except for our shortcuts)
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }

    const key = e.key;
    const keyUpper = key.toUpperCase();
    const currentTool = getCurrentTool();

    // Backslash - Toggle theme
    if (key === '\\') {
      e.preventDefault();
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
      return;
    }

    // S - Favorites (Star)
    if (keyUpper === 'S') {
      e.preventDefault();
      navigate('/favorites');
      return;
    }

    // R - Relationships graph
    if (keyUpper === 'R') {
      e.preventDefault();
      navigate('/relationships');
      return;
    }

    // Tool shortcuts: W, F, T, D - navigate to tool gallery
    for (const tool of TOOL_LIST) {
      if (keyUpper === tool.shortcut) {
        e.preventDefault();
        navigate(tool.path);
        return;
      }
    }

    // N - New artifact (contextual)
    if (keyUpper === 'N') {
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
    if (keyUpper === 'G') {
      e.preventDefault();
      if (currentTool) {
        navigate(TOOL_CONFIG[currentTool].path);
      }
      return;
    }
  }, [navigate, getCurrentTool, resolvedTheme, setTheme]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { commandPaletteOpen, setCommandPaletteOpen };
}
