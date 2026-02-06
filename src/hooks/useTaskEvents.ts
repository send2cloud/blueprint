import { useMemo } from 'react';
import { useAllArtifacts } from './useArtifacts';
import type { BoardData, KanbanCard } from '@/components/tools/board/types';

/**
 * Extended calendar event that includes the full task card data
 */
export interface TaskCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  description?: string;
  color: string;
  sourceType: 'task';
  sourceId: string; // board ID
  cardData: KanbanCard;
  boardName: string;
  tags?: string[];
}

/**
 * Hook that extracts calendar events from task due dates across all board artifacts.
 * This enables the Task→Calendar integration.
 */
export function useTaskEvents(): TaskCalendarEvent[] {
  const { artifacts } = useAllArtifacts();

  return useMemo(() => {
    const events: TaskCalendarEvent[] = [];

    // Filter to only board artifacts
    const boards = artifacts.filter((a) => a.type === 'board');

    for (const board of boards) {
      const data = board.data as BoardData | undefined;
      if (!data?.columns) continue;

      for (const column of data.columns) {
        for (const card of column.cards) {
          if (card.dueDate) {
            const dueDate = new Date(card.dueDate);
            // Create an all-day event for the due date with full card data
            events.push({
              id: `task-${card.id}`,
              title: `📋 ${card.title}`,
              start: dueDate,
              end: dueDate,
              allDay: true,
              description: card.description,
              color: 'hsl(25, 95%, 53%)', // Orange for tasks
              sourceType: 'task',
              sourceId: board.id,
              cardData: card,
              boardName: board.name,
              tags: [`board:${board.name}`],
            });
          }
        }
      }
    }

    return events;
  }, [artifacts]);
}

/**
 * Extract all cards with due dates from boards (for relationship graph)
 */
export function extractTasksWithDueDates(artifacts: { id: string; name: string; type: string; data: unknown }[]): {
  card: KanbanCard;
  boardId: string;
  boardName: string;
  columnTitle: string;
}[] {
  const tasks: { card: KanbanCard; boardId: string; boardName: string; columnTitle: string }[] = [];

  const boards = artifacts.filter((a) => a.type === 'board');

  for (const board of boards) {
    const data = board.data as BoardData | undefined;
    if (!data?.columns) continue;

    for (const column of data.columns) {
      for (const card of column.cards) {
        if (card.dueDate) {
          tasks.push({
            card,
            boardId: board.id,
            boardName: board.name,
            columnTitle: column.title,
          });
        }
      }
    }
  }

  return tasks;
}
