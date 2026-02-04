import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MindMapNodeProps {
  id: string;
  data: {
    label: string;
    onAddChild?: (nodeId: string) => void;
  };
}

export const MindMapNode = memo(({ id, data }: MindMapNodeProps) => {
  return (
    <div className="relative group">
      <div className="px-4 py-2 rounded-full bg-secondary border-2 border-border shadow-sm min-w-[100px] text-center">
        <span className="text-sm font-medium text-foreground">{data.label}</span>
      </div>
      
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 !bg-muted-foreground"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 !bg-muted-foreground"
      />
      
      {data.onAddChild && (
        <Button
          size="icon"
          variant="outline"
          className="absolute -right-8 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => data.onAddChild?.(id)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
});

MindMapNode.displayName = 'MindMapNode';
