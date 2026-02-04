import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface FlowData {
  nodes: Node[];
  edges: Edge[];
  nodeId: number;
}

interface FlowEditorProps {
  initialData?: unknown;
  onSave?: (data: unknown) => void;
}

const defaultNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start' },
    position: { x: 250, y: 25 },
  },
  {
    id: '2',
    data: { label: 'Process' },
    position: { x: 250, y: 125 },
  },
  {
    id: '3',
    type: 'output',
    data: { label: 'End' },
    position: { x: 250, y: 225 },
  },
];

const defaultEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
];

export function FlowEditor({ initialData, onSave }: FlowEditorProps) {
  const flowData = initialData as FlowData | undefined;
  
  const [nodes, setNodes, onNodesChange] = useNodesState(flowData?.nodes || defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowData?.edges || defaultEdges);
  const [nodeId, setNodeId] = useState(flowData?.nodeId || 4);
  const [initialized, setInitialized] = useState(false);

  // Mark as initialized after first render
  useEffect(() => {
    setInitialized(true);
  }, []);

  // Save on changes (after initialization)
  useEffect(() => {
    if (initialized && onSave) {
      onSave({ nodes, edges, nodeId });
    }
  }, [nodes, edges, nodeId, initialized, onSave]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = useCallback(() => {
    const newNode: Node = {
      id: String(nodeId),
      data: { label: `Node ${nodeId}` },
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeId((id) => id + 1);
  }, [nodeId, setNodes]);

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-4 right-4 z-10">
        <Button onClick={addNode} size="sm" variant="secondary">
          <Plus className="h-4 w-4 mr-1" />
          Add Node
        </Button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        className="bg-muted/30"
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
