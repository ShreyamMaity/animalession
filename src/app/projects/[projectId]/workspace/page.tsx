import { notFound, redirect } from "next/navigation";
import { getProject } from "@/services/project-service";
import { getNodes } from "@/services/node-service";
import { getEdges } from "@/services/edge-service";
import { WorkspaceClient } from "@/components/workspace/workspace-client";
import { auth } from "@/lib/auth";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { projectId } = await params;
  const project = await getProject(projectId);

  if (!project || project.userId !== session.user.id) notFound();

  const [nodes, edges] = await Promise.all([
    getNodes(projectId),
    getEdges(projectId),
  ]);

  return (
    <WorkspaceClient
      projectId={projectId}
      projectName={project.name}
      initialNodes={JSON.parse(JSON.stringify(nodes))}
      initialEdges={JSON.parse(JSON.stringify(edges))}
    />
  );
}
