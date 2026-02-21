import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCalendarEvents } from './useCalendarEvents';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getStorageAdapter } from '../lib/storage/adapter';
import { CalendarEvent } from '../components/tools/calendar/types';

// Mock dependencies
vi.mock('../lib/storage/adapter', () => ({
    getStorageAdapter: vi.fn(),
}));

vi.mock('../contexts/BlueprintContext', () => ({
    useBlueprint: () => ({
        currentProjectId: null,
    }),
}));

// Setup Test Wrapper
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe('useCalendarEvents', () => {
    const mockStorage = {
        listCalendarEvents: vi.fn(),
        saveCalendarEvent: vi.fn(),
        deleteCalendarEvent: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (getStorageAdapter as any).mockReturnValue(mockStorage);
    });

    it('fetches events on mount', async () => {
        const mockEvents = [
            {
                id: '1',
                title: 'Meeting',
                start: '2026-02-06T10:00:00.000Z',
                end: '2026-02-06T11:00:00.000Z',
                allDay: false,
            },
        ];
        mockStorage.listCalendarEvents.mockResolvedValue(mockEvents);

        const { result } = renderHook(() => useCalendarEvents(), {
            wrapper: createWrapper(),
        });

        expect(result.current.loading).toBe(true);

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.events).toHaveLength(1);
        expect(result.current.events[0].title).toBe('Meeting');
        expect(result.current.events[0].start).toBeInstanceOf(Date);
    });

    it('optimistically updates on save', async () => {
        mockStorage.listCalendarEvents.mockResolvedValue([]);
        mockStorage.saveCalendarEvent.mockImplementation(async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
        });

        const { result } = renderHook(() => useCalendarEvents(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.loading).toBe(false));

        const newEvent: CalendarEvent = {
            id: '99',
            title: 'New Event',
            start: new Date('2026-02-07T10:00:00Z'),
            end: new Date('2026-02-07T11:00:00Z'),
            allDay: false,
            sourceType: 'manual',
            sourceId: undefined,
            description: undefined,
            color: undefined,
            tags: undefined
        };

        result.current.saveEvent(newEvent);

        await waitFor(() => {
            expect(result.current.events).toHaveLength(1);
            expect(result.current.events[0].title).toBe('New Event');
        });

        expect(mockStorage.saveCalendarEvent).toHaveBeenCalled();
    });
});
