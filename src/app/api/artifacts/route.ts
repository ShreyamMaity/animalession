import { NextResponse } from "next/server";
import { createArtifact } from "@/services/artifact-service";
import { createNode } from "@/services/node-service";
import { createArtifactSchema } from "@/lib/validators";
import { getSpiralPosition } from "@/lib/constants";
import { db } from "@/lib/db";
import { getSessionUser, verifyProjectOwnership } from "@/lib/auth-helpers";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createArtifactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    if (parsed.data.projectId) {
      if (!(await verifyProjectOwnership(parsed.data.projectId, user.id))) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
    }

    const artifact = await createArtifact(parsed.data);

    if (parsed.data.projectId) {
      const nodeCount = await db.node.count({
        where: { projectId: parsed.data.projectId },
      });
      const pos = getSpiralPosition(nodeCount);

      await createNode(parsed.data.projectId, {
        title: parsed.data.title,
        type: "ARTIFACT",
        artifactId: artifact.id,
        color: "#8b5cf6",
        posX: pos[0],
        posY: pos[1],
        posZ: pos[2],
      });
    }

    return NextResponse.json(artifact, { status: 201 });
  } catch (error) {
    console.error("Failed to create artifact:", error);
    return NextResponse.json(
      { error: "Failed to create artifact" },
      { status: 500 }
    );
  }
}
