export type ToolType = 'canvas' | 'diagram' | 'board' | 'notes' | 'calendar';

// Tools that use the artifact/gallery pattern
export type ArtifactToolType = 'canvas' | 'diagram' | 'board' | 'notes';

export const ALL_TOOLS: ToolType[] = ['canvas', 'diagram', 'board', 'notes', 'calendar'];
export const ARTIFACT_TOOLS: ArtifactToolType[] = ['canvas', 'diagram', 'board', 'notes'];

export interface BlueprintSettings {
  enabledTools: ToolType[];
  seededNoteCreated?: boolean;
  mode?: 'solo' | 'multi';
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Artifact {
  id: string;
  type: ToolType;
  name: string;
  data: unknown;
  createdAt: string;
  updatedAt: string;
  favorite: boolean;
  schemaVersion: number;
  pinned: boolean;
  tags?: string[];
  projectId?: string;
}

/** Calendar event stored in the database */
export interface CalendarEventRecord {
  id: string;
  title: string;
  start: string; // ISO string
  end: string;   // ISO string
  allDay?: boolean;
  description?: string;
  color?: string;
  tags?: string[];
  sourceType?: 'manual' | 'task' | 'doc';
  sourceId?: string;
  projectId?: string;
}

export interface StorageAdapter {
  // Settings
  getSettings(): Promise<BlueprintSettings>;
  saveSettings(settings: BlueprintSettings): Promise<void>;

  // Projects
  getProjects(): Promise<Project[]>;
  saveProject(project: Project): Promise<void>;
  deleteProject(id: string): Promise<void>;

  // Artifacts (flows, drawings, etc.)
  getArtifact(id: string): Promise<Artifact | null>;
  saveArtifact(artifact: Artifact): Promise<void>;
  deleteArtifact(id: string): Promise<void>;
  listArtifacts(type?: ToolType, projectId?: string): Promise<Artifact[]>;
  listFavorites(projectId?: string): Promise<Artifact[]>;
  listByTag(tag: string, projectId?: string): Promise<Artifact[]>;

  // Calendar events
  listCalendarEvents(projectId?: string): Promise<CalendarEventRecord[]>;
  saveCalendarEvent(event: CalendarEventRecord): Promise<void>;
  deleteCalendarEvent(id: string): Promise<void>;
}
