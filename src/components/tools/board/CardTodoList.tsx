 import { useState } from 'react';
 import { CheckSquare, Plus, Trash2 } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Checkbox } from '@/components/ui/checkbox';
 import { Progress } from '@/components/ui/progress';
 import { TodoItem } from './types';
 
 interface CardTodoListProps {
   todos: TodoItem[];
   onChange: (todos: TodoItem[]) => void;
 }
 
 export function CardTodoList({ todos, onChange }: CardTodoListProps) {
   const [newTodoText, setNewTodoText] = useState('');
 
   const completedCount = todos.filter((t) => t.completed).length;
   const progress = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;
 
   const handleAdd = () => {
     const text = newTodoText.trim();
     if (!text) return;
     const newTodo: TodoItem = {
       id: `todo-${Date.now()}`,
       text,
       completed: false,
     };
     onChange([...todos, newTodo]);
     setNewTodoText('');
   };
 
   const handleToggle = (id: string) => {
     onChange(
       todos.map((t) =>
         t.id === id ? { ...t, completed: !t.completed } : t
       )
     );
   };
 
   const handleDelete = (id: string) => {
     onChange(todos.filter((t) => t.id !== id));
   };
 
   return (
     <div className="space-y-3">
       <div className="flex items-center justify-between">
         <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
           <CheckSquare className="h-4 w-4" />
           Checklist
           {todos.length > 0 && (
             <span className="text-xs">
               ({completedCount}/{todos.length})
             </span>
           )}
         </div>
       </div>
 
       {todos.length > 0 && (
         <Progress value={progress} className="h-2" />
       )}
 
       <div className="space-y-1">
         {todos.map((todo) => (
           <div
             key={todo.id}
             className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 group"
           >
             <Checkbox
               checked={todo.completed}
               onCheckedChange={() => handleToggle(todo.id)}
             />
             <span
               className={`flex-1 text-sm ${
                 todo.completed ? 'line-through text-muted-foreground' : ''
               }`}
             >
               {todo.text}
             </span>
             <Button
               variant="ghost"
               size="icon"
               className="h-6 w-6 opacity-0 group-hover:opacity-100"
               onClick={() => handleDelete(todo.id)}
             >
               <Trash2 className="h-3 w-3" />
             </Button>
           </div>
         ))}
       </div>
 
       <div className="flex gap-2">
         <Input
           placeholder="Add an item..."
           value={newTodoText}
           onChange={(e) => setNewTodoText(e.target.value)}
           onKeyDown={(e) => {
             if (e.key === 'Enter') handleAdd();
           }}
           className="text-sm"
         />
         <Button size="icon" variant="outline" onClick={handleAdd}>
           <Plus className="h-4 w-4" />
         </Button>
       </div>
     </div>
   );
 }