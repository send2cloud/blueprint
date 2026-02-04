import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { MindMapNode } from './MindMapNode';

interface MindMapNodeData {
  label: string;
  onAddChild?: (nodeId: string) => void;
  [key: string]: unknown;
}

type MindMapNodeType = Node<MindMapNodeData>;

interface MindMapData {
  nodes: MindMapNodeType[];
  edges: Edge[];
  nodeId: number;
}

interface MindMapEditorProps {
  initialData?: unknown;
  onSave?: (data: unknown) => void;
}

const nodeTypes = { mindMapNode: MindMapNode };

const defaultNode: MindMapNodeType = {
  id: '1',
  type: 'mindMapNode',
  data: { label: 'Main Idea' },
  position: { x: 300, y: 200 },
};

export function MindMapEditor({ initialData, onSave }: MindMapEditorProps) {
  const mindMapData = initialData as MindMapData | undefined;
  
  const [nodeId, setNodeId] = useState(mindMapData?.nodeId || 2);
  const [nodes, setNodes, onNodesChange] = useNodesState<MindMapNodeType>(
    mindMapData?.nodes || [defaultNode]
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(mindMapData?.edges || []);
  const [initialized, setInitialized] = useState(false);

  const addChildNode = useCallback((parentId: string) => {
    const newId = String(nodeId);
    setNodeId((id) => id + 1);

    setNodes((nds) => {
      const parentNode = nds.find((n) => n.id === parentId);
      if (!parentNode) return nds;

      const childCount = nds.filter((n) =>
        edges.some((e) => e.source === parentId && e.target === n.id)
      ).length;

      const newNode: MindMapNodeType = {
        id: newId,
        type: 'mindMapNode',
        data: { label: `Idea ${newId}` },
        position: {
          x: parentNode.position.x + 200,
          y: parentNode.position.y + (childCount - 1) * 80,
        },
      };

      return [...nds, newNode];
    });

    setEdges((eds) => [
      ...eds,
      {
        id: `e${parentId}-${newId}`,
        source: parentId,
        target: newId,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
      },
    ]);
  }, [nodeId, edges, setNodes, setEdges]);

  // Mark as initialized after first render
  useEffect(() => {
    setInitialized(true);
  }, []);

  // Update all nodes with the latest addChildNode callback
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: { ...node.data, onAddChild: addChildNode },
      }))
    );
  }, [addChildNode, setNodes]);

  // Save on changes (after initialization)
  useEffect(() => {
    if (initialized && onSave) {
      // Remove the callback function before saving
      const nodesForSave = nodes.map((node) => ({
        ...node,
        data: { ...node.data, onAddChild: undefined },
      }));
      onSave({ nodes: nodesForSave, edges, nodeId });
    }
  }, [nodes, edges, nodeId, initialized, onSave]);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds
        )
      ),
    [setEdges]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-muted/20"
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
      </ReactFlow>
    </div>
  );
}
