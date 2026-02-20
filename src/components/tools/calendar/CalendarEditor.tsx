import { useState, useCallback, useMemo } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views, SlotInfo } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addHours } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { EventModal } from './EventModal';
import { YearlyView } from './YearlyView';
import { CalendarToolbar } from './CalendarToolbar';
import { useCalendarNavigation } from './useCalendarNavigation';
import { useCalendarConfig } from './useCalendarConfig';
import { CalendarEvent } from './types';
import { CardDetailModal } from '../board/CardDetailModal';
import type { TaskCalendarEvent } from '../../../hooks/useTaskEvents';
import type { KanbanCard } from '../board/types';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };

const EMPTY_LINKED_EVENTS: TaskCalendarEvent[] = [];

interface CalendarEditorProps {
  events: CalendarEvent[];
  onSaveEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  linkedEvents?: TaskCalendarEvent[];
  onSaveCard?: (boardId: string, card: KanbanCard) => void;
  onDeleteCard?: (boardId: string, cardId: string) => void;
}

export function CalendarEditor({
  events,
  onSaveEvent,
  onDeleteEvent,
  linkedEvents = EMPTY_LINKED_EVENTS,
  onSaveCard,
  onDeleteCard,
}: CalendarEditorProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isNewEvent, setIsNewEvent] = useState(false);

  // Task card modal state
  const [selectedTaskEvent, setSelectedTaskEvent] = useState<TaskCalendarEvent | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const { config, updateConfig } = useCalendarConfig();
  const { currentView, setCurrentView, currentDate, setCurrentDate, navigate } = useCalendarNavigation();

  // Create localizer with dynamic week start
  const localizer = useMemo(() => dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: config.weekStartsOn }),
    getDay,
    locales,
  }), [config.weekStartsOn]);

  // Combine manual events with linked events from tasks
  const allEvents = useMemo(() => [...events, ...linkedEvents], [events, linkedEvents]);

  const handleSelectEvent = useCallback((event: CalendarEvent | TaskCalendarEvent) => {
    // Check if this is a task event
    if ('cardData' in event && event.sourceType === 'task') {
      setSelectedTaskEvent(event);
      setTaskModalOpen(true);
    } else {
      setSelectedEvent(event as CalendarEvent);
      setIsNewEvent(false);
      setModalOpen(true);
    }
  }, []);

  const handleSaveCard = useCallback((card: KanbanCard) => {
    if (selectedTaskEvent && onSaveCard) {
      onSaveCard(selectedTaskEvent.sourceId, card);
    }
  }, [selectedTaskEvent, onSaveCard]);

  const handleDeleteCard = useCallback(() => {
    if (selectedTaskEvent && onDeleteCard) {
      onDeleteCard(selectedTaskEvent.sourceId, selectedTaskEvent.cardId);
      setTaskModalOpen(false);
    }
  }, [selectedTaskEvent, onDeleteCard]);

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

  const handleAddEvent = useCallback(() => {
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
  }, []);

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
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
  }, []);

  const handleNavigate = useCallback((direction: 'prev' | 'next' | 'today' | Date) => {
    navigate(direction);
  }, [navigate]);

  return (
    <div className="w-full h-full flex flex-col">
      <CalendarToolbar
        currentDate={currentDate}
        currentView={currentView}
        config={config}
        onNavigate={handleNavigate}
        onViewChange={setCurrentView}
        onConfigChange={updateConfig}
        onAddEvent={handleAddEvent}
      />

      <div className="flex-1 px-4 pb-4 calendar-container">
        {currentView === 'year' ? (
          <YearlyView
            date={currentDate}
            events={allEvents}
            onSelectEvent={handleSelectEvent}
            onNavigate={handleNavigate}
            weekStartsOn={config.weekStartsOn}
          />
        ) : (
          <BigCalendar
            localizer={localizer}
            events={allEvents}
            startAccessor="start"
            endAccessor="end"
            view={currentView as any}
            onView={setCurrentView}
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
        onDelete={onDeleteEvent}
        isNew={isNewEvent}
      />

      <CardDetailModal
        card={selectedTaskEvent?.cardData ?? null}
        open={taskModalOpen}
        onOpenChange={setTaskModalOpen}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
      />
    </div>
  );
}
