import type { Edge as PrismaEdge, NodeWithArtifact } from "@/types";
import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";

export interface KnowledgeNodeData {
  title: string;
  type: string;
  content: string | null;
  color: string;
  artifactId: string | null;
  artifactHtml: string | null;
  metadata: unknown;
  projectId: string;
  nodeId: string;
  [key: string]: unknown;
}

export interface KnowledgeEdgeData {
  label: string | null;
  color: string;
  style: string;
  thickness: number;
  edgeId: string;
  projectId: string;
  [key: string]: unknown;
}

export function toRFNode(node: NodeWithArtifact): RFNode<KnowledgeNodeData> {
  return {
    id: node.id,
    type: "knowledge",
    position: { x: node.posX, y: node.posY },
    width: node.width || undefined,
    height: node.height || undefined,
    data: {
      title: node.title,
      type: node.type,
      content: node.content,
      color: node.color,
      artifactId: node.artifactId,
      artifactHtml: node.artifact?.html ?? null,
      metadata: node.metadata,
      projectId: node.projectId,
      nodeId: node.id,
    },
  };
}

export function toRFEdge(
  edge: PrismaEdge
): RFEdge<KnowledgeEdgeData> {
  return {
    id: edge.id,
    source: edge.sourceNodeId,
    target: edge.targetNodeId,
    sourceHandle: edge.sourceHandle ?? undefined,
    targetHandle: edge.targetHandle ?? undefined,
    type: "knowledge",
    data: {
      label: edge.label,
      color: edge.color,
      style: edge.style,
      thickness: edge.thickness,
      edgeId: edge.id,
      projectId: edge.projectId,
    },
  };
}

export function toRFNodes(nodes: NodeWithArtifact[]): RFNode<KnowledgeNodeData>[] {
  return nodes.map(toRFNode);
}

export function toRFEdges(edges: PrismaEdge[]): RFEdge<KnowledgeEdgeData>[] {
  return edges.map(toRFEdge);
}
