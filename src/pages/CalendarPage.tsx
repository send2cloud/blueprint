 import { useParams } from 'react-router-dom';
 import { EditorPageWrapper } from '@/components/layout/EditorPageWrapper';
 import { CalendarEditor } from '@/components/tools/calendar/CalendarEditor';
 import { useArtifact } from '@/hooks/useArtifact';
 import { TOOL_CONFIG } from '@/lib/toolConfig';
 
 const tool = TOOL_CONFIG.calendar;
 
 export default function CalendarPage() {
   const { id } = useParams<{ id: string }>();
   const { artifact, loading, error, saving, save, rename, toggleFavorite } = useArtifact('calendar', id || 'new');
 
   return (
     <EditorPageWrapper
       title={tool.title}
       icon={tool.icon}
       artifact={artifact}
       loading={loading}
       error={error}
       saving={saving}
       onRename={rename}
       onToggleFavorite={toggleFavorite}
     >
       <CalendarEditor initialData={artifact?.data} onSave={save} />
     </EditorPageWrapper>
   );
 }