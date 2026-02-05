import { useState, useCallback, useMemo, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views, SlotInfo } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addHours, addMonths, subMonths, addYears, subYears } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventModal } from './EventModal';
import { YearlyView } from './YearlyView';
import { CalendarSettings, CalendarConfig } from './CalendarSettings';
import { CalendarEvent } from './types';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };

const SETTINGS_KEY = 'blueprint:calendar:settings';

const defaultConfig: CalendarConfig = {
  weekStartsOn: 1, // Monday
  dayStartHour: 6,
  dayEndHour: 21,
};

type ViewType = 'day' | 'week' | 'month' | 'year' | 'agenda';

interface CalendarEditorProps {
  events: CalendarEvent[];
  onSaveEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  linkedEvents?: CalendarEvent[]; // Events from tasks/docs
}

export function CalendarEditor({ events, onSaveEvent, onDeleteEvent, linkedEvents = [] }: CalendarEditorProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isNewEvent, setIsNewEvent] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [config, setConfig] = useState<CalendarConfig>(defaultConfig);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        setConfig(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load calendar settings:', e);
    }
  }, []);

  const handleConfigChange = useCallback((newConfig: CalendarConfig) => {
    setConfig(newConfig);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newConfig));
  }, []);

  // Create localizer with dynamic week start
  const localizer = useMemo(() => dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: config.weekStartsOn }),
    getDay,
    locales,
  }), [config.weekStartsOn]);

  // Combine manual events with linked events from tasks/docs
  const allEvents = useMemo(() => [...events, ...linkedEvents], [events, linkedEvents]);

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
    onSaveEvent(event);
  }, [onSaveEvent]);

  const handleDeleteEvent = useCallback((id: string) => {
    onDeleteEvent(id);
  }, [onDeleteEvent]);

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
      if (currentView === 'year') {
        setCurrentView('day');
      }
    } else {
      const delta = direction === 'prev' ? -1 : 1;
      if (currentView === 'year') {
        setCurrentDate(prev => delta > 0 ? addYears(prev, 1) : subYears(prev, 1));
      } else {
        setCurrentDate(prev => {
          if (currentView === 'day') return new Date(prev.setDate(prev.getDate() + delta));
          if (currentView === 'week') return new Date(prev.setDate(prev.getDate() + delta * 7));
          if (currentView === 'month') return delta > 0 ? addMonths(prev, 1) : subMonths(prev, 1);
          return prev;
        });
      }
    }
  };

  const getViewLabel = () => {
    if (currentView === 'year') return format(currentDate, 'yyyy');
    return format(currentDate, 'MMMM yyyy');
  };

  const viewLabels: Record<ViewType, string> = {
    day: 'Day',
    week: 'Week',
    month: 'Month',
    year: 'Year',
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
            {getViewLabel()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex border rounded-md overflow-hidden">
            {(['day', 'week', 'month', 'year', 'agenda'] as ViewType[]).map((view) => (
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
          <CalendarSettings config={config} onConfigChange={handleConfigChange} />
          <Button onClick={handleAddEvent} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      <div className="flex-1 px-4 pb-4 calendar-container">
        {currentView === 'year' ? (
          <YearlyView
            date={currentDate}
            events={allEvents}
            onSelectEvent={handleSelectEvent}
            onNavigate={(date) => handleNavigate(date)}
            weekStartsOn={config.weekStartsOn}
          />
        ) : (
          <BigCalendar
            localizer={localizer}
            events={allEvents}
            startAccessor="start"
            endAccessor="end"
            view={currentView as typeof Views[keyof typeof Views]}
            onView={(view) => setCurrentView(view as ViewType)}
            date={currentDate}
            onNavigate={setCurrentDate}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            eventPropGetter={eventStyleGetter}
            views={[Views.DAY, Views.WEEK, Views.MONTH, Views.AGENDA]}
            toolbar={false}
            min={new Date(1970, 0, 1, config.dayStartHour, 0, 0)}
            max={new Date(1970, 0, 1, config.dayEndHour, 0, 0)}
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
