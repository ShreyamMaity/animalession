"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { Edge } from "@/types";

interface EdgeLine2DProps {
  edge: Edge;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  projectId: string;
  onDeleted?: () => void;
}

export function EdgeLine2D({
  edge,
  sourceX,
  sourceY,
  targetX,
  targetY,
  projectId,
  onDeleted,
}: EdgeLine2DProps) {
  const [hovered, setHovered] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;
  const dist = Math.sqrt((targetX - sourceX) ** 2 + (targetY - sourceY) ** 2);
  const curvature = Math.min(dist * 0.2, 60);

  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const nx = -dy / (dist || 1);
  const ny = dx / (dist || 1);

  const cx = midX + nx * curvature;
  const cy = midY + ny * curvature;

  const strokeDasharray =
    edge.style === "DASHED"
      ? "8 4"
      : edge.style === "DOTTED"
        ? "2 4"
        : undefined;

  const pathD = `M ${sourceX} ${sourceY} Q ${cx} ${cy} ${targetX} ${targetY}`;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(
        `/api/projects/${projectId}/edges/${edge.id}`,
        { method: "DELETE" }
      );
      if (res.ok) onDeleted?.();
    } catch {}
  };

  // Position for the delete button — at the curve's midpoint
  // For a quadratic bezier, the point at t=0.5 is:
  const btnX = 0.25 * sourceX + 0.5 * cx + 0.25 * targetX;
  const btnY = 0.25 * sourceY + 0.5 * cy + 0.25 * targetY;

  return (
    <g
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowDelete(false); }}
      onClick={(e) => { e.stopPropagation(); setShowDelete((v) => !v); }}
      style={{ cursor: "pointer", pointerEvents: "auto" }}
    >
      {/* Invisible wide hit area */}
      <path
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
      />
      {/* Glow effect */}
      <path
        d={pathD}
        fill="none"
        stroke={edge.color}
        strokeWidth={hovered ? edge.thickness * 6 : edge.thickness * 4}
        opacity={hovered ? 0.25 : 0.1}
        strokeLinecap="round"
      />
      {/* Main line */}
      <path
        d={pathD}
        fill="none"
        stroke={hovered ? "#f87171" : edge.color}
        strokeWidth={hovered ? edge.thickness + 1 : edge.thickness}
        opacity={hovered ? 0.9 : 0.6}
        strokeDasharray={strokeDasharray}
        strokeLinecap="round"
        style={{ transition: "stroke 0.15s, opacity 0.15s" }}
      />
      {/* Label */}
      {edge.label && (
        <text
          x={cx}
          y={cy}
          fill="white"
          fontSize={11}
          textAnchor="middle"
          dominantBaseline="middle"
          opacity={0.5}
          style={{ pointerEvents: "none" }}
        >
          {edge.label}
        </text>
      )}
      {/* Delete button */}
      {showDelete && (
        <foreignObject
          x={btnX - 14}
          y={btnY - 14}
          width={28}
          height={28}
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
