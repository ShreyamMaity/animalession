import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import type { CreateNodeInput, UpdateNodeInput } from "@/lib/validators";

export async function getNodes(projectId: string) {
  return db.node.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  });
}

export async function getNode(id: string) {
  return db.node.findUnique({
    where: { id },
    include: { artifact: true },
  });
}

export async function createNode(projectId: string, data: CreateNodeInput) {
  return db.node.create({
    data: {
      projectId,
      title: data.title,
      type: data.type ?? "TEXT",
      content: data.content,
      posX: data.posX ?? 0,
      posY: data.posY ?? 0,
      posZ: data.posZ ?? 0,
      color: data.color ?? "#8b5cf6",
      size: data.size ?? 1,
      shape: data.shape ?? "SPHERE",
      artifactId: data.artifactId,
      metadata: (data.metadata as Prisma.InputJsonValue) ?? undefined,
    },
  });
}

export async function updateNode(id: string, data: UpdateNodeInput) {
  const { metadata, ...rest } = data;
  return db.node.update({
    where: { id },
    data: {
      ...rest,
      metadata: (metadata as Prisma.InputJsonValue) ?? undefined,
    },
  });
}

export async function deleteNode(id: string) {
  return db.node.delete({ where: { id } });
}
