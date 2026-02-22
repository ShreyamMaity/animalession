"use client";

import useSWR from "swr";
import type { Node } from "@/types";

export function useNodes(projectId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Node[]>(
    projectId ? `/api/projects/${projectId}/nodes` : null
  );

  return {
    nodes: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}
