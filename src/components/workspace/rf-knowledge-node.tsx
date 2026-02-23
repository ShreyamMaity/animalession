"use client";

import { memo, useCallback } from "react";
import { Handle, Position, NodeResizer } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { Code, FileText, Link2, Image, StickyNote } from "lucide-react";
import type { KnowledgeNodeData } from "@/lib/reactflow-transforms";
import {
  MarkdownContent,
  ImageContent,
  LinkPreviewContent,
  ArtifactThumbnail,
} from "./node-content-renderers";

const typeIcons: Record<string, React.ReactNode> = {
  TEXT: <FileText className="h-3.5 w-3.5" />,
  ARTIFACT: <Code className="h-3.5 w-3.5" />,
  LINK: <Link2 className="h-3.5 w-3.5" />,
  IMAGE: <Image className="h-3.5 w-3.5" />,
  NOTE: <StickyNote className="h-3.5 w-3.5" />,
};

const MIN_WIDTH = 180;
const MIN_HEIGHT = 80;

function RFKnowledgeNodeInner({ data, id, selected }: NodeProps & { data: KnowledgeNodeData }) {
  const {
    hoveredNodeId,
    setHoveredNodeId,
    setEditingNodeId,
    setFullscreenArtifactId,
  } = useWorkspaceStore();

  const isHovered = hoveredNodeId === id;

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (data.artifactId) {
        setFullscreenArtifactId(data.artifactId);
      } else if (data.type === "ARTIFACT" && data.content) {
        sessionStorage.setItem("artifact-code", data.content);
        setFullscreenArtifactId(`content:${data.nodeId}`);
      } else {
        setEditingNodeId(data.nodeId);
      }
    },
    [data.artifactId, data.type, data.content, data.nodeId, setEditingNodeId, setFullscreenArtifactId]
  );

  const isArtifact = data.type === "ARTIFACT" && (data.artifactId || data.content);
  const isLink = data.type === "LINK" && data.content;

  return (
    <div
      className="relative group h-full"
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setHoveredNodeId(id)}
      onMouseLeave={() => setHoveredNodeId(null)}
    >
      <NodeResizer
        minWidth={MIN_WIDTH}
        minHeight={MIN_HEIGHT}
        isVisible={!!selected}
        lineClassName="!border-purple-500/40"
        handleClassName="!w-2.5 !h-2.5 !bg-purple-500 !border-2 !border-purple-300 !rounded-sm"
      />

      {/* Connection handles - one per side, connectionMode="loose" allows any-to-any */}
      <Handle type="source" position={Position.Top} id="top" className="!w-2.5 !h-2.5 !bg-purple-500 !border-2 !border-purple-300 !opacity-0 group-hover:!opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!w-2.5 !h-2.5 !bg-purple-500 !border-2 !border-purple-300 !opacity-0 group-hover:!opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Left} id="left" className="!w-2.5 !h-2.5 !bg-purple-500 !border-2 !border-purple-300 !opacity-0 group-hover:!opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Right} id="right" className="!w-2.5 !h-2.5 !bg-purple-500 !border-2 !border-purple-300 !opacity-0 group-hover:!opacity-100 transition-opacity" />

      {/* Glow */}
      <div
        className="absolute -inset-2 rounded-2xl transition-all duration-300 pointer-events-none"
        style={{
          background: data.color,
          opacity: selected ? 0.15 : isHovered ? 0.08 : 0,
          filter: "blur(16px)",
        }}
      />

      {/* Selection ring */}
      {selected && (
        <div
          className="absolute -inset-[3px] rounded-xl border-2 pointer-events-none"
          style={{
            borderColor: data.color,
            opacity: 0.7,
          }}
        />
      )}

      {/* Card */}
      <div
        className="relative rounded-xl border overflow-hidden transition-all duration-200 h-full flex flex-col"
        style={{
          borderColor: selected
            ? `${data.color}66`
            : isHovered
              ? "rgba(255,255,255,0.15)"
              : "rgba(255,255,255,0.06)",
          background: "rgba(10, 10, 26, 0.85)",
          backdropFilter: "blur(12px)",
          boxShadow: selected
            ? `0 0 20px ${data.color}22, 0 4px 24px rgba(0,0,0,0.4)`
            : "0 4px 16px rgba(0,0,0,0.3)",
          minHeight: MIN_HEIGHT,
        }}
      >
        {/* Color accent bar */}
        <div className="h-1" style={{ background: data.color }} />

        {/* Header */}
        <div className="px-3 py-2 flex items-center gap-2 border-b border-white/5">
          <span className="text-white/50">{typeIcons[data.type]}</span>
          <span className="text-sm font-medium text-white/90 truncate flex-1">
            {data.title}
          </span>
          {isArtifact && data.artifactHtml && (
            <span className="text-[10px] text-purple-400/60 bg-purple-500/10 px-1.5 py-0.5 rounded">
              artifact
            </span>
          )}
        </div>

        {/* Content area */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {isArtifact ? (
            <ArtifactThumbnail html={data.artifactHtml} title={data.title} compact />
          ) : data.type === "IMAGE" && data.content ? (
            <ImageContent url={data.content} compact />
          ) : isLink ? (
            <LinkPreviewContent
              url={data.content!}
              metadata={data.metadata}
              projectId={data.projectId}
              nodeId={data.nodeId}
              compact
            />
          ) : data.content ? (
            <MarkdownContent content={data.content} compact />
          ) : (
            <div className="px-3 py-3 text-center">
              <p className="text-xs text-white/30 italic">Empty node</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const RFKnowledgeNode = memo(RFKnowledgeNodeInner);
