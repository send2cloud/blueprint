import { Brain } from 'lucide-react';
import { ToolHeader } from '@/components/layout/ToolHeader';
import { MindMapEditor } from '@/components/tools/mindmap/MindMapEditor';

export default function MindMapPage() {
  return (
    <div className="flex flex-col h-full">
      <ToolHeader title="Mind Map" icon={Brain} />
      <div className="flex-1">
        <MindMapEditor />
      </div>
    </div>
  );
}
