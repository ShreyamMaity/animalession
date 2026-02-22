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
  MousePointer2,
  Hand,
  Link2,
  Sparkles,
  Search,
  Plus,
} from "lucide-react";
import type { InteractionMode } from "@/types";

interface WorkspaceToolbarProps {
  projectId: string;
  projectName: string;
}

const modes: { mode: InteractionMode; icon: React.ReactNode; label: string; key: string }[] = [
  { mode: "orbit", icon: <Hand className="h-4 w-4" />, label: "Pan", key: "1" },
  { mode: "select", icon: <MousePointer2 className="h-4 w-4" />, label: "Select & Drag", key: "2" },
  { mode: "connect", icon: <Link2 className="h-4 w-4" />, label: "Connect Nodes", key: "3" },
];

export function WorkspaceToolbar({ projectId, projectName }: WorkspaceToolbarProps) {
  const {
    interactionMode,
    setInteractionMode,
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
        {modes.map(({ mode, icon, label, key }) => (
          <Tooltip key={mode}>
            <TooltipTrigger asChild>
              <Button
                variant={interactionMode === mode ? "secondary" : "ghost"}
                size="icon"
                className={`h-8 w-8 ${
                  interactionMode === mode
                    ? "bg-purple-600 text-white hover:bg-purple-500 ring-2 ring-purple-400/50"
                    : ""
                }`}
                onClick={() => setInteractionMode(mode)}
              >
                {icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {label} <Badge variant="outline" className="ml-1 text-[10px]">{key}</Badge>
            </TooltipContent>
          </Tooltip>
        ))}

        <div className="w-px h-6 bg-white/10 mx-1" />

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
