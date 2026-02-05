import { Loader2 } from 'lucide-react';
import { CalendarEditor } from '@/components/tools/calendar/CalendarEditor';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { TOOL_CONFIG } from '@/lib/toolConfig';

const tool = TOOL_CONFIG.calendar;

export default function CalendarPage() {
  const { events, loading, saveEvent, deleteEvent } = useCalendarEvents();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 border-b border-border bg-background px-4 py-3">
        <tool.icon className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-lg font-semibold text-foreground">Calendar</h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <CalendarEditor 
          events={events}
          onSaveEvent={saveEvent}
          onDeleteEvent={deleteEvent}
        />
      </div>
    </div>
  );
}