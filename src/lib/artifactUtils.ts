 import type { Artifact } from '@/lib/storage/types';
 
 /**
  * Sort artifacts: pinned first, then by most recent updatedAt
  */
 export function sortArtifacts(artifacts: Artifact[]): Artifact[] {
   return [...artifacts].sort((a, b) => {
     if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
     return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
   });
 }
 
 /**
  * Generate searchable text from an artifact for filtering
  */
 export function getArtifactSearchText(artifact: Artifact): string {
   const parts = [artifact.name, artifact.type, artifact.updatedAt];
   if (artifact.data) {
     try {
       parts.push(JSON.stringify(artifact.data));
     } catch {
       // ignore serialization errors
     }
   }
   return parts.join(' ').toLowerCase();
 }