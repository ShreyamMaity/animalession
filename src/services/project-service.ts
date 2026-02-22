import { db } from "@/lib/db";
import type { CreateProjectInput, UpdateProjectInput } from "@/lib/validators";

export async function getProjects(userId: string) {
  return db.project.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: { nodes: true, edges: true },
      },
    },
  });
}

export async function getProject(id: string) {
  return db.project.findUnique({
    where: { id },
    include: {
      _count: {
        select: { nodes: true, edges: true },
      },
    },
  });
}

export async function createProject(data: CreateProjectInput, userId: string) {
  return db.project.create({
    data: {
      name: data.name,
      description: data.description,
      color: data.color ?? "#8b5cf6",
      userId,
    },
    include: {
      _count: {
        select: { nodes: true, edges: true },
      },
    },
  });
}

export async function updateProject(id: string, data: UpdateProjectInput) {
  return db.project.update({
    where: { id },
    data,
    include: {
      _count: {
        select: { nodes: true, edges: true },
      },
    },
  });
}

export async function deleteProject(id: string) {
  return db.project.delete({ where: { id } });
}
