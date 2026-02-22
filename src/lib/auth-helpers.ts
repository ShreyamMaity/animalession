import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function verifyProjectOwnership(
  projectId: string,
  userId: string
): Promise<boolean> {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { userId: true },
  });
  return project?.userId === userId;
}
