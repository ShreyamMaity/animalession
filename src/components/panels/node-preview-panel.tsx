"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { ArtifactSandpack } from "@/components/artifact/artifact-sandpack";
import { X, Edit, Trash2, Maximize2, ExternalLink } from "lucide-react";
import { useNodes } from "@/hooks/use-nodes";
import type { Node } from "@/types";

interface NodePreviewPanelProps {
  projectId: string;
  nodes: Node[];
}

export function NodePreviewPanel({ projectId, nodes }: NodePreviewPanelProps) {
  const {
    selectedNodeId,
    setShowNodePreview,
    setEditingNodeId,
    setFullscreenArtifactId,
    resetSelection,
  } = useWorkspaceStore();
  const { mutate } = useNodes(projectId);

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  const isArtifact = node.type === "ARTIFACT" && (node.artifactId || node.content);
  const isLink = node.type === "LINK" && node.content;

  async function handleDelete() {
    if (!node || !confirm("Delete this node?")) return;
    await fetch(`/api/projects/${projectId}/nodes/${node.id}`, {
      method: "DELETE",
    });
    mutate();
    resetSelection();
  }

  function handleFullscreen() {
    if (!node) return;
    if (node.artifactId) {
      setFullscreenArtifactId(node.artifactId);
    } else if (node.content) {
      sessionStorage.setItem("artifact-code", node.content);
      setFullscreenArtifactId(`content:${node.id}`);
    }
  }

  return (
    <div className="absolute right-4 top-16 bottom-4 w-96 bg-black/80 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden z-20 flex flex-col">
      <div className="p-4 flex items-center justify-between border-b border-white/10 shrink-0">
        <h3 className="font-medium text-white truncate pr-2">{node.title}</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-white/60 hover:text-white shrink-0"
          onClick={() => {
            setShowNodePreview(false);
            resetSelection();
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="px-4 py-2 flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="text-xs">
            {node.type}
          </Badge>
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: node.color }}
          />
        </div>

        {isArtifact ? (
          <div className="flex-1 min-h-0 mx-4 mb-2 rounded-lg overflow-hidden border border-white/10">
            <ArtifactSandpack
              artifactId={node.artifactId ?? undefined}
              code={!node.artifactId && node.content ? node.content : undefined}
            />
          </div>
        ) : isLink ? (
          <div className="px-4 py-4">
            <a
              href={node.content!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 text-blue-400 hover:text-blue-300 hover:bg-white/10 transition-all group"
            >
              <ExternalLink className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-sm truncate underline underline-offset-2">
                {node.content}
              </span>
            </a>
          </div>
        ) : node.content ? (
          <ScrollArea className="flex-1 min-h-0 overflow-hidden">
            <div className="px-4 pb-4">
              <Separator className="bg-white/10 mb-3" />
              <p className="text-sm text-white/70 whitespace-pre-wrap">
                {node.content}
              </p>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-white/30 italic">No content</p>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-white/10 flex gap-2 shrink-0">
        {isArtifact && (
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={handleFullscreen}
          >
            <Maximize2 className="h-3 w-3 mr-1.5" />
            Open Editor
          </Button>
        )}
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => setEditingNodeId(node.id)}
        >
          <Edit className="h-3 w-3 mr-1.5" />
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
