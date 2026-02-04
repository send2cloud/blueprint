import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KanbanCard } from './KanbanCard';

interface Card {
  id: string;
  title: string;
}

interface KanbanColumnProps {
  id: string;
  title: string;
  cards: Card[];
  onAddCard: (columnId: string, title: string) => void;
  onDeleteCard: (cardId: string) => void;
}

export function KanbanColumn({ id, title, cards, onAddCard, onDeleteCard }: KanbanColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      onAddCard(id, newCardTitle.trim());
      setNewCardTitle('');
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCard();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewCardTitle('');
    }
  };

  return (
    <div className="flex flex-col w-72 bg-muted/50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {cards.length}
        </span>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              flex-1 min-h-[200px] space-y-2 p-1 rounded-md transition-colors
              ${snapshot.isDraggingOver ? 'bg-accent/50' : ''}
            `}
          >
            {cards.map((card, index) => (
              <KanbanCard
                key={card.id}
                id={card.id}
                title={card.title}
                index={index}
                onDelete={onDeleteCard}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {isAdding ? (
        <div className="mt-2 space-y-2">
          <Input
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter card title..."
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddCard}>
              Add
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsAdding(false);
                setNewCardTitle('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full justify-start"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add card
        </Button>
      )}
    </div>
  );
}
