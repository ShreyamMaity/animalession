"use client";

import useSWR from "swr";
import type { ProjectWithCounts } from "@/types";

export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR<ProjectWithCounts[]>(
    "/api/projects"
  );

  return {
    projects: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}

export function useProject(projectId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<ProjectWithCounts>(
    projectId ? `/api/projects/${projectId}` : null
  );

  return {
    project: data,
    isLoading,
    isError: !!error,
    mutate,
  };
}
