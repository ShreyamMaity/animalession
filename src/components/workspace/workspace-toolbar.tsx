"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWorkspaceStore } from "@/stores/workspace-store";
import {
  ArrowLeft,
  Sparkles,
  Search,
  Plus,
} from "lucide-react";

interface WorkspaceToolbarProps {
  projectId: string;
  projectName: string;
}

export function WorkspaceToolbar({ projectId, projectName }: WorkspaceToolbarProps) {
  const {
    setShowAIPanel,
    setShowSearchPanel,
    setShowNodeEditor,
    setEditingNodeId,
  } = useWorkspaceStore();

  return (
    <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
      <div className="flex items-center gap-2 pointer-events-auto">
        <Link href="/">
          <Button variant="secondary" size="icon" className="bg-black/50 backdrop-blur-sm border-white/10 hover:bg-black/70">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <span className="text-sm font-medium text-white/80 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-md border border-white/10">
          {projectName}
        </span>
      </div>

      <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-lg p-1 border border-white/10 pointer-events-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => { setEditingNodeId(null); setShowNodeEditor(true); }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Node <Badge variant="outline" className="ml-1 text-[10px]">Ctrl+N</Badge></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowAIPanel(true)}
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>AI Generate <Badge variant="outline" className="ml-1 text-[10px]">Ctrl+G</Badge></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowSearchPanel(true)}
            >
              <Search className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Search <Badge variant="outline" className="ml-1 text-[10px]">Ctrl+K</Badge></TooltipContent>
        </Tooltip>
      </div>

      <div />
    </div>
  );
}
