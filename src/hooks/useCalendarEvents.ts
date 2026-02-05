import { useState, useCallback, useEffect } from 'react';
import { CalendarEvent, serializeEvent, deserializeEvent } from '@/components/tools/calendar/types';

const STORAGE_KEY = 'blueprint:calendar:events';

/**
 * Simple hook for managing global calendar events (not artifact-based)
 */
export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Load events on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as unknown[];
        const deserialized = parsed.map((e) => deserializeEvent(e as Record<string, unknown>));
        setEvents(deserialized);
      }
    } catch (e) {
      console.error('Failed to load calendar events:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save events whenever they change
  const saveEvents = useCallback((newEvents: CalendarEvent[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newEvents.map(serializeEvent)));
    } catch (e) {
      console.error('Failed to save calendar events:', e);
    }
  }, []);

  const addEvent = useCallback((event: CalendarEvent) => {
    setEvents((prev) => {
      const updated = [...prev, event];
      saveEvents(updated);
      return updated;
    });
  }, [saveEvents]);

  const updateEvent = useCallback((event: CalendarEvent) => {
    setEvents((prev) => {
      const updated = prev.map((e) => (e.id === event.id ? event : e));
      saveEvents(updated);
      return updated;
    });
  }, [saveEvents]);

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      saveEvents(updated);
      return updated;
    });
  }, [saveEvents]);

  const saveEvent = useCallback((event: CalendarEvent) => {
    const exists = events.some((e) => e.id === event.id);
    if (exists) {
      updateEvent(event);
    } else {
      addEvent(event);
    }
  }, [events, addEvent, updateEvent]);

  return {
    events,
    loading,
    addEvent,
    updateEvent,
    deleteEvent,
    saveEvent,
  };
}
