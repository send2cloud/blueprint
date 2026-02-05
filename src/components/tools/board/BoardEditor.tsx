 import { useState, useCallback, useMemo } from 'react';
 import { DragDropContext, DropResult } from '@hello-pangea/dnd';
 import { KanbanColumn } from './KanbanColumn';
 import { CardDetailModal } from './CardDetailModal';
 import {
   KanbanCard,
   KanbanColumn as KanbanColumnType,
   BoardData,
   migrateCard,
 } from './types';

interface BoardEditorProps {
  initialData?: unknown;
  onSave?: (data: unknown) => void;
}

 const defaultColumns: KanbanColumnType[] = [
  { id: 'todo', title: 'To Do', cards: [] },
  { id: 'in-progress', title: 'In Progress', cards: [] },
  { id: 'done', title: 'Done', cards: [] },
];

export function BoardEditor({ initialData, onSave }: BoardEditorProps) {
   const parsedData = useMemo((): KanbanColumnType[] => {
    if (initialData && typeof initialData === 'object') {
      const data = initialData as BoardData;
       if (data.columns) {
         // Migrate old card format to new
         return data.columns.map((col) => ({
           ...col,
           cards: col.cards.map((card) => migrateCard(card as any)),
         }));
       }
       return defaultColumns;
    }
    return defaultColumns;
  }, [initialData]);

   const [columns, setColumns] = useState<KanbanColumnType[]>(parsedData);
   const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
   const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
   const [modalOpen, setModalOpen] = useState(false);

   const saveData = useCallback((newColumns: KanbanColumnType[]) => {
    if (onSave) {
      onSave({ columns: newColumns });
    }
  }, [onSave]);

  const onDragEnd = useCallback((result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    setColumns((prevColumns) => {
      const newColumns = [...prevColumns];
      const sourceColIndex = newColumns.findIndex((c) => c.id === source.droppableId);
      const destColIndex = newColumns.findIndex((c) => c.id === destination.droppableId);

      if (sourceColIndex === -1 || destColIndex === -1) return prevColumns;

      const sourceCol = { ...newColumns[sourceColIndex], cards: [...newColumns[sourceColIndex].cards] };
      const [movedCard] = sourceCol.cards.splice(source.index, 1);

      if (source.droppableId === destination.droppableId) {
        sourceCol.cards.splice(destination.index, 0, movedCard);
        newColumns[sourceColIndex] = sourceCol;
      } else {
        const destCol = { ...newColumns[destColIndex], cards: [...newColumns[destColIndex].cards] };
        destCol.cards.splice(destination.index, 0, movedCard);
        newColumns[sourceColIndex] = sourceCol;
        newColumns[destColIndex] = destCol;
      }

      saveData(newColumns);
      return newColumns;
    });
  }, [saveData]);

   const addCard = useCallback((columnId: string, title: string) => {
     const now = new Date().toISOString();
     const newCard: KanbanCard = {
       id: `card-${Date.now()}`,
       title,
       todos: [],
       comments: [],
       labels: [],
       createdAt: now,
       updatedAt: now,
     };
    setColumns((prevColumns) => {
      const newColumns = prevColumns.map((col) => {
        if (col.id === columnId) {
           return { ...col, cards: [...col.cards, newCard] };
        }
        return col;
      });
      saveData(newColumns);
      return newColumns;
    });
   }, [saveData]);

  const deleteCard = useCallback((columnId: string, cardId: string) => {
    setColumns((prevColumns) => {
      const newColumns = prevColumns.map((col) => {
        if (col.id === columnId) {
           return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
        }
        return col;
      });
      saveData(newColumns);
      return newColumns;
    });
     setModalOpen(false);
     setSelectedCard(null);
     setSelectedColumnId(null);
  }, [saveData]);

   const handleCardClick = useCallback((card: KanbanCard, columnId: string) => {
     setSelectedCard(card);
     setSelectedColumnId(columnId);
     setModalOpen(true);
   }, []);
 
   const handleCardSave = useCallback((updatedCard: KanbanCard) => {
     setColumns((prevColumns) => {
       const newColumns = prevColumns.map((col) => ({
         ...col,
         cards: col.cards.map((c) =>
           c.id === updatedCard.id ? updatedCard : c
         ),
       }));
       saveData(newColumns);
       return newColumns;
     });
     setSelectedCard(updatedCard);
   }, [saveData]);
 
  return (
     <>
       <div className="w-full h-full p-4 overflow-x-auto">
         <DragDropContext onDragEnd={onDragEnd}>
           <div className="flex gap-4 h-full min-w-max">
             {columns.map((column) => (
               <KanbanColumn
                 key={column.id}
                 column={column}
                 onAddCard={addCard}
                 onCardClick={(card) => handleCardClick(card, column.id)}
                 onDeleteCard={deleteCard}
               />
             ))}
           </div>
         </DragDropContext>
       </div>
 
       <CardDetailModal
         card={selectedCard}
         open={modalOpen}
         onOpenChange={setModalOpen}
         onSave={handleCardSave}
         onDelete={() => {
           if (selectedColumnId && selectedCard) {
             deleteCard(selectedColumnId, selectedCard.id);
           }
         }}
       />
     </>
  );
}
