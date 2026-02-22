"use client";

import useSWR from "swr";
import type { Edge } from "@/types";

export function useEdges(projectId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Edge[]>(
    projectId ? `/api/projects/${projectId}/edges` : null
  );

  return {
    edges: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}
