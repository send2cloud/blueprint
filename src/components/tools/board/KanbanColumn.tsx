 import { Droppable } from '@hello-pangea/dnd';
 import { Plus } from 'lucide-react';
 import { useState } from 'react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { KanbanCardItem } from './KanbanCard';
 import { KanbanCard, KanbanColumn as KanbanColumnType } from './types';
 
 interface KanbanColumnProps {
   column: KanbanColumnType;
   onAddCard: (columnId: string, title: string) => void;
   onCardClick: (card: KanbanCard) => void;
   onDeleteCard: (columnId: string, cardId: string) => void;
 }
 
 export function KanbanColumn({ column, onAddCard, onCardClick, onDeleteCard }: KanbanColumnProps) {
   const [newCardTitle, setNewCardTitle] = useState('');
 
   const handleAddCard = () => {
     const trimmed = newCardTitle.trim();
     if (!trimmed) return;
     onAddCard(column.id, trimmed);
     setNewCardTitle('');
   };
 
   return (
     <div className="w-72 flex-shrink-0">
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
                   <KanbanCardItem
                     key={card.id}
                     card={card}
                     index={index}
                     onCardClick={onCardClick}
                     onDelete={() => onDeleteCard(column.id, card.id)}
                   />
                 ))}
                 {provided.placeholder}
               </div>
             )}
           </Droppable>
           <div className="flex gap-2">
             <Input
               placeholder="Add a card..."
               value={newCardTitle}
               onChange={(e) => setNewCardTitle(e.target.value)}
               onKeyDown={(e) => {
                 if (e.key === 'Enter') handleAddCard();
               }}
               className="text-sm"
             />
             <Button size="icon" variant="outline" onClick={handleAddCard}>
               <Plus className="h-4 w-4" />
             </Button>
           </div>
         </CardContent>
       </Card>
     </div>
   );
 }