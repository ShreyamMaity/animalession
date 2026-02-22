import { NextResponse } from "next/server";
import {
  getArtifact,
  updateArtifact,
  deleteArtifact,
} from "@/services/artifact-service";
import { getSessionUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

type Params = { params: Promise<{ artifactId: string }> };

async function verifyArtifactOwnership(artifactId: string, userId: string) {
  const node = await db.node.findFirst({
    where: { artifactId },
    select: { project: { select: { userId: true } } },
  });
  return node?.project?.userId === userId;
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { artifactId } = await params;
    if (!(await verifyArtifactOwnership(artifactId, user.id))) {
      return NextResponse.json(
        { error: "Artifact not found" },
        { status: 404 }
      );
    }

    const artifact = await getArtifact(artifactId);
    if (!artifact) {
      return NextResponse.json(
        { error: "Artifact not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(artifact);
  } catch (error) {
    console.error("Failed to fetch artifact:", error);
    return NextResponse.json(
      { error: "Failed to fetch artifact" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { artifactId } = await params;
    if (!(await verifyArtifactOwnership(artifactId, user.id))) {
      return NextResponse.json(
        { error: "Artifact not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const artifact = await updateArtifact(artifactId, body);
    return NextResponse.json(artifact);
  } catch (error) {
    console.error("Failed to update artifact:", error);
    return NextResponse.json(
      { error: "Failed to update artifact" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { artifactId } = await params;
    if (!(await verifyArtifactOwnership(artifactId, user.id))) {
      return NextResponse.json(
        { error: "Artifact not found" },
        { status: 404 }
      );
    }

    await deleteArtifact(artifactId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete artifact:", error);
    return NextResponse.json(
      { error: "Failed to delete artifact" },
      { status: 500 }
    );
  }
}
