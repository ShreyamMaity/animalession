"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  ConnectionMode,
  applyNodeChanges,
  type NodeChange,
  type Connection,
  type NodeMouseHandler,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { RFKnowledgeNode } from "./rf-knowledge-node";
import { RFKnowledgeEdge } from "./rf-knowledge-edge";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useNodes } from "@/hooks/use-nodes";
import { useEdges } from "@/hooks/use-edges";
import { toRFNodes, toRFEdges } from "@/lib/reactflow-transforms";
import type { KnowledgeNodeData } from "@/lib/reactflow-transforms";
import type { KnowledgeEdgeData } from "@/lib/reactflow-transforms";
import type { NodeWithArtifact, Edge as PrismaEdge } from "@/types";
import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";

const nodeTypes = { knowledge: RFKnowledgeNode };
const edgeTypes = { knowledge: RFKnowledgeEdge };

interface ReactFlowCanvasProps {
  nodes: NodeWithArtifact[];
  edges: PrismaEdge[];
  projectId: string;
}

export function ReactFlowCanvas({
  nodes: initialNodes,
  edges: initialEdges,
  projectId,
}: ReactFlowCanvasProps) {
  const { screenToFlowPosition } = useReactFlow();
  const { mutate: mutateNodes } = useNodes(projectId);
  const { mutate: mutateEdges } = useEdges(projectId);

  const {
    setSelectedNodeId,
    resetSelection,
    setQuickMenu,
  } = useWorkspaceStore();

  const isDraggingRef = useRef(false);

  const [rfNodes, setRfNodes] = useState<RFNode<KnowledgeNodeData>[]>(() =>
    toRFNodes(initialNodes)
  );
  const [rfEdges, setRfEdges] = useState<RFEdge<KnowledgeEdgeData>[]>(() =>
    toRFEdges(initialEdges)
  );

  // Sync from SWR data (only when not dragging)
  useEffect(() => {
    if (!isDraggingRef.current) {
      setRfNodes(toRFNodes(initialNodes));
    }
  }, [initialNodes]);

  useEffect(() => {
    setRfEdges(toRFEdges(initialEdges));
  }, [initialEdges]);

  // Listen for edge deletions to revalidate
  useEffect(() => {
    const handler = () => mutateEdges();
    window.addEventListener("edge-deleted", handler);
    return () => window.removeEventListener("edge-deleted", handler);
  }, [mutateEdges]);

  const onNodesChange = useCallback(
    (changes: NodeChange<RFNode<KnowledgeNodeData>>[]) => {
      setRfNodes((nds) => applyNodeChanges(changes, nds));

      // Persist resize when it ends
      for (const change of changes) {
        if (change.type === "dimensions" && change.resizing === false) {
          const node = rfNodes.find((n) => n.id === change.id);
          if (node && change.dimensions) {
            fetch(`/api/projects/${projectId}/nodes/${change.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                width: change.dimensions.width,
                height: change.dimensions.height,
              }),
            }).then(() => mutateNodes());
          }
        }
      }
    },
    [rfNodes, projectId, mutateNodes]
  );

  const onNodeDragStart = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  const onNodeDragStop: NodeMouseHandler<RFNode<KnowledgeNodeData>> = useCallback(
    async (_event, node) => {
      isDraggingRef.current = false;
      try {
        await fetch(`/api/projects/${projectId}/nodes/${node.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            posX: node.position.x,
            posY: node.position.y,
          }),
        });
        mutateNodes();
      } catch { /* ignore */ }
    },
    [projectId, mutateNodes]
  );

  const onConnect = useCallback(
    async (connection: Connection) => {
      try {
        await fetch(`/api/projects/${projectId}/edges`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceNodeId: connection.source,
            targetNodeId: connection.target,
            sourceHandle: connection.sourceHandle,
            targetHandle: connection.targetHandle,
          }),
        });
        mutateEdges();
      } catch { /* ignore */ }
    },
    [projectId, mutateEdges]
  );

  const onPaneClick = useCallback(() => {
    resetSelection();
  }, [resetSelection]);

  const onNodeClick: NodeMouseHandler<RFNode<KnowledgeNodeData>> = useCallback(
    (_event, node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  const onPaneDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      const canvasPos = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      setQuickMenu({
        open: true,
        x: event.clientX,
        y: event.clientY,
        canvasX: canvasPos.x,
        canvasY: canvasPos.y,
      });
    },
    [screenToFlowPosition, setQuickMenu]
  );

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onNodeDragStart={onNodeDragStart}
      onNodeDragStop={onNodeDragStop}
      onConnect={onConnect}
      onPaneClick={onPaneClick}
      onNodeClick={onNodeClick}
      onDoubleClick={onPaneDoubleClick}
      colorMode="dark"
      fitView
      fitViewOptions={{ padding: 0.3 }}
      minZoom={0.1}
      maxZoom={5}
      connectionMode={ConnectionMode.Loose}
      defaultEdgeOptions={{ type: "knowledge" }}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={20}
        size={1}
        color="rgba(139, 92, 246, 0.15)"
      />
    </ReactFlow>
  );
}
