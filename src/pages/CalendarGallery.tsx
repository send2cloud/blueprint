 import { ArtifactGallery } from '@/components/gallery/ArtifactGallery';
 
 export default function CalendarGallery() {
   return (
     <ArtifactGallery
       type="calendar"
       newPath="/calendar/new"
       emptyTitle="No calendars yet"
       emptyDescription="Create your first calendar to organize events, meetings, and deadlines."
       newButtonLabel="New Calendar"
     />
   );
 }