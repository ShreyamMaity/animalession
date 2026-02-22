"use client";

import { useRef, useCallback } from "react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useNodes } from "@/hooks/use-nodes";
import { useEdges } from "@/hooks/use-edges";
import { Code, FileText, Link2, Image, StickyNote, ExternalLink } from "lucide-react";
import type { Node } from "@/types";

interface KnowledgeNode2DProps {
  node: Node;
  projectId: string;
  zoom: number;
  pan: { x: number; y: number };
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const typeIcons: Record<string, React.ReactNode> = {
  TEXT: <FileText className="h-3.5 w-3.5" />,
  ARTIFACT: <Code className="h-3.5 w-3.5" />,
  LINK: <Link2 className="h-3.5 w-3.5" />,
  IMAGE: <Image className="h-3.5 w-3.5" />,
  NOTE: <StickyNote className="h-3.5 w-3.5" />,
};

const NODE_WIDTH = 260;
const NODE_MIN_HEIGHT = 80;

export function KnowledgeNode2D({
  node,
  projectId,
  zoom,
  pan,
  containerRef,
}: KnowledgeNode2DProps) {
  const isDraggingRef = useRef(false);

  const {
    selectedNodeId,
    hoveredNodeId,
    interactionMode,
    connectSourceId,
    setSelectedNodeId,
    setHoveredNodeId,
    setIsDragging,
    setConnectSourceId,
    setEditingNodeId,
    setFullscreenArtifactId,
    setDragNodePos,
  } = useWorkspaceStore();

  const { mutate: mutateNodes } = useNodes(projectId);
  const { mutate: mutateEdges } = useEdges(projectId);

  const isSelected = selectedNodeId === node.id;
  const isHovered = hoveredNodeId === node.id;
  const isConnectSource = connectSourceId === node.id;

  const handlePointerDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      if (interactionMode === "connect") {
        if (!connectSourceId) {
          setConnectSourceId(node.id);
        } else if (connectSourceId !== node.id) {
          fetch(`/api/projects/${projectId}/edges`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sourceNodeId: connectSourceId,
              targetNodeId: node.id,
            }),
          }).then(() => {
            mutateEdges();
            setConnectSourceId(null);
          });
        }
        return;
      }

      if (interactionMode !== "select") return;

      setSelectedNodeId(node.id);

      const startX = e.clientX;
      const startY = e.clientY;
      const nodeStartX = node.posX;
      const nodeStartY = node.posY;
      let hasMoved = false;

      const nodeEl = (e.currentTarget as HTMLElement).closest("[data-node-id]") as HTMLElement;

      const onPointerMove = (ev: globalThis.MouseEvent) => {
        const dx = (ev.clientX - startX) / zoom;
        const dy = (ev.clientY - startY) / zoom;

        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          hasMoved = true;
          isDraggingRef.current = true;
          setIsDragging(true);
        }

        if (hasMoved && nodeEl) {
          const newX = nodeStartX + dx;
          const newY = nodeStartY + dy;
          nodeEl.style.left = `${newX}px`;
          nodeEl.style.top = `${newY}px`;
          setDragNodePos({ id: node.id, x: newX, y: newY });
        }
      };

      const onPointerUp = (ev: globalThis.MouseEvent) => {
        window.removeEventListener("mousemove", onPointerMove);
        window.removeEventListener("mouseup", onPointerUp);

        if (hasMoved) {
          const dx = (ev.clientX - startX) / zoom;
          const dy = (ev.clientY - startY) / zoom;

          fetch(`/api/projects/${projectId}/nodes/${node.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              posX: nodeStartX + dx,
              posY: nodeStartY + dy,
            }),
          }).then(() => mutateNodes());
        }

        isDraggingRef.current = false;
        setIsDragging(false);
        setDragNodePos(null);
      };

      window.addEventListener("mousemove", onPointerMove);
      window.addEventListener("mouseup", onPointerUp);
    },
    [
      interactionMode,
      connectSourceId,
      node,
      projectId,
      zoom,
      setSelectedNodeId,
      setIsDragging,
      setDragNodePos,
      setConnectSourceId,
      mutateNodes,
      mutateEdges,
    ]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (node.artifactId) {
        setFullscreenArtifactId(node.artifactId);
      } else if (node.type === "ARTIFACT" && node.content) {
        sessionStorage.setItem("artifact-code", node.content);
        setFullscreenArtifactId(`content:${node.id}`);
      } else {
        setEditingNodeId(node.id);
      }
    },
    [node.id, node.artifactId, node.type, node.content, setEditingNodeId, setFullscreenArtifactId]
  );

  const isArtifact = node.type === "ARTIFACT" && (node.artifactId || node.content);
  const isLink = node.type === "LINK" && node.content;

  return (
    <div
      data-node-id={node.id}
      className="absolute"
      style={{
        left: node.posX,
        top: node.posY,
        width: NODE_WIDTH,
        cursor:
          interactionMode === "select"
            ? "grab"
            : interactionMode === "connect"
              ? "crosshair"
              : "pointer",
      }}
      onMouseDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setHoveredNodeId(node.id)}
      onMouseLeave={() => setHoveredNodeId(null)}
    >
      {/* Glow */}
      <div
        className="absolute -inset-2 rounded-2xl transition-all duration-300 pointer-events-none"
        style={{
          background: node.color,
          opacity: isSelected ? 0.15 : isHovered ? 0.08 : 0,
          filter: "blur(16px)",
        }}
      />

      {/* Selection / connect ring */}
      {(isSelected || isConnectSource) && (
        <div
          className="absolute -inset-[3px] rounded-xl border-2 pointer-events-none"
          style={{
            borderColor: isConnectSource ? "#8b5cf6" : node.color,
            borderStyle: isConnectSource ? "dashed" : "solid",
            opacity: 0.7,
          }}
        />
      )}

      {/* Card */}
      <div
        className="relative rounded-xl border overflow-hidden transition-all duration-200"
        style={{
          borderColor: isSelected
            ? `${node.color}66`
            : isHovered
              ? "rgba(255,255,255,0.15)"
              : "rgba(255,255,255,0.06)",
          background: "rgba(10, 10, 26, 0.85)",
          backdropFilter: "blur(12px)",
          boxShadow: isSelected
            ? `0 0 20px ${node.color}22, 0 4px 24px rgba(0,0,0,0.4)`
            : "0 4px 16px rgba(0,0,0,0.3)",
          minHeight: NODE_MIN_HEIGHT,
        }}
      >
        {/* Color accent bar */}
        <div className="h-1" style={{ background: node.color }} />

        {/* Header */}
        <div className="px-3 py-2 flex items-center gap-2 border-b border-white/5">
          <span className="text-white/50">{typeIcons[node.type]}</span>
          <span className="text-sm font-medium text-white/90 truncate flex-1">
            {node.title}
          </span>
          {isArtifact && (
            <span className="text-[10px] text-purple-400/60 bg-purple-500/10 px-1.5 py-0.5 rounded">
              dbl-click to run
            </span>
          )}
        </div>

        {/* Content area */}
        {isArtifact ? (
          <div className="px-3 py-2.5 flex items-center gap-2">
            <Code className="h-4 w-4 text-purple-400/60 shrink-0" />
            <p className="text-xs text-white/50 truncate">{node.title}</p>
          </div>
        ) : isLink ? (
          <div className="px-3 py-2">
            <a
              href={node.content!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors group"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate underline underline-offset-2">
                {node.content}
              </span>
            </a>
          </div>
        ) : node.content ? (
          <div className="px-3 py-2 max-h-[160px] overflow-hidden">
            <p className="text-xs text-white/60 whitespace-pre-wrap leading-relaxed line-clamp-[8]">
              {node.content}
            </p>
          </div>
        ) : (
          <div className="px-3 py-3 text-center">
            <p className="text-xs text-white/30 italic">Empty node</p>
          </div>
        )}
      </div>
    </div>
  );
}
