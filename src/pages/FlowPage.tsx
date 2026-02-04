import { GitBranch } from 'lucide-react';
import { ToolHeader } from '@/components/layout/ToolHeader';
import { FlowEditor } from '@/components/tools/flow/FlowEditor';

export default function FlowPage() {
  return (
    <div className="flex flex-col h-full">
      <ToolHeader title="Flow" icon={GitBranch} />
      <div className="flex-1">
        <FlowEditor />
      </div>
    </div>
  );
}
