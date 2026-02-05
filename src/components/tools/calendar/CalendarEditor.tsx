 import { useState, useCallback, useMemo } from 'react';
 import { Calendar as BigCalendar, dateFnsLocalizer, Views, SlotInfo } from 'react-big-calendar';
 import { format, parse, startOfWeek, getDay, addHours } from 'date-fns';
 import { enUS } from 'date-fns/locale';
 import { Plus } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { EventModal } from './EventModal';
 import { CalendarEvent, CalendarData, deserializeEvent, serializeEvent } from './types';
 import 'react-big-calendar/lib/css/react-big-calendar.css';
 
 const locales = { 'en-US': enUS };
 
 const localizer = dateFnsLocalizer({
   format,
   parse,
   startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
   getDay,
   locales,
 });
 
 interface CalendarEditorProps {
   initialData?: unknown;
   onSave?: (data: unknown) => void;
   linkedEvents?: CalendarEvent[]; // Events from tasks/docs
 }
 
 export function CalendarEditor({ initialData, onSave, linkedEvents = [] }: CalendarEditorProps) {
   const [events, setEvents] = useState<CalendarEvent[]>(() => {
     if (initialData && typeof initialData === 'object') {
       const data = initialData as CalendarData;
       if (data.events && Array.isArray(data.events)) {
         return data.events.map((e) => deserializeEvent(e as unknown as Record<string, unknown>));
       }
     }
     return [];
   });
 
   const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
   const [modalOpen, setModalOpen] = useState(false);
   const [isNewEvent, setIsNewEvent] = useState(false);
   const [currentView, setCurrentView] = useState<(typeof Views)[keyof typeof Views]>(Views.MONTH);
   const [currentDate, setCurrentDate] = useState(new Date());
 
   // Combine manual events with linked events from tasks/docs
   const allEvents = useMemo(() => [...events, ...linkedEvents], [events, linkedEvents]);
 
   const saveEvents = useCallback((newEvents: CalendarEvent[]) => {
     if (onSave) {
       onSave({ events: newEvents.map(serializeEvent) });
     }
   }, [onSave]);
 
   const handleSelectEvent = useCallback((event: CalendarEvent) => {
     setSelectedEvent(event);
     setIsNewEvent(false);
     setModalOpen(true);
   }, []);
 
   const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
     const start = slotInfo.start;
     const end = slotInfo.end || addHours(start, 1);
     setSelectedEvent({
       id: '',
       title: '',
       start,
       end,
       allDay: slotInfo.action === 'click',
     });
     setIsNewEvent(true);
     setModalOpen(true);
   }, []);
 
   const handleSaveEvent = useCallback((event: CalendarEvent) => {
     // Don't save linked events, they're read-only
     if (event.sourceType && event.sourceType !== 'manual') return;
 
     setEvents((prev) => {
       const existing = prev.findIndex((e) => e.id === event.id);
       let newEvents: CalendarEvent[];
       if (existing >= 0) {
         newEvents = prev.map((e) => (e.id === event.id ? event : e));
       } else {
         newEvents = [...prev, event];
       }
       saveEvents(newEvents);
       return newEvents;
     });
   }, [saveEvents]);
 
   const handleDeleteEvent = useCallback((id: string) => {
     setEvents((prev) => {
       const newEvents = prev.filter((e) => e.id !== id);
       saveEvents(newEvents);
       return newEvents;
     });
   }, [saveEvents]);
 
   const handleAddEvent = () => {
     const now = new Date();
     setSelectedEvent({
       id: '',
       title: '',
       start: now,
       end: addHours(now, 1),
       allDay: false,
     });
     setIsNewEvent(true);
     setModalOpen(true);
   };
 
   const eventStyleGetter = (event: CalendarEvent) => {
     const isLinked = event.sourceType && event.sourceType !== 'manual';
     return {
       style: {
         backgroundColor: event.color || 'hsl(var(--primary))',
         borderRadius: '4px',
         opacity: isLinked ? 0.8 : 1,
         color: 'white',
         border: 'none',
         fontSize: '12px',
       },
     };
   };
 
   return (
     <div className="w-full h-full flex flex-col">
       <div className="flex justify-end p-4 pb-2">
         <Button onClick={handleAddEvent} size="sm">
           <Plus className="h-4 w-4 mr-2" />
           Add Event
         </Button>
       </div>
 
       <div className="flex-1 px-4 pb-4 calendar-container">
         <BigCalendar
           localizer={localizer}
           events={allEvents}
           startAccessor="start"
           endAccessor="end"
           view={currentView}
           onView={setCurrentView}
           date={currentDate}
           onNavigate={setCurrentDate}
           onSelectEvent={handleSelectEvent}
           onSelectSlot={handleSelectSlot}
           selectable
           eventPropGetter={eventStyleGetter}
           views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
           className="rounded-lg border bg-background"
           style={{ height: '100%' }}
         />
       </div>
 
       <EventModal
         event={selectedEvent}
         open={modalOpen}
         onOpenChange={setModalOpen}
         onSave={handleSaveEvent}
         onDelete={handleDeleteEvent}
         isNew={isNewEvent}
       />
     </div>
   );
 }