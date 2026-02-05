 import { useState } from 'react';
 import { FileText } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Textarea } from '@/components/ui/textarea';
 
 interface CardDescriptionProps {
   description?: string;
   onChange: (description: string) => void;
 }
 
 export function CardDescription({ description, onChange }: CardDescriptionProps) {
   const [editing, setEditing] = useState(false);
   const [value, setValue] = useState(description || '');
 
   const handleSave = () => {
     onChange(value);
     setEditing(false);
   };
 
   const handleCancel = () => {
     setValue(description || '');
     setEditing(false);
   };
 
   return (
     <div className="space-y-2">
       <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
         <FileText className="h-4 w-4" />
         Description
       </div>
       {editing ? (
         <div className="space-y-2">
           <Textarea
             value={value}
             onChange={(e) => setValue(e.target.value)}
             placeholder="Add a more detailed description..."
             className="min-h-[100px]"
             autoFocus
           />
           <div className="flex gap-2">
             <Button size="sm" onClick={handleSave}>
               Save
             </Button>
             <Button size="sm" variant="ghost" onClick={handleCancel}>
               Cancel
             </Button>
           </div>
         </div>
       ) : (
         <div
           className="p-3 bg-muted rounded-md text-sm cursor-pointer hover:bg-muted/80 min-h-[60px]"
           onClick={() => setEditing(true)}
         >
           {description || (
             <span className="text-muted-foreground">
               Add a more detailed description...
             </span>
           )}
         </div>
       )}
     </div>
   );
 }