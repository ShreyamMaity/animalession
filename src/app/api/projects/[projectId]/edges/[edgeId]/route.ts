import { NextResponse } from "next/server";
import { updateEdge, deleteEdge } from "@/services/edge-service";
import { updateEdgeSchema } from "@/lib/validators";
import { getSessionUser, verifyProjectOwnership } from "@/lib/auth-helpers";

type Params = { params: Promise<{ projectId: string; edgeId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, edgeId } = await params;
    if (!(await verifyProjectOwnership(projectId, user.id))) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateEdgeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const edge = await updateEdge(edgeId, parsed.data);
    return NextResponse.json(edge);
  } catch (error) {
    console.error("Failed to update edge:", error);
    return NextResponse.json(
      { error: "Failed to update edge" },
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

    const { projectId, edgeId } = await params;
    if (!(await verifyProjectOwnership(projectId, user.id))) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await deleteEdge(edgeId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete edge:", error);
    return NextResponse.json(
      { error: "Failed to delete edge" },
      { status: 500 }
    );
  }
}
