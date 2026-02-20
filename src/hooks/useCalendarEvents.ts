import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarEvent } from '../components/tools/calendar/types';
import { getStorageAdapter } from '../lib/storage/adapter';
import type { CalendarEventRecord } from '../lib/storage/types';

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

const QUERY_KEY = ['calendar-events'];

/**
 * Hook for managing global calendar events using TanStack Query
 * (syncs to InstantDB when configured, otherwise localStorage)
 */
export function useCalendarEvents() {
  const queryClient = useQueryClient();
  const storage = useMemo(() => getStorageAdapter(), []);

  // 1. Fetch data using useQuery
  const { data: events = [], isLoading: loading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const records = await storage.listCalendarEvents();
      return records.map(fromRecord);
    },
    // Keep data fresh, especially if multiple tabs are open
    staleTime: 1000 * 30, // 30 seconds
  });

  // 2. Wrap save logic in useMutation
  const saveMutation = useMutation({
    mutationFn: (event: CalendarEvent) => storage.saveCalendarEvent(toRecord(event)),
    // Optimistic Update: update UI immediately before server confirms
    onMutate: async (newEvent) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousEvents = queryClient.getQueryData<CalendarEvent[]>(QUERY_KEY);

      queryClient.setQueryData<CalendarEvent[]>(QUERY_KEY, (prev = []) => {
        const exists = prev.some((e) => e.id === newEvent.id);
        if (exists) {
          return prev.map((e) => (e.id === newEvent.id ? newEvent : e));
        }
        return [...prev, newEvent];
      });

      return { previousEvents };
    },
    // If it fails, roll back to previous state
    onError: (err, newEvent, context) => {
      queryClient.setQueryData(QUERY_KEY, context?.previousEvents);
      console.error('Failed to save calendar event:', err);
    },
    // Always refetch after success or error to stay in sync
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  // 3. Wrap delete logic in useMutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => storage.deleteCalendarEvent(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousEvents = queryClient.getQueryData<CalendarEvent[]>(QUERY_KEY);

      queryClient.setQueryData<CalendarEvent[]>(QUERY_KEY, (prev = []) =>
        prev.filter((e) => e.id !== id)
      );

      return { previousEvents };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(QUERY_KEY, context?.previousEvents);
      console.error('Failed to delete calendar event:', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const saveEvent = useCallback(
    async (event: CalendarEvent) => {
      saveMutation.mutate(event);
    },
    [saveMutation],
  );

  const deleteEvent = useCallback(
    async (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation],
  );

  return {
    events,
    loading,
    saveEvent,
    deleteEvent,
  };
}

