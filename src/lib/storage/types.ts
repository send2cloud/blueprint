 export type ToolType = 'canvas' | 'diagram' | 'board' | 'notes' | 'calendar';

 export const ALL_TOOLS: ToolType[] = ['canvas', 'diagram', 'board', 'notes', 'calendar'];

export interface BlueprintSettings {
  enabledTools: ToolType[];
  seededNoteCreated?: boolean;
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
}

export interface StorageAdapter {
  // Settings
  getSettings(): Promise<BlueprintSettings>;
  saveSettings(settings: BlueprintSettings): Promise<void>;
  
  // Artifacts (flows, drawings, etc.)
  getArtifact(id: string): Promise<Artifact | null>;
  saveArtifact(artifact: Artifact): Promise<void>;
  deleteArtifact(id: string): Promise<void>;
  listArtifacts(type?: ToolType): Promise<Artifact[]>;
  listFavorites(): Promise<Artifact[]>;
}
