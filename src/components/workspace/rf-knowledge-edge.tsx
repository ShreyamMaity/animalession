"use client";

import { memo, useState, useCallback, useRef } from "react";
import {
  getBezierPath,
  BaseEdge,
  type EdgeProps,
} from "@xyflow/react";
import { Trash2 } from "lucide-react";
import type { KnowledgeEdgeData } from "@/lib/reactflow-transforms";

function RFKnowledgeEdgeInner({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps & { data: KnowledgeEdgeData }) {
  const [hovered, setHovered] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const deletingRef = useRef(false);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const strokeDasharray =
    data.style === "DASHED"
      ? "8 4"
      : data.style === "DOTTED"
        ? "2 4"
        : undefined;

  const handleDelete = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (deletingRef.current) return;
      deletingRef.current = true;
      try {
        const res = await fetch(
          `/api/projects/${data.projectId}/edges/${data.edgeId}`,
          { method: "DELETE" }
        );
        if (res.ok) {
          window.dispatchEvent(new CustomEvent("edge-deleted"));
        }
      } catch { /* ignore */ }
      deletingRef.current = false;
    },
    [data.projectId, data.edgeId]
  );

  return (
    <g
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowDelete(false); }}
      onClick={(e) => { e.stopPropagation(); setShowDelete((v) => !v); }}
      style={{ cursor: "pointer" }}
    >
      {/* Invisible wide hit area */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
      />
      {/* Glow effect */}
      <path
        d={edgePath}
        fill="none"
        stroke={data.color}
        strokeWidth={hovered ? data.thickness * 6 : data.thickness * 4}
        opacity={hovered ? 0.25 : 0.1}
        strokeLinecap="round"
      />
      {/* Main line */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: hovered ? "#f87171" : data.color,
          strokeWidth: hovered ? data.thickness + 1 : data.thickness,
          opacity: hovered ? 0.9 : 0.6,
          strokeDasharray,
          strokeLinecap: "round",
          transition: "stroke 0.15s, opacity 0.15s",
        }}
      />
      {/* Label */}
      {data.label && (
        <text
          x={labelX}
          y={labelY}
          fill="white"
          fontSize={11}
          textAnchor="middle"
          dominantBaseline="middle"
          opacity={0.5}
          style={{ pointerEvents: "none" }}
        >
          {data.label}
        </text>
      )}
      {/* Delete button */}
      {showDelete && (
        <foreignObject
          x={labelX - 14}
          y={labelY - 14}
          width={28}
          height={28}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleDelete}
            title="Delete edge"
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#dc2626",
              border: "2px solid rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <Trash2 style={{ width: 14, height: 14, color: "white" }} />
          </button>
        </foreignObject>
      )}
    </g>
  );
}

export const RFKnowledgeEdge = memo(RFKnowledgeEdgeInner);
