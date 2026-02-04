import { Draggable } from '@hello-pangea/dnd';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KanbanCardProps {
  id: string;
  title: string;
  index: number;
  onDelete: (id: string) => void;
}

export function KanbanCard({ id, title, index, onDelete }: KanbanCardProps) {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            group relative p-3 rounded-md border border-border bg-card shadow-sm
            ${snapshot.isDragging ? 'shadow-lg ring-2 ring-ring' : ''}
          `}
        >
          <span className="text-sm text-card-foreground pr-6">{title}</span>
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onDelete(id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </Draggable>
  );
}
