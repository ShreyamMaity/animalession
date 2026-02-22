"use client";

import { useProjects } from "@/hooks/use-projects";
import { ProjectCard } from "./project-card";
import { CreateProjectDialog } from "./create-project-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export function ProjectGrid() {
  const { projects, isLoading, mutate } = useProjects();

  async function handleDelete(id: string) {
    if (!confirm("Delete this project and all its data?")) return;

    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    mutate();
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your knowledge workspaces
          </p>
        </div>
        <CreateProjectDialog onCreated={() => mutate()} />
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">+</span>
          </div>
          <h3 className="font-medium text-lg mb-1">No projects yet</h3>
          <p className="text-muted-foreground text-sm">
            Create your first project to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
