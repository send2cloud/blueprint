import { useState, useCallback, useEffect } from 'react';
import { CalendarEvent } from '@/components/tools/calendar/types';
import { getStorageAdapter } from '@/lib/storage/adapter';
import type { CalendarEventRecord } from '@/lib/storage/types';

/**
 * Convert a CalendarEvent (with Date objects) to a CalendarEventRecord (with ISO strings)
 */
function toRecord(event: CalendarEvent): CalendarEventRecord {
  return {
    id: event.id,
    title: event.title,
    start: event.start.toISOString(),
    end: event.end.toISOString(),
    allDay: event.allDay,
    description: event.description,
    color: event.color,
    tags: event.tags,
    sourceType: event.sourceType,
    sourceId: event.sourceId,
  };
}

/**
 * Convert a CalendarEventRecord (with ISO strings) to a CalendarEvent (with Date objects)
 */
function fromRecord(record: CalendarEventRecord): CalendarEvent {
  return {
    id: record.id,
    title: record.title,
    start: new Date(record.start),
    end: new Date(record.end),
    allDay: record.allDay,
    description: record.description,
    color: record.color,
    tags: record.tags,
    sourceType: record.sourceType,
    sourceId: record.sourceId,
  };
}

/**
 * Hook for managing global calendar events using the storage adapter
 * (syncs to InstantDB when configured, otherwise localStorage)
 */
export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Load events on mount
  useEffect(() => {
    let cancelled = false;
    
    async function load() {
      try {
        const adapter = getStorageAdapter();
        const records = await adapter.listCalendarEvents();
        if (!cancelled) {
          setEvents(records.map(fromRecord));
        }
      } catch (e) {
        console.error('Failed to load calendar events:', e);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    
    load();
    return () => { cancelled = true; };
  }, []);

  const saveEvent = useCallback(async (event: CalendarEvent) => {
    try {
      const adapter = getStorageAdapter();
      console.log('[Calendar] Saving event, adapter:', adapter.constructor.name, 'event:', event.id);
      await adapter.saveCalendarEvent(toRecord(event));
      console.log('[Calendar] Event saved successfully');
      setEvents((prev) => {
        const exists = prev.some((e) => e.id === event.id);
        if (exists) {
          return prev.map((e) => (e.id === event.id ? event : e));
        }
        return [...prev, event];
      });
    } catch (e) {
      console.error('Failed to save calendar event:', e);
    }
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    try {
      const adapter = getStorageAdapter();
      await adapter.deleteCalendarEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (e) {
      console.error('Failed to delete calendar event:', e);
    }
  }, []);

  return {
    events,
    loading,
    saveEvent,
    deleteEvent,
  };
}
