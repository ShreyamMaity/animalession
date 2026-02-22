import { NextResponse } from "next/server";
import { getNodes, createNode } from "@/services/node-service";
import { createNodeSchema } from "@/lib/validators";
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

    const nodes = await getNodes(projectId);
    return NextResponse.json(nodes);
  } catch (error) {
    console.error("Failed to fetch nodes:", error);
    return NextResponse.json(
      { error: "Failed to fetch nodes" },
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
    const parsed = createNodeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const node = await createNode(projectId, parsed.data);
    return NextResponse.json(node, { status: 201 });
  } catch (error) {
    console.error("Failed to create node:", error);
    return NextResponse.json(
      { error: "Failed to create node" },
      { status: 500 }
    );
  }
}
