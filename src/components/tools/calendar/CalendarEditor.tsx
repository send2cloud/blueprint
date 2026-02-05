import { useState, useCallback, useMemo } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views, SlotInfo } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addHours, addMonths, subMonths } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventModal } from './EventModal';
import { QuarterlyView } from './QuarterlyView';
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

type ViewType = 'day' | 'week' | 'month' | 'quarter' | 'agenda';

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
  const [currentView, setCurrentView] = useState<ViewType>('month');
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

  const handleNavigate = (direction: 'prev' | 'next' | 'today' | Date) => {
    if (direction === 'today') {
      setCurrentDate(new Date());
    } else if (direction instanceof Date) {
      setCurrentDate(direction);
      if (currentView === 'quarter') {
        setCurrentView('day');
      }
    } else {
      const delta = direction === 'prev' ? -1 : 1;
      if (currentView === 'quarter') {
        setCurrentDate(prev => delta > 0 ? addMonths(prev, 3) : subMonths(prev, 3));
      } else {
        // Let BigCalendar handle navigation for other views
        setCurrentDate(prev => {
          if (currentView === 'day') return new Date(prev.setDate(prev.getDate() + delta));
          if (currentView === 'week') return new Date(prev.setDate(prev.getDate() + delta * 7));
          if (currentView === 'month') return delta > 0 ? addMonths(prev, 1) : subMonths(prev, 1);
          return prev;
        });
      }
    }
  };

  const getQuarterLabel = () => {
    const q = Math.floor(currentDate.getMonth() / 3) + 1;
    return `Q${q} ${format(currentDate, 'yyyy')}`;
  };

  const viewLabels: Record<ViewType, string> = {
    day: 'Day',
    week: 'Week',
    month: 'Month',
    quarter: 'Quarter',
    agenda: 'Agenda',
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center p-4 pb-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleNavigate('today')}>
            Today
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleNavigate('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleNavigate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="font-medium ml-2">
            {currentView === 'quarter' ? getQuarterLabel() : format(currentDate, 'MMMM yyyy')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex border rounded-md overflow-hidden">
            {(['day', 'week', 'month', 'quarter', 'agenda'] as ViewType[]).map((view) => (
              <Button
                key={view}
                variant={currentView === view ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none border-0"
                onClick={() => setCurrentView(view)}
              >
                {viewLabels[view]}
              </Button>
            ))}
          </div>
          <Button onClick={handleAddEvent} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      <div className="flex-1 px-4 pb-4 calendar-container">
        {currentView === 'quarter' ? (
          <QuarterlyView
            date={currentDate}
            events={allEvents}
            onSelectEvent={handleSelectEvent}
            onNavigate={(date) => handleNavigate(date)}
          />
        ) : (
          <BigCalendar
            localizer={localizer}
            events={allEvents}
            startAccessor="start"
            endAccessor="end"
            view={currentView === 'quarter' ? Views.MONTH : currentView as typeof Views[keyof typeof Views]}
            onView={(view) => setCurrentView(view as ViewType)}
            date={currentDate}
            onNavigate={setCurrentDate}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            eventPropGetter={eventStyleGetter}
            views={[Views.DAY, Views.WEEK, Views.MONTH, Views.AGENDA]}
            toolbar={false}
            className="rounded-lg border bg-background"
            style={{ height: '100%' }}
          />
        )}
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