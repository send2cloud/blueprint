import { useState, useCallback, useEffect } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { v4 as uuidv4 } from 'uuid';
import { KanbanColumn } from './KanbanColumn';

interface Card {
  id: string;
  title: string;
}

interface Column {
  id: string;
  title: string;
  cards: Card[];
}

interface KanbanData {
  columns: Column[];
}

interface KanbanBoardProps {
  initialData?: unknown;
  onSave?: (data: unknown) => void;
}

const defaultColumns: Column[] = [
  { id: 'ideas', title: 'Ideas', cards: [] },
  { id: 'in-progress', title: 'In Progress', cards: [] },
  { id: 'done', title: 'Done', cards: [] },
];

export function KanbanBoard({ initialData, onSave }: KanbanBoardProps) {
  const kanbanData = initialData as KanbanData | undefined;
  
  const [columns, setColumns] = useState<Column[]>(kanbanData?.columns || defaultColumns);
  const [initialized, setInitialized] = useState(false);

  // Mark as initialized after first render
  useEffect(() => {
    setInitialized(true);
  }, []);

  // Save on changes (after initialization)
  useEffect(() => {
    if (initialized && onSave) {
      onSave({ columns });
    }
  }, [columns, initialized, onSave]);

  const onDragEnd = useCallback((result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    setColumns((cols) => {
      const newColumns = [...cols];
      const sourceCol = newColumns.find((c) => c.id === source.droppableId);
      const destCol = newColumns.find((c) => c.id === destination.droppableId);

      if (!sourceCol || !destCol) return cols;

      const [movedCard] = sourceCol.cards.splice(source.index, 1);
      destCol.cards.splice(destination.index, 0, movedCard);

      return newColumns;
    });
  }, []);

  const addCard = useCallback((columnId: string, title: string) => {
    setColumns((cols) =>
      cols.map((col) =>
        col.id === columnId
          ? { ...col, cards: [...col.cards, { id: uuidv4(), title }] }
          : col
      )
    );
  }, []);

  const deleteCard = useCallback((cardId: string) => {
    setColumns((cols) =>
      cols.map((col) => ({
        ...col,
        cards: col.cards.filter((card) => card.id !== cardId),
      }))
    );
  }, []);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 p-4 overflow-x-auto h-full">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            cards={column.cards}
            onAddCard={addCard}
            onDeleteCard={deleteCard}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
