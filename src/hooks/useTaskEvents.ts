import { useMemo, useCallback } from 'react';
import { useAllArtifacts } from './useArtifacts';
import { getStorageAdapter } from '../lib/storage';
import type { BoardData, KanbanCard } from '../components/tools/board/types';

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
  cardId: string;   // card ID for updates
  cardData: KanbanCard;
  boardName: string;
  tags?: string[];
}

/**
 * Hook that extracts calendar events from task due dates across all board artifacts.
 * Also provides save/delete handlers that update the source board.
 */
export function useTaskEvents() {
  const { artifacts, refresh } = useAllArtifacts();

  const events = useMemo(() => {
    const result: TaskCalendarEvent[] = [];

    const boards = artifacts.filter((a) => a.type === 'board');

    for (const board of boards) {
      const data = board.data as BoardData | undefined;
      if (!data?.columns) continue;

      for (const column of data.columns) {
        for (const card of column.cards) {
          if (card.dueDate) {
            const dueDate = new Date(card.dueDate);
            result.push({
              id: `task-${card.id}`,
              title: `📋 ${card.title}`,
              start: dueDate,
              end: dueDate,
              allDay: true,
              description: card.description,
              color: 'hsl(25, 95%, 53%)',
              sourceType: 'task',
              sourceId: board.id,
              cardId: card.id,
              cardData: card,
              boardName: board.name,
              tags: [`board:${board.name}`],
            });
          }
        }
      }
    }

    return result;
  }, [artifacts]);

  const saveCard = useCallback(async (boardId: string, updatedCard: KanbanCard) => {
    const board = artifacts.find((a) => a.id === boardId);
    if (!board) return;

    const data = board.data as BoardData;
    const updatedColumns = data.columns.map((col) => ({
      ...col,
      cards: col.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)),
    }));

    const storage = getStorageAdapter();
    await storage.saveArtifact({
      ...board,
      data: { columns: updatedColumns },
      updatedAt: new Date().toISOString(),
    });
    refresh();
  }, [artifacts, refresh]);

  const deleteCard = useCallback(async (boardId: string, cardId: string) => {
    const board = artifacts.find((a) => a.id === boardId);
    if (!board) return;

    const data = board.data as BoardData;
    const updatedColumns = data.columns.map((col) => ({
      ...col,
      cards: col.cards.filter((c) => c.id !== cardId),
    }));

    const storage = getStorageAdapter();
    await storage.saveArtifact({
      ...board,
      data: { columns: updatedColumns },
      updatedAt: new Date().toISOString(),
    });
    refresh();
  }, [artifacts, refresh]);

  return { events, saveCard, deleteCard };
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
