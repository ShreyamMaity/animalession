"use client";

import { Line, QuadraticBezierLine } from "@react-three/drei";
import type { Edge } from "@/types";

interface EdgeLineProps {
  edge: Edge;
  sourcePosition: [number, number, number];
  targetPosition: [number, number, number];
}

export function EdgeLine({ edge, sourcePosition, targetPosition }: EdgeLineProps) {
  const midY =
    Math.max(sourcePosition[1], targetPosition[1]) +
    Math.abs(sourcePosition[0] - targetPosition[0]) * 0.15 +
    0.5;

  const dashProps =
    edge.style === "DASHED"
      ? { dashed: true, dashScale: 10, dashSize: 0.3, gapSize: 0.15 }
      : edge.style === "DOTTED"
        ? { dashed: true, dashScale: 20, dashSize: 0.1, gapSize: 0.15 }
        : {};

  return (
    <QuadraticBezierLine
      start={sourcePosition}
      end={targetPosition}
      mid={[
        (sourcePosition[0] + targetPosition[0]) / 2,
        midY,
        (sourcePosition[2] + targetPosition[2]) / 2,
      ]}
      color={edge.color}
      lineWidth={edge.thickness}
      transparent
      opacity={0.6}
      {...dashProps}
    />
  );
}
