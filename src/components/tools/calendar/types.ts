 // Calendar event type definitions
 
 export interface CalendarEvent {
   id: string;
   title: string;
   start: Date;
   end: Date;
   allDay?: boolean;
   description?: string;
   color?: string;
   sourceType?: 'manual' | 'task' | 'doc';
   sourceId?: string; // Reference to the source artifact
 }
 
 export interface CalendarData {
   events: CalendarEvent[];
 }
 
 export const EVENT_COLORS = [
   { id: 'blue', name: 'Blue', color: 'hsl(199, 89%, 48%)' },
   { id: 'green', name: 'Green', color: 'hsl(142, 76%, 36%)' },
   { id: 'purple', name: 'Purple', color: 'hsl(262, 83%, 58%)' },
   { id: 'orange', name: 'Orange', color: 'hsl(25, 95%, 53%)' },
   { id: 'red', name: 'Red', color: 'hsl(0, 84%, 60%)' },
   { id: 'teal', name: 'Teal', color: 'hsl(174, 72%, 40%)' },
 ];
 
 export function serializeEvent(event: CalendarEvent): Record<string, unknown> {
   return {
     ...event,
     start: event.start.toISOString(),
     end: event.end.toISOString(),
   };
 }
 
 export function deserializeEvent(raw: Record<string, unknown>): CalendarEvent {
   return {
     id: raw.id as string,
     title: raw.title as string,
     start: new Date(raw.start as string),
     end: new Date(raw.end as string),
     allDay: raw.allDay as boolean | undefined,
     description: raw.description as string | undefined,
     color: raw.color as string | undefined,
     sourceType: raw.sourceType as 'manual' | 'task' | 'doc' | undefined,
     sourceId: raw.sourceId as string | undefined,
   };
 }