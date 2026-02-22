import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import type { CreateArtifactInput } from "@/lib/validators";

export async function getArtifact(id: string) {
  return db.artifact.findUnique({ where: { id } });
}

export async function createArtifact(data: CreateArtifactInput) {
  return db.artifact.create({
    data: {
      title: data.title,
      html: data.html,
      css: data.css,
      js: data.js,
      prompt: data.prompt,
      model: data.model,
      metadata: (data.metadata as Prisma.InputJsonValue) ?? undefined,
    },
  });
}

export async function updateArtifact(
  id: string,
  data: Partial<CreateArtifactInput>
) {
  return db.artifact.update({
    where: { id },
    data: {
      title: data.title,
      html: data.html,
      css: data.css,
      js: data.js,
      prompt: data.prompt,
      model: data.model,
      metadata: (data.metadata as Prisma.InputJsonValue) ?? undefined,
    },
  });
}

export async function deleteArtifact(id: string) {
  return db.artifact.delete({ where: { id } });
}
