 import { ReactNode } from 'react';
 import { Loader2, LucideIcon } from 'lucide-react';
 import { ToolHeader } from './ToolHeader';
 import { HiddenLlmPayload } from '@/components/llm/HiddenLlmPayload';
 import type { Artifact, ToolType } from '@/lib/storage';
 
 interface EditorPageWrapperProps {
   /** Tool title for the header */
   title: string;
   /** Tool icon */
   icon: LucideIcon;
   /** Current artifact (null during loading or error) */
   artifact: Artifact | null;
   /** Loading state */
   loading: boolean;
   /** Error message if load failed */
   error: string | null;
   /** Whether the artifact is currently being saved */
   saving?: boolean;
   /** Callback to rename the artifact */
   onRename?: (name: string) => void;
   /** Callback to toggle favorite status */
   onToggleFavorite?: () => void;
   /** The editor component to render when artifact is loaded */
   children: ReactNode;
 }
 
 /**
  * Shared wrapper for all editor pages (Canvas, Diagram, Board, Notes).
  * Handles loading/error states and provides consistent layout.
  */
 export function EditorPageWrapper({
   title,
   icon,
   artifact,
   loading,
   error,
   saving,
   onRename,
   onToggleFavorite,
   children,
 }: EditorPageWrapperProps) {
   if (loading) {
     return (
       <div className="flex flex-col h-full">
         <ToolHeader title={title} icon={icon} />
         <div className="flex-1 flex items-center justify-center">
           <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
         </div>
       </div>
     );
   }
 
   if (error || !artifact) {
     return (
       <div className="flex flex-col h-full">
         <ToolHeader title={title} icon={icon} />
         <div className="flex-1 flex items-center justify-center">
           <p className="text-destructive">{error || 'Failed to load'}</p>
         </div>
       </div>
     );
   }
 
   return (
     <div className="flex flex-col h-full">
       <ToolHeader
         title={title}
         icon={icon}
         artifactId={artifact.id}
         artifactName={artifact.name}
         artifactType={artifact.type}
         artifactFavorite={artifact.favorite}
         saving={saving}
         onRename={onRename}
         onToggleFavorite={onToggleFavorite}
       />
       <HiddenLlmPayload artifact={artifact} />
       <div className="flex-1 overflow-hidden">
         {children}
       </div>
     </div>
   );
 }