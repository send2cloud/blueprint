import { StickyNote } from 'lucide-react';
import { ToolHeader } from '@/components/layout/ToolHeader';
import { StickyWhiteboard } from '@/components/tools/whiteboard/StickyWhiteboard';

export default function WhiteboardPage() {
  return (
    <div className="flex flex-col h-full">
      <ToolHeader title="Whiteboard" icon={StickyNote} />
      <div className="flex-1">
        <StickyWhiteboard />
      </div>
    </div>
  );
}
