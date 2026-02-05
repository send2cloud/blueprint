 import { Draggable } from '@hello-pangea/dnd';
 import { MessageSquare, CheckSquare, Calendar, Trash2 } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { KanbanCard as KanbanCardType } from './types';
 import { format } from 'date-fns';
 
 interface KanbanCardProps {
   card: KanbanCardType;
   index: number;
   onCardClick: (card: KanbanCardType) => void;
   onDelete: () => void;
 }
 
 export function KanbanCardItem({ card, index, onCardClick, onDelete }: KanbanCardProps) {
   const completedTodos = card.todos?.filter((t) => t.completed).length || 0;
   const totalTodos = card.todos?.length || 0;
   const commentCount = card.comments?.length || 0;
   const hasLabels = card.labels && card.labels.length > 0;
   const hasDueDate = !!card.dueDate;
 
   return (
     <Draggable draggableId={card.id} index={index}>
       {(provided) => (
         <div
           ref={provided.innerRef}
           {...provided.draggableProps}
           {...provided.dragHandleProps}
           className="mb-2 p-3 bg-muted rounded-md group cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
           onClick={() => onCardClick(card)}
         >
           {/* Labels */}
           {hasLabels && (
             <div className="flex flex-wrap gap-1 mb-2">
               {card.labels!.map((label) => (
                 <span
                   key={label.id}
                   className="h-2 w-8 rounded-full"
                   style={{ backgroundColor: label.color }}
                   title={label.name}
                 />
               ))}
             </div>
           )}
 
           {/* Title */}
           <div className="flex items-start justify-between gap-2">
             <span className="text-sm font-medium">{card.title}</span>
             <Button
               variant="ghost"
               size="icon"
               className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
               onClick={(e) => {
                 e.stopPropagation();
                 onDelete();
               }}
             >
               <Trash2 className="h-3 w-3" />
             </Button>
           </div>
 
           {/* Indicators */}
           {(hasDueDate || totalTodos > 0 || commentCount > 0) && (
             <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
               {hasDueDate && (
                 <span className="flex items-center gap-1">
                   <Calendar className="h-3 w-3" />
                   {format(new Date(card.dueDate!), 'MMM d')}
                 </span>
               )}
               {totalTodos > 0 && (
                 <span className="flex items-center gap-1">
                   <CheckSquare className="h-3 w-3" />
                   {completedTodos}/{totalTodos}
                 </span>
               )}
               {commentCount > 0 && (
                 <span className="flex items-center gap-1">
                   <MessageSquare className="h-3 w-3" />
                   {commentCount}
                 </span>
               )}
             </div>
           )}
         </div>
       )}
     </Draggable>
   );
 }