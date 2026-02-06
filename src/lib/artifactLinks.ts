import type { Artifact } from '@/lib/storage/types';

/**
 * Regex to match [[artifact-name]] wiki-style links
 * Captures the link text inside the brackets
 */
export const WIKI_LINK_REGEX = /\[\[([^\]]+)\]\]/g;

/**
 * Extract all wiki-style links from text content
 */
export function extractWikiLinks(text: string): string[] {
  const matches: string[] = [];
  let match;
  
  while ((match = WIKI_LINK_REGEX.exec(text)) !== null) {
    matches.push(match[1].trim());
  }
  
  // Reset regex lastIndex
  WIKI_LINK_REGEX.lastIndex = 0;
  
  return [...new Set(matches)]; // Deduplicate
}

/**
 * Extract text content from BlockNote document
 */
function extractBlockNoteText(data: unknown): string {
  if (!Array.isArray(data)) return '';
  
  const texts: string[] = [];
  
  function extractFromBlock(block: unknown): void {
    if (!block || typeof block !== 'object') return;
    
    const b = block as Record<string, unknown>;
    
    // Extract from content array (inline content)
    if (Array.isArray(b.content)) {
      for (const item of b.content) {
        if (typeof item === 'object' && item !== null) {
          const inline = item as Record<string, unknown>;
          if (typeof inline.text === 'string') {
            texts.push(inline.text);
          }
        }
      }
    }
    
    // Recursively extract from children
    if (Array.isArray(b.children)) {
      for (const child of b.children) {
        extractFromBlock(child);
      }
    }
  }
  
  for (const block of data) {
    extractFromBlock(block);
  }
  
  return texts.join(' ');
}

/**
 * Extract text content from a Flow diagram
 */
function extractDiagramText(data: unknown): string {
  if (!data || typeof data !== 'object') return '';
  
  const d = data as Record<string, unknown>;
  const texts: string[] = [];
  
  if (Array.isArray(d.nodes)) {
    for (const node of d.nodes) {
      if (typeof node === 'object' && node !== null) {
        const n = node as Record<string, unknown>;
        if (n.data && typeof n.data === 'object') {
          const nodeData = n.data as Record<string, unknown>;
          if (typeof nodeData.label === 'string') {
            texts.push(nodeData.label);
          }
        }
      }
    }
  }
  
  return texts.join(' ');
}

/**
 * Extract text content from a Board (Kanban)
 */
function extractBoardText(data: unknown): string {
  if (!data || typeof data !== 'object') return '';
  
  const d = data as Record<string, unknown>;
  const texts: string[] = [];
  
  if (Array.isArray(d.columns)) {
    for (const col of d.columns) {
      if (typeof col === 'object' && col !== null) {
        const column = col as Record<string, unknown>;
        if (typeof column.title === 'string') {
          texts.push(column.title);
        }
        if (Array.isArray(column.cards)) {
          for (const card of column.cards) {
            if (typeof card === 'object' && card !== null) {
              const c = card as Record<string, unknown>;
              if (typeof c.title === 'string') texts.push(c.title);
              if (typeof c.description === 'string') texts.push(c.description);
            }
          }
        }
      }
    }
  }
  
  return texts.join(' ');
}

/**
 * Extract all text content from an artifact for link detection
 */
export function extractArtifactText(artifact: Artifact): string {
  const parts: string[] = [artifact.name];
  
  switch (artifact.type) {
    case 'notes':
      parts.push(extractBlockNoteText(artifact.data));
      break;
    case 'diagram':
      parts.push(extractDiagramText(artifact.data));
      break;
    case 'board':
      parts.push(extractBoardText(artifact.data));
      break;
    case 'canvas':
      // Canvas (tldraw) has complex structure, just use name for now
      break;
  }
  
  return parts.join(' ');
}

/**
 * Find outgoing links from an artifact (artifacts it references)
 */
export function findOutgoingLinks(artifact: Artifact, allArtifacts: Artifact[]): Artifact[] {
  const text = extractArtifactText(artifact);
  const linkNames = extractWikiLinks(text);
  
  // Match link names to artifacts (case-insensitive)
  return allArtifacts.filter((a) => 
    a.id !== artifact.id && 
    linkNames.some((name) => a.name.toLowerCase() === name.toLowerCase())
  );
}

/**
 * Find incoming links to an artifact (artifacts that reference it)
 */
export function findBacklinks(artifact: Artifact, allArtifacts: Artifact[]): Artifact[] {
  return allArtifacts.filter((a) => {
    if (a.id === artifact.id) return false;
    const text = extractArtifactText(a);
    const linkNames = extractWikiLinks(text);
    return linkNames.some((name) => artifact.name.toLowerCase() === name.toLowerCase());
  });
}

/**
 * Build a relationship graph of all artifacts
 */
export interface ArtifactRelationship {
  source: string; // artifact id
  target: string; // artifact id
}

export function buildRelationshipGraph(artifacts: Artifact[]): {
  nodes: { id: string; name: string; type: string }[];
  edges: ArtifactRelationship[];
} {
  const nodes = artifacts.map((a) => ({
    id: a.id,
    name: a.name,
    type: a.type,
  }));
  
  const edges: ArtifactRelationship[] = [];
  
  for (const artifact of artifacts) {
    const outgoing = findOutgoingLinks(artifact, artifacts);
    for (const target of outgoing) {
      edges.push({
        source: artifact.id,
        target: target.id,
      });
    }
  }
  
  return { nodes, edges };
}
