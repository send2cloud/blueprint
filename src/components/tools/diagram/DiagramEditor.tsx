import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
  BackgroundVariant,
  ColorMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTheme } from 'next-themes';

interface DiagramData {
  nodes: Node[];
  edges: Edge[];
}

interface DiagramEditorProps {
  initialData?: unknown;
  onSave?: (data: unknown) => void;
}

const defaultNodes: Node[] = [
  {
    id: '1',
    type: 'default',
    data: { label: 'Start' },
    position: { x: 250, y: 50 },
  },
];

const defaultEdges: Edge[] = [];

export function DiagramEditor({ initialData, onSave }: DiagramEditorProps) {
  const { resolvedTheme } = useTheme();
  const theme = (resolvedTheme === 'dark' ? 'dark' : 'light') as ColorMode;

  const parsedData = useMemo(() => {
    if (initialData && typeof initialData === 'object') {
      const data = initialData as DiagramData;
      return {
        nodes: data.nodes || defaultNodes,
        edges: data.edges || defaultEdges,
      };
    }
    return { nodes: defaultNodes, edges: defaultEdges };
  }, [initialData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(parsedData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(parsedData.edges);

  const saveData = useCallback(() => {
    if (onSave) {
      onSave({ nodes, edges });
    }
  }, [nodes, edges, onSave]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
      setTimeout(saveData, 0);
    },
    [setEdges, saveData]
  );

  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      onNodesChange(changes);
      setTimeout(saveData, 0);
    },
    [onNodesChange, saveData]
  );

  const handleEdgesChange = useCallback(
    (changes: Parameters<typeof onEdgesChange>[0]) => {
      onEdgesChange(changes);
      setTimeout(saveData, 0);
    },
    [onEdgesChange, saveData]
  );

  const addNode = useCallback(() => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'default',
      data: { label: 'New Node' },
      position: {
        x: Math.random() * 300 + 100,
        y: Math.random() * 300 + 100
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setTimeout(saveData, 0);
  }, [setNodes, saveData]);

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-4 left-4 z-10">
        <Button onClick={addNode} size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Add Node
        </Button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        colorMode={theme}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
