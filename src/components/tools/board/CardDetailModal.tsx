import { useState, useEffect, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Separator } from '../../ui/separator';
import { ScrollArea } from '../../ui/scroll-area';
import { KanbanCard, TodoItem, CardComment, CardLabel } from './types';
import { CardDescription } from './CardDescription';
import { CardTodoList } from './CardTodoList';
import { CardComments } from './CardComments';
import { CardLabels } from './CardLabels';
import { CardDueDate } from './CardDueDate';

interface CardDetailModalProps {
  card: KanbanCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (card: KanbanCard) => void;
  onDelete: () => void;
}

export function CardDetailModal({
  card,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: CardDetailModalProps) {
  const [editedCard, setEditedCard] = useState<KanbanCard | null>(card ? { ...card } : null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [prevCard, setPrevCard] = useState(card);

  if (card !== prevCard) {
    setPrevCard(card);
    setEditedCard(card ? { ...card } : null);
  }

  const handleUpdate = useCallback(
    (updates: Partial<KanbanCard>) => {
      if (!editedCard) return;
      const updated = {
        ...editedCard,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      setEditedCard(updated);
      onSave(updated);
    },
    [editedCard, onSave]
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editedCard) return;
    setEditedCard({ ...editedCard, title: e.target.value });
  };

  const handleTitleBlur = () => {
    setEditingTitle(false);
    if (editedCard) {
      handleUpdate({ title: editedCard.title });
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setEditingTitle(false);
      if (editedCard) {
        handleUpdate({ title: editedCard.title });
      }
    }
  };

  if (!editedCard) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          {editingTitle ? (
            <Input
              value={editedCard.title}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className="text-lg font-semibold"
              autoFocus
            />
          ) : (
            <DialogTitle
              className="cursor-pointer hover:bg-muted/50 p-2 -m-2 rounded"
              onClick={() => setEditingTitle(true)}
            >
              {editedCard.title}
            </DialogTitle>
          )}
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 py-4">
            {/* Labels & Due Date row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CardLabels
                labels={editedCard.labels || []}
                onChange={(labels: CardLabel[]) => handleUpdate({ labels })}
              />
              <CardDueDate
                dueDate={editedCard.dueDate}
                onChange={(dueDate) => handleUpdate({ dueDate })}
              />
            </div>

            <Separator />

            {/* Description */}
            <CardDescription
              description={editedCard.description}
              onChange={(description) => handleUpdate({ description })}
            />

            <Separator />

            {/* Checklist */}
            <CardTodoList
              todos={editedCard.todos || []}
              onChange={(todos: TodoItem[]) => handleUpdate({ todos })}
            />

            <Separator />

            {/* Comments */}
            <CardComments
              comments={editedCard.comments || []}
              onChange={(comments: CardComment[]) => handleUpdate({ comments })}
            />
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-4 border-t">
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Card
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}