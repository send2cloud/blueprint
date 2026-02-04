export type ToolType = 'draw' | 'flow' | 'mindmap' | 'kanban' | 'whiteboard';

export const ALL_TOOLS: ToolType[] = ['draw', 'flow', 'mindmap', 'kanban', 'whiteboard'];

export interface BlueprintSettings {
  enabledTools: ToolType[];
}

export interface Artifact {
  id: string;
  type: ToolType;
  name: string;
  data: unknown;
  createdAt: string;
  updatedAt: string;
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
}
