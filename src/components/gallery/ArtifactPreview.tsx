 import { FileText, GitBranch, Columns3, Palette } from 'lucide-react';
 import type { Artifact } from '@/lib/storage';
 
 interface ArtifactPreviewProps {
   artifact: Artifact;
 }
 
 /**
  * Renders a visual preview of an artifact based on its type and data
  */
 export function ArtifactPreview({ artifact }: ArtifactPreviewProps) {
   const data = artifact.data as Record<string, unknown> | undefined;
   
   // Whiteboard - show placeholder with brush strokes
   if (artifact.type === 'canvas') {
     return (
       <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
         <Palette className="h-12 w-12 text-muted-foreground/30" />
       </div>
     );
   }
   
   // Flow - show node count and simplified graph
   if (artifact.type === 'diagram') {
     const nodes = (data?.nodes as Array<unknown>) || [];
     const edges = (data?.edges as Array<unknown>) || [];
     return (
       <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted flex flex-col items-center justify-center gap-2">
         <GitBranch className="h-10 w-10 text-muted-foreground/30" />
         {(nodes.length > 0 || edges.length > 0) && (
           <span className="text-xs text-muted-foreground">
             {nodes.length} nodes · {edges.length} edges
           </span>
         )}
       </div>
     );
   }
   
   // Tasks - show column/task summary
   if (artifact.type === 'board') {
     const columns = (data?.columns as Array<{ id: string; title: string; taskIds: string[] }>) || [];
     const tasks = (data?.tasks as Record<string, unknown>) || {};
     const taskCount = Object.keys(tasks).length;
     return (
       <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted flex flex-col items-center justify-center gap-2">
         <Columns3 className="h-10 w-10 text-muted-foreground/30" />
         {(columns.length > 0 || taskCount > 0) && (
           <span className="text-xs text-muted-foreground">
             {columns.length} columns · {taskCount} tasks
           </span>
         )}
       </div>
     );
   }
   
   // Docs - show text excerpt
   if (artifact.type === 'notes') {
     // BlockNote stores content as array of blocks
     const blocks = data as unknown as Array<{ content?: Array<{ text?: string }> }> | undefined;
     let excerpt = '';
     if (Array.isArray(blocks)) {
       for (const block of blocks) {
         if (block.content && Array.isArray(block.content)) {
           for (const item of block.content) {
             if (item.text) {
               excerpt += item.text + ' ';
               if (excerpt.length > 150) break;
             }
           }
         }
         if (excerpt.length > 150) break;
       }
     }
     
     if (excerpt.trim()) {
       return (
         <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted p-4 overflow-hidden">
           <p className="text-xs text-muted-foreground line-clamp-6 leading-relaxed">
             {excerpt.trim()}
           </p>
         </div>
       );
     }
     
     return (
       <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
         <FileText className="h-10 w-10 text-muted-foreground/30" />
       </div>
     );
   }
   
   return (
     <div className="w-full h-full bg-muted flex items-center justify-center">
       <div className="h-8 w-8 rounded bg-muted-foreground/10" />
     </div>
   );
 }
 
 /**
  * Calculate preview height based on content density
  */
 export function getPreviewHeight(artifact: Artifact): string {
   const data = artifact.data as Record<string, unknown> | undefined;
   
   if (artifact.type === 'notes') {
     const blocks = data as unknown as Array<{ content?: Array<{ text?: string }> }> | undefined;
     if (Array.isArray(blocks) && blocks.length > 3) {
       return 'h-48';
     }
     return 'h-36';
   }
   
   if (artifact.type === 'diagram') {
     const nodes = (data?.nodes as Array<unknown>) || [];
     if (nodes.length > 5) return 'h-44';
     return 'h-36';
   }
   
   if (artifact.type === 'board') {
     const tasks = (data?.tasks as Record<string, unknown>) || {};
     if (Object.keys(tasks).length > 5) return 'h-44';
     return 'h-36';
   }
   
   // Canvas/Whiteboard - standard size
   return 'h-40';
 }