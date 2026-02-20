 import { useState } from 'react';
 import { Calendar as CalendarIcon, X } from 'lucide-react';
 import { format } from 'date-fns';
 import { cn } from '../../../lib/utils';
 import { Button } from '../../ui/button';
 import { Calendar } from '../../ui/calendar';
 import {
   Popover,
   PopoverContent,
   PopoverTrigger,
 } from '../../ui/popover';
 
 interface CardDueDateProps {
   dueDate?: string;
   onChange: (dueDate: string | undefined) => void;
 }
 
 export function CardDueDate({ dueDate, onChange }: CardDueDateProps) {
   const [open, setOpen] = useState(false);
   const date = dueDate ? new Date(dueDate) : undefined;
 
   const handleSelect = (selectedDate: Date | undefined) => {
     onChange(selectedDate?.toISOString());
     setOpen(false);
   };
 
   const handleClear = (e: React.MouseEvent) => {
     e.stopPropagation();
     onChange(undefined);
   };
 
   return (
     <div className="space-y-2">
       <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
         <CalendarIcon className="h-4 w-4" />
         Due Date
       </div>
 
       <Popover open={open} onOpenChange={setOpen}>
         <PopoverTrigger asChild>
           <Button
             variant="outline"
             className={cn(
               'w-full justify-start text-left font-normal',
               !date && 'text-muted-foreground'
             )}
           >
             <CalendarIcon className="mr-2 h-4 w-4" />
             {date ? format(date, 'PPP') : 'Set due date'}
             {date && (
               <X
                 className="ml-auto h-4 w-4 hover:text-destructive"
                 onClick={handleClear}
               />
             )}
           </Button>
         </PopoverTrigger>
         <PopoverContent className="w-auto p-0" align="start">
           <Calendar
             mode="single"
             selected={date}
             onSelect={handleSelect}
             initialFocus
             className={cn('p-3 pointer-events-auto')}
           />
         </PopoverContent>
       </Popover>
     </div>
   );
 }