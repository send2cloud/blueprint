 import { ArtifactGallery } from '@/components/gallery/ArtifactGallery';
 import { TOOL_CONFIG } from '@/lib/toolConfig';
 
 const tool = TOOL_CONFIG.calendar;
 
 export default function CalendarGallery() {
   return (
     <ArtifactGallery
       toolType="calendar"
       title={tool.title}
       description={tool.description}
       icon={tool.icon}
       newPath="/calendar/new"
     />
   );
 }