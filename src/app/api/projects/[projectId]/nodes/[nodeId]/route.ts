import { NextResponse } from "next/server";
import { getNode, updateNode, deleteNode } from "@/services/node-service";
import { updateNodeSchema } from "@/lib/validators";
import { getSessionUser, verifyProjectOwnership } from "@/lib/auth-helpers";

type Params = { params: Promise<{ projectId: string; nodeId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, nodeId } = await params;
    if (!(await verifyProjectOwnership(projectId, user.id))) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const node = await getNode(nodeId);
    if (!node) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 });
    }

    return NextResponse.json(node);
  } catch (error) {
    console.error("Failed to fetch node:", error);
    return NextResponse.json(
      { error: "Failed to fetch node" },
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

    const { projectId, nodeId } = await params;
    if (!(await verifyProjectOwnership(projectId, user.id))) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateNodeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const node = await updateNode(nodeId, parsed.data);
    return NextResponse.json(node);
  } catch (error) {
    console.error("Failed to update node:", error);
    return NextResponse.json(
      { error: "Failed to update node" },
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

    const { projectId, nodeId } = await params;
    if (!(await verifyProjectOwnership(projectId, user.id))) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await deleteNode(nodeId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete node:", error);
    return NextResponse.json(
      { error: "Failed to delete node" },
      { status: 500 }
    );
  }
}
