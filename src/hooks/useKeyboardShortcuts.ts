import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { TOOL_CONFIG, TOOL_LIST } from '@/lib/toolConfig';
import { ToolType } from '@/lib/storage';

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resolvedTheme, setTheme } = useTheme();

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
}
