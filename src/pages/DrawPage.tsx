import { Pencil } from 'lucide-react';
import { ToolHeader } from '@/components/layout/ToolHeader';
import { DrawingCanvas } from '@/components/tools/draw/DrawingCanvas';

export default function DrawPage() {
  return (
    <div className="flex flex-col h-full">
      <ToolHeader title="Draw" icon={Pencil} />
      <div className="flex-1">
        <DrawingCanvas />
      </div>
    </div>
  );
}
