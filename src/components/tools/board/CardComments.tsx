 import { useState } from 'react';
 import { MessageSquare, Trash2 } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Textarea } from '@/components/ui/textarea';
 import { CardComment } from './types';
 import { formatRelative } from '@/lib/formatters';
 
 interface CardCommentsProps {
   comments: CardComment[];
   onChange: (comments: CardComment[]) => void;
 }
 
 export function CardComments({ comments, onChange }: CardCommentsProps) {
   const [newComment, setNewComment] = useState('');
 
   const handleAdd = () => {
     const text = newComment.trim();
     if (!text) return;
     const comment: CardComment = {
       id: `comment-${Date.now()}`,
       text,
       authorName: 'You',
       createdAt: new Date().toISOString(),
     };
     onChange([comment, ...comments]);
     setNewComment('');
   };
 
   const handleDelete = (id: string) => {
     onChange(comments.filter((c) => c.id !== id));
   };
 
   return (
     <div className="space-y-3">
       <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
         <MessageSquare className="h-4 w-4" />
         Comments
       </div>
 
       <div className="space-y-2">
         <Textarea
           placeholder="Write a comment..."
           value={newComment}
           onChange={(e) => setNewComment(e.target.value)}
           className="min-h-[60px]"
         />
         <Button size="sm" onClick={handleAdd} disabled={!newComment.trim()}>
           Add Comment
         </Button>
       </div>
 
       {comments.length > 0 && (
         <div className="space-y-3 pt-2">
           {comments.map((comment) => (
             <div key={comment.id} className="group">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <span className="text-sm font-medium">{comment.authorName}</span>
                   <span className="text-xs text-muted-foreground">
                     {formatRelative(comment.createdAt)}
                   </span>
                 </div>
                 <Button
                   variant="ghost"
                   size="icon"
                   className="h-6 w-6 opacity-0 group-hover:opacity-100"
                   onClick={() => handleDelete(comment.id)}
                 >
                   <Trash2 className="h-3 w-3" />
                 </Button>
               </div>
               <p className="text-sm text-muted-foreground mt-1 pl-0">
                 {comment.text}
               </p>
             </div>
           ))}
         </div>
       )}
     </div>
   );
 }