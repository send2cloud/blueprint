import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  ColorMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Network, Loader2 } from 'lucide-react';
import { useRelationshipGraph } from '@/hooks/useArtifactLinks';
import { TOOL_CONFIG } from '@/lib/toolConfig';
import { useTheme } from 'next-themes';

// Color mapping for different artifact types
const TYPE_COLORS: Record<string, string> = {
  canvas: 'hsl(262, 83%, 58%)', // Purple
  diagram: 'hsl(199, 89%, 48%)', // Blue
  board: 'hsl(25, 95%, 53%)',   // Orange
  notes: 'hsl(142, 76%, 36%)',  // Green
};

export default function RelationshipsPage() {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const theme = (resolvedTheme === 'dark' ? 'dark' : 'light') as ColorMode;
  const { nodes: graphNodes, edges: graphEdges, loading } = useRelationshipGraph();

  // Convert relationship graph to ReactFlow format
  const { initialNodes, initialEdges } = useMemo(() => {
    // Position nodes in a circular layout
    const radius = Math.max(200, graphNodes.length * 40);
    const angleStep = (2 * Math.PI) / Math.max(graphNodes.length, 1);

    const nodes: Node[] = graphNodes.map((node, index) => {
      const angle = index * angleStep;
      const x = 400 + radius * Math.cos(angle);
      const y = 300 + radius * Math.sin(angle);
      
      return {
        id: node.id,
        type: 'default',
        position: { x, y },
        data: { 
          label: node.name,
          type: node.type,
        },
        style: {
          background: TYPE_COLORS[node.type] || 'hsl(var(--primary))',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 16px',
          fontSize: '12px',
          fontWeight: 500,
        },
      };
    });

    const edges: Edge[] = graphEdges.map((edge, index) => ({
      id: `edge-${index}`,
      source: edge.source,
      target: edge.target,
      animated: true,
      style: { stroke: 'hsl(var(--muted-foreground))' },
    }));

    return { initialNodes: nodes, initialEdges: edges };
  }, [graphNodes, graphEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const artifactType = node.data?.type as string;
    if (artifactType && TOOL_CONFIG[artifactType as keyof typeof TOOL_CONFIG]) {
      const tool = TOOL_CONFIG[artifactType as keyof typeof TOOL_CONFIG];
      navigate(`${tool.path}/${node.id}`);
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 border-b border-border bg-background px-4 py-3">
        <Network className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-lg font-semibold text-foreground">Relationship Graph</h1>
        <span className="text-sm text-muted-foreground ml-2">
          {graphNodes.length} artifacts • {graphEdges.length} connections
        </span>
      </div>

      <div className="flex-1">
        {graphNodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Network className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium text-foreground mb-2">No connections yet</h2>
            <p className="text-sm text-muted-foreground max-w-md">
              Use <code className="px-1.5 py-0.5 bg-muted rounded">[[artifact name]]</code> syntax in your Docs, 
              Tasks, or Flows to create links between artifacts. They'll appear here as a visual graph.
            </p>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            colorMode={theme}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Controls />
            <MiniMap 
              nodeColor={(node) => TYPE_COLORS[node.data?.type as string] || 'hsl(var(--primary))'}
            />
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
          </ReactFlow>
        )}
      </div>

      {/* Legend */}
      <div className="border-t border-border bg-background px-4 py-2">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="font-medium">Legend:</span>
          {Object.entries(TYPE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div 
                className="w-3 h-3 rounded" 
                style={{ backgroundColor: color }} 
              />
              <span className="capitalize">{TOOL_CONFIG[type as keyof typeof TOOL_CONFIG]?.title || type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
