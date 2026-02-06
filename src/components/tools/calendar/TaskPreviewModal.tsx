import { format } from 'date-fns';
import { Calendar, CheckSquare, MessageSquare, Tag, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import type { KanbanCard, TodoItem, CardLabel } from '@/components/tools/board/types';

interface TaskPreviewModalProps {
  card: KanbanCard | null;
  boardId: string | null;
  boardName: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskPreviewModal({
  card,
  boardId,
  boardName,
  open,
  onOpenChange,
}: TaskPreviewModalProps) {
  const navigate = useNavigate();

  if (!card) return null;

  const completedTodos = card.todos?.filter((t) => t.completed).length || 0;
  const totalTodos = card.todos?.length || 0;
  const todoProgress = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

  const handleOpenInBoard = () => {
    if (boardId) {
      navigate(`/board/${boardId}`);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-lg font-semibold leading-tight">
              {card.title}
            </DialogTitle>
          </div>
          {boardName && (
            <p className="text-xs text-muted-foreground mt-1">
              From board: {boardName}
            </p>
          )}
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 py-4">
            {/* Labels */}
            {card.labels && card.labels.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  Labels
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {card.labels.map((label: CardLabel) => (
                    <Badge
                      key={label.id}
                      style={{ backgroundColor: label.color }}
                      className="text-white text-xs"
                    >
                      {label.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Due Date */}
            {card.dueDate && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Due Date
                </div>
                <p className="text-sm">
                  {format(new Date(card.dueDate), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            )}

            {/* Description */}
            {card.description && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-sm whitespace-pre-wrap">{card.description}</p>
                </div>
              </>
            )}

            {/* Checklist */}
            {card.todos && card.todos.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <CheckSquare className="h-4 w-4" />
                      Checklist
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {completedTodos}/{totalTodos}
                    </span>
                  </div>
                  <Progress value={todoProgress} className="h-1.5" />
                  <ul className="space-y-1.5">
                    {card.todos.map((todo: TodoItem) => (
                      <li
                        key={todo.id}
                        className={`text-sm flex items-center gap-2 ${
                          todo.completed ? 'text-muted-foreground line-through' : ''
                        }`}
                      >
                        <span
                          className={`h-3.5 w-3.5 rounded-sm border flex-shrink-0 ${
                            todo.completed
                              ? 'bg-primary border-primary'
                              : 'border-muted-foreground/30'
                          }`}
                        />
                        {todo.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* Comments count */}
            {card.comments && card.comments.length > 0 && (
              <>
                <Separator />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  {card.comments.length} comment{card.comments.length !== 1 ? 's' : ''}
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 border-t flex-row justify-between gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {boardId && (
            <Button size="sm" onClick={handleOpenInBoard}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in Board
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
