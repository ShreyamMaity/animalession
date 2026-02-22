"use client";

import { Stars, Grid } from "@react-three/drei";
import { KnowledgeNode } from "./knowledge-node";
import { EdgeLine } from "./edge-line";
import type { Node, Edge } from "@/types";

interface SceneProps {
  nodes: Node[];
  edges: Edge[];
  projectId: string;
}

export function Scene({ nodes, edges, projectId }: SceneProps) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 15, 10]} intensity={0.8} color="#8b5cf6" />
      <pointLight position={[-10, 10, -10]} intensity={0.4} color="#6366f1" />

      <Stars
        radius={100}
        depth={60}
        count={2000}
        factor={3}
        saturation={0.2}
        fade
        speed={0.5}
      />

      <Grid
        position={[0, -0.5, 0]}
        args={[100, 100]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#1a1a2e"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#2a2a4e"
        fadeDistance={50}
        fadeStrength={1}
        infiniteGrid
      />

      {edges.map((edge) => {
        const source = nodeMap.get(edge.sourceNodeId);
        const target = nodeMap.get(edge.targetNodeId);
        if (!source || !target) return null;

        return (
          <EdgeLine
            key={edge.id}
            edge={edge}
            sourcePosition={[source.posX, source.posY, source.posZ]}
            targetPosition={[target.posX, target.posY, target.posZ]}
          />
        );
      })}

      {nodes.map((node) => (
        <KnowledgeNode key={node.id} node={node} projectId={projectId} />
      ))}
    </>
  );
}
