 import { Palette, GitBranch, Columns3, FileText, Calendar, LucideIcon } from 'lucide-react';
import { ToolType } from './storage/types';

export interface ToolConfig {
  type: ToolType;
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  shortcut: string;
  typeLabel: string;
}

export const TOOL_CONFIG: Record<ToolType, ToolConfig> = {
  canvas: {
    type: 'canvas',
    title: 'Whiteboard',
    description: 'Freeform drawings, whiteboards, sketches, and visual notes',
    icon: Palette,
    path: '/canvas',
    shortcut: 'W',
    typeLabel: 'whiteboard',
  },
  diagram: {
    type: 'diagram',
    title: 'Flow',
    description: 'Flow charts, mind maps, system diagrams, and process flows',
    icon: GitBranch,
    path: '/diagram',
    shortcut: 'F',
    typeLabel: 'flow',
  },
  board: {
    type: 'board',
    title: 'Tasks',
    description: 'Kanban boards, task trackers, and project roadmaps',
    icon: Columns3,
    path: '/board',
    shortcut: 'T',
    typeLabel: 'task board',
  },
  notes: {
    type: 'notes',
    title: 'Docs',
    description: 'Rich text documents, notes, and Notion-style content',
    icon: FileText,
    path: '/notes',
    shortcut: 'D',
    typeLabel: 'doc',
  },
   calendar: {
     type: 'calendar',
     title: 'Calendar',
     description: 'Schedules, meetings, deadlines, and time-based planning',
     icon: Calendar,
     path: '/calendar',
     shortcut: 'C',
     typeLabel: 'calendar',
   },
};

export const TOOL_LIST = Object.values(TOOL_CONFIG);
