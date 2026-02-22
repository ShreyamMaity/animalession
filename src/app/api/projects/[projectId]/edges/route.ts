import { NextResponse } from "next/server";
import { getEdges, createEdge } from "@/services/edge-service";
import { createEdgeSchema } from "@/lib/validators";
import { getSessionUser, verifyProjectOwnership } from "@/lib/auth-helpers";

type Params = { params: Promise<{ projectId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;
    if (!(await verifyProjectOwnership(projectId, user.id))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const edges = await getEdges(projectId);
    return NextResponse.json(edges);
  } catch (error) {
    console.error("Failed to fetch edges:", error);
    return NextResponse.json(
      { error: "Failed to fetch edges" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;
    if (!(await verifyProjectOwnership(projectId, user.id))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = createEdgeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const edge = await createEdge(projectId, parsed.data);
    return NextResponse.json(edge, { status: 201 });
  } catch (error) {
    console.error("Failed to create edge:", error);
    return NextResponse.json(
      { error: "Failed to create edge" },
      { status: 500 }
    );
  }
}
