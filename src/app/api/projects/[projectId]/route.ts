import { NextResponse } from "next/server";
import {
  getProject,
  updateProject,
  deleteProject,
} from "@/services/project-service";
import { updateProjectSchema } from "@/lib/validators";
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

    const project = await getProject(projectId);
    return NextResponse.json(project);
  } catch (error) {
    console.error("Failed to fetch project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
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

    const { projectId } = await params;
    if (!(await verifyProjectOwnership(projectId, user.id))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const project = await updateProject(projectId, parsed.data);
    return NextResponse.json(project);
  } catch (error) {
    console.error("Failed to update project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
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

    const { projectId } = await params;
    if (!(await verifyProjectOwnership(projectId, user.id))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await deleteProject(projectId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
