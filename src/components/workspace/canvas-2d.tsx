"use client";

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type WheelEvent,
  type MouseEvent,
} from "react";
import { KnowledgeNode2D } from "./knowledge-node-2d";
import { EdgeLine2D } from "./edge-line-2d";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useNodes } from "@/hooks/use-nodes";
import { useEdges } from "@/hooks/use-edges";
import type { Node, Edge } from "@/types";

interface Canvas2DProps {
  nodes: Node[];
  edges: Edge[];
  projectId: string;
}

export function Canvas2D({ nodes, edges, projectId }: Canvas2DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const isPanning = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const {
    interactionMode,
    connectSourceId,
    dragNodePos,
    setSelectedNodeId,
    resetSelection,
    setQuickMenu,
  } = useWorkspaceStore();

  const { mutate: mutateNodes } = useNodes(projectId);
  const { mutate: mutateEdges } = useEdges(projectId);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    setZoom((prev) => Math.min(Math.max(prev + delta * prev, 0.1), 5));
  }, []);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && interactionMode === "orbit")) {
        isPanning.current = true;
        lastMouse.current = { x: e.clientX, y: e.clientY };
        e.preventDefault();
      }
    },
    [interactionMode]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isPanning.current) {
        const dx = e.clientX - lastMouse.current.x;
        const dy = e.clientY - lastMouse.current.y;
        lastMouse.current = { x: e.clientX, y: e.clientY };
        setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      }
    },
    []
  );

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const handleCanvasClick = useCallback(
    (e: MouseEvent) => {
      if (e.target === containerRef.current || e.target === (containerRef.current?.firstChild as Element)) {
        resetSelection();
      }
    },
    [resetSelection]
  );

  // Center the canvas initially
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPan({ x: rect.width / 2, y: rect.height / 2 });
    }
  }, []);

  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      return {
        x: (screenX - rect.left - pan.x) / zoom,
        y: (screenY - rect.top - pan.y) / zoom,
      };
    },
    [pan, zoom]
  );

  const handleDoubleClick = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-node-id]")) return;

      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      setQuickMenu({
        open: true,
        x: e.clientX,
        y: e.clientY,
        canvasX: canvasPos.x,
        canvasY: canvasPos.y,
      });
    },
    [screenToCanvas, setQuickMenu]
  );

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden relative"
      style={{ background: "#050510", cursor: interactionMode === "orbit" ? "grab" : "default" }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle, rgba(139, 92, 246, 0.08) 1px, transparent 1px),
            linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: `
            ${20 * zoom}px ${20 * zoom}px,
            ${100 * zoom}px ${100 * zoom}px,
            ${100 * zoom}px ${100 * zoom}px
          `,
          backgroundPosition: `
            ${pan.x}px ${pan.y}px,
            ${pan.x}px ${pan.y}px,
            ${pan.x}px ${pan.y}px
          `,
        }}
      />

      {/* Canvas transform layer */}
      <div
        className="absolute"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {/* SVG layer for edges */}
        <svg
          className="absolute overflow-visible"
          style={{ left: 0, top: 0, width: 1, height: 1, pointerEvents: "none" }}
        >
          {edges.map((edge) => {
            const source = nodeMap.get(edge.sourceNodeId);
            const target = nodeMap.get(edge.targetNodeId);
            if (!source || !target) return null;

            const nodeW = 260;
            const nodeH = 60;

            const srcX = dragNodePos?.id === source.id ? dragNodePos.x : source.posX;
            const srcY = dragNodePos?.id === source.id ? dragNodePos.y : source.posY;
            const tgtX = dragNodePos?.id === target.id ? dragNodePos.x : target.posX;
            const tgtY = dragNodePos?.id === target.id ? dragNodePos.y : target.posY;

            return (
              <EdgeLine2D
                key={edge.id}
                edge={edge}
                sourceX={srcX + nodeW / 2}
                sourceY={srcY + nodeH / 2}
                targetX={tgtX + nodeW / 2}
                targetY={tgtY + nodeH / 2}
                projectId={projectId}
                onDeleted={() => mutateEdges()}
              />
            );
          })}

          {/* Connect mode preview line */}
          {connectSourceId && interactionMode === "connect" && (
            <ConnectPreviewLine
              sourceNode={nodeMap.get(connectSourceId)}
              containerRef={containerRef}
              pan={pan}
              zoom={zoom}
            />
          )}
        </svg>

        {/* Nodes layer */}
        {nodes.map((node) => (
          <KnowledgeNode2D
            key={node.id}
            node={node}
            projectId={projectId}
            zoom={zoom}
            pan={pan}
            containerRef={containerRef}
          />
        ))}
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 left-4 text-xs text-white/40 bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}

function ConnectPreviewLine({
  sourceNode,
  containerRef,
  pan,
  zoom,
}: {
  sourceNode: Node | undefined;
  containerRef: React.RefObject<HTMLDivElement | null>;
  pan: { x: number; y: number };
  zoom: number;
}) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function handleMove(e: globalThis.MouseEvent) {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: (e.clientX - rect.left - pan.x) / zoom,
        y: (e.clientY - rect.top - pan.y) / zoom,
      });
    }
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [containerRef, pan, zoom]);

  if (!sourceNode) return null;

  return (
    <line
      x1={sourceNode.posX + 130}
      y1={sourceNode.posY + 30}
      x2={mousePos.x}
      y2={mousePos.y}
      stroke="#8b5cf6"
      strokeWidth={2}
      strokeDasharray="6 4"
      opacity={0.6}
    />
  );
}
