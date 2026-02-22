"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Trash2, Box, GitBranch } from "lucide-react";
import type { ProjectWithCounts } from "@/types";

interface ProjectCardProps {
  project: ProjectWithCounts;
  onDelete: (id: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}/workspace`}>
      <Card className="group relative overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer bg-card/50 backdrop-blur-sm">
        <div
          className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
          style={{
            background: `linear-gradient(135deg, ${project.color}44, transparent 60%)`,
          }}
        />
        <div
          className="h-1.5 w-full"
          style={{ backgroundColor: project.color }}
        />
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-lg truncate pr-2">
              {project.name}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    onDelete(project.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {project.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {project.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Box className="h-3 w-3" />
              {project._count.nodes} nodes
            </span>
            <span className="flex items-center gap-1">
              <GitBranch className="h-3 w-3" />
              {project._count.edges} edges
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
