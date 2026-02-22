import { db } from "@/lib/db";
import type { CreateEdgeInput, UpdateEdgeInput } from "@/lib/validators";

export async function getEdges(projectId: string) {
  return db.edge.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  });
}

export async function createEdge(projectId: string, data: CreateEdgeInput) {
  return db.edge.create({
    data: {
      projectId,
      sourceNodeId: data.sourceNodeId,
      targetNodeId: data.targetNodeId,
      label: data.label,
      color: data.color ?? "#6366f1",
      style: data.style ?? "SOLID",
      thickness: data.thickness ?? 1,
    },
  });
}

export async function updateEdge(id: string, data: UpdateEdgeInput) {
  return db.edge.update({
    where: { id },
    data,
  });
}

export async function deleteEdge(id: string) {
  return db.edge.delete({ where: { id } });
}
