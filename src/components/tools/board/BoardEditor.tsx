import { useState, useCallback, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface KanbanCard {
  id: string;
  content: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}

interface BoardData {
  columns: KanbanColumn[];
}

interface BoardEditorProps {
  initialData?: unknown;
  onSave?: (data: unknown) => void;
}

const defaultColumns: KanbanColumn[] = [
  { id: 'todo', title: 'To Do', cards: [] },
  { id: 'in-progress', title: 'In Progress', cards: [] },
  { id: 'done', title: 'Done', cards: [] },
];

export function BoardEditor({ initialData, onSave }: BoardEditorProps) {
  const parsedData = useMemo(() => {
    if (initialData && typeof initialData === 'object') {
      const data = initialData as BoardData;
      return data.columns || defaultColumns;
    }
    return defaultColumns;
  }, [initialData]);

  const [columns, setColumns] = useState<KanbanColumn[]>(parsedData);
  const [newCardContent, setNewCardContent] = useState<Record<string, string>>({});

  const saveData = useCallback((newColumns: KanbanColumn[]) => {
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

  const addCard = useCallback((columnId: string) => {
    const content = newCardContent[columnId]?.trim();
    if (!content) return;

    setColumns((prevColumns) => {
      const newColumns = prevColumns.map((col) => {
        if (col.id === columnId) {
          return {
            ...col,
            cards: [...col.cards, { id: `card-${Date.now()}`, content }],
          };
        }
        return col;
      });
      saveData(newColumns);
      return newColumns;
    });

    setNewCardContent((prev) => ({ ...prev, [columnId]: '' }));
  }, [newCardContent, saveData]);

  const deleteCard = useCallback((columnId: string, cardId: string) => {
    setColumns((prevColumns) => {
      const newColumns = prevColumns.map((col) => {
        if (col.id === columnId) {
          return {
            ...col,
            cards: col.cards.filter((c) => c.id !== cardId),
          };
        }
        return col;
      });
      saveData(newColumns);
      return newColumns;
    });
  }, [saveData]);

  return (
    <div className="w-full h-full p-4 overflow-x-auto">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 h-full min-w-max">
          {columns.map((column) => (
            <div key={column.id} className="w-72 flex-shrink-0">
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{column.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-2">
                  <Droppable droppableId={column.id}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex-1 min-h-[100px]"
                      >
                        {column.cards.map((card, index) => (
                          <Draggable key={card.id} draggableId={card.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="mb-2 p-3 bg-muted rounded-md group flex items-start justify-between gap-2"
                              >
                                <span className="text-sm">{card.content}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => deleteCard(column.id, card.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a card..."
                      value={newCardContent[column.id] || ''}
                      onChange={(e) =>
                        setNewCardContent((prev) => ({ ...prev, [column.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addCard(column.id);
                        }
                      }}
                      className="text-sm"
                    />
                    <Button size="icon" variant="outline" onClick={() => addCard(column.id)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
