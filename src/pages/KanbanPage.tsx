import { Columns3 } from 'lucide-react';
import { ToolHeader } from '@/components/layout/ToolHeader';
import { KanbanBoard } from '@/components/tools/kanban/KanbanBoard';

export default function KanbanPage() {
  return (
    <div className="flex flex-col h-full">
      <ToolHeader title="Kanban" icon={Columns3} />
      <div className="flex-1">
        <KanbanBoard />
      </div>
    </div>
  );
}
