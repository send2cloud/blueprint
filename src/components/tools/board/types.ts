 // Board/Kanban type definitions
 
 export interface TodoItem {
   id: string;
   text: string;
   completed: boolean;
 }
 
 export interface CardComment {
   id: string;
   text: string;
   authorName: string;
   createdAt: string;
 }
 
 export interface CardLabel {
   id: string;
   name: string;
   color: string;
 }
 
 export const DEFAULT_LABELS: CardLabel[] = [
   { id: 'bug', name: 'Bug', color: 'hsl(0, 84%, 60%)' },
   { id: 'feature', name: 'Feature', color: 'hsl(142, 76%, 36%)' },
   { id: 'urgent', name: 'Urgent', color: 'hsl(25, 95%, 53%)' },
   { id: 'blocked', name: 'Blocked', color: 'hsl(262, 83%, 58%)' },
   { id: 'review', name: 'Review', color: 'hsl(199, 89%, 48%)' },
 ];
 
 export interface KanbanCard {
   id: string;
   title: string;
   description?: string;
   todos?: TodoItem[];
   comments?: CardComment[];
   labels?: CardLabel[];
   dueDate?: string;
   createdAt: string;
   updatedAt: string;
 }
 
 export interface KanbanColumn {
   id: string;
   title: string;
   cards: KanbanCard[];
 }
 
 export interface BoardData {
   columns: KanbanColumn[];
 }
 
 // Migration helper: convert old card format to new
 export function migrateCard(card: { id: string; content?: string } & Partial<KanbanCard>): KanbanCard {
   const now = new Date().toISOString();
   return {
     id: card.id,
     title: card.title || card.content || 'Untitled',
     description: card.description,
     todos: card.todos || [],
     comments: card.comments || [],
     labels: card.labels || [],
     dueDate: card.dueDate,
     createdAt: card.createdAt || now,
     updatedAt: card.updatedAt || now,
   };
 }