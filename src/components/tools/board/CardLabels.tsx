 import { Tag, X } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import {
   Popover,
   PopoverContent,
   PopoverTrigger,
 } from '@/components/ui/popover';
 import { CardLabel, DEFAULT_LABELS } from './types';
 
 interface CardLabelsProps {
   labels: CardLabel[];
   onChange: (labels: CardLabel[]) => void;
 }
 
 export function CardLabels({ labels, onChange }: CardLabelsProps) {
   const isSelected = (labelId: string) => labels.some((l) => l.id === labelId);
 
   const toggleLabel = (label: CardLabel) => {
     if (isSelected(label.id)) {
       onChange(labels.filter((l) => l.id !== label.id));
     } else {
       onChange([...labels, label]);
     }
   };
 
   const removeLabel = (labelId: string) => {
     onChange(labels.filter((l) => l.id !== labelId));
   };
 
   return (
     <div className="space-y-2">
       <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
         <Tag className="h-4 w-4" />
         Labels
       </div>
 
       <div className="flex flex-wrap items-center gap-2">
         {labels.map((label) => (
           <span
             key={label.id}
             className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-white"
             style={{ backgroundColor: label.color }}
           >
             {label.name}
             <button
               className="hover:bg-white/20 rounded"
               onClick={() => removeLabel(label.id)}
             >
               <X className="h-3 w-3" />
             </button>
           </span>
         ))}
 
         <Popover>
           <PopoverTrigger asChild>
             <Button variant="outline" size="sm" className="h-7">
               + Add Label
             </Button>
           </PopoverTrigger>
           <PopoverContent className="w-48 p-2" align="start">
             <div className="space-y-1">
               {DEFAULT_LABELS.map((label) => (
                 <button
                   key={label.id}
                   className={`w-full flex items-center gap-2 p-2 rounded text-sm hover:bg-muted ${
                     isSelected(label.id) ? 'ring-2 ring-primary' : ''
                   }`}
                   onClick={() => toggleLabel(label)}
                 >
                   <span
                     className="h-4 w-4 rounded"
                     style={{ backgroundColor: label.color }}
                   />
                   {label.name}
                 </button>
               ))}
             </div>
           </PopoverContent>
         </Popover>
       </div>
     </div>
   );
 }