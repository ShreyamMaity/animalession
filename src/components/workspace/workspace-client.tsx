"use client";

import { useCallback, useEffect, useRef } from "react";
import { Canvas2D } from "./canvas-2d";
import { WorkspaceToolbar } from "./workspace-toolbar";
import { QuickMenu } from "./quick-menu";
import { NodeEditorPanel } from "@/components/panels/node-editor-panel";
import { NodePreviewPanel } from "@/components/panels/node-preview-panel";
import { AIGeneratePanel } from "@/components/panels/ai-generate-panel";
import { SearchPanel } from "@/components/panels/search-panel";
import { ArtifactFullscreen } from "@/components/artifact/artifact-fullscreen";
import { useNodes } from "@/hooks/use-nodes";
import { useEdges } from "@/hooks/use-edges";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { Node, Edge } from "@/types";

interface WorkspaceClientProps {
  projectId: string;
  projectName: string;
  initialNodes: Node[];
  initialEdges: Edge[];
}

export function WorkspaceClient({
  projectId,
  projectName,
  initialNodes,
  initialEdges,
}: WorkspaceClientProps) {
  const { nodes, mutate: mutateNodes } = useNodes(projectId);
  const { edges } = useEdges(projectId);
  const mousePos = useRef({ x: 0, y: 0 });
  const {
    showNodeEditor,
    showNodePreview,
    showAIPanel,
    showSearchPanel,
    fullscreenArtifactId,
    quickMenu,
    setShowAIPanel,
    setShowSearchPanel,
    setFullscreenArtifactId,
    resetSelection,
    setInteractionMode,
    setShowNodeEditor,
    setQuickMenu,
  } = useWorkspaceStore();

  const currentNodes = nodes.length > 0 ? nodes : initialNodes;
  const currentEdges = edges.length > 0 ? edges : initialEdges;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "Escape") {
        setFullscreenArtifactId(null);
        resetSelection();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "g") {
        e.preventDefault();
        setShowAIPanel(true);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowSearchPanel(true);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        setShowNodeEditor(true);
        return;
      }

      if (e.key === "1") setInteractionMode("orbit");
      if (e.key === "2") setInteractionMode("select");
      if (e.key === "3") setInteractionMode("connect");

      if (e.key === "/") {
        e.preventDefault();
        setQuickMenu({
          open: true,
          x: mousePos.current.x,
          y: mousePos.current.y,
          canvasX: 0,
          canvasY: 0,
        });
      }
    },
    [
      setShowAIPanel,
      setShowSearchPanel,
      setShowNodeEditor,
      setFullscreenArtifactId,
      resetSelection,
      setInteractionMode,
      setQuickMenu,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    function trackMouse(e: MouseEvent) {
      mousePos.current = { x: e.clientX, y: e.clientY };
    }
    window.addEventListener("mousemove", trackMouse);
    return () => window.removeEventListener("mousemove", trackMouse);
  }, []);

  const handleCreateNodeFromMenu = useCallback(
    async (type: string, canvasX: number, canvasY: number) => {
      const res = await fetch(`/api/projects/${projectId}/nodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `New ${type.charAt(0) + type.slice(1).toLowerCase()}`,
          type,
          posX: canvasX || 0,
          posY: canvasY || 0,
          color: "#8b5cf6",
        }),
      });
      if (res.ok) mutateNodes();
    },
    [projectId, mutateNodes]
  );

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      <Canvas2D
        nodes={currentNodes}
        edges={currentEdges}
        projectId={projectId}
      />

      <WorkspaceToolbar projectId={projectId} projectName={projectName} />

      {showNodePreview && (
        <NodePreviewPanel
          projectId={projectId}
          nodes={currentNodes}
        />
      )}

      {showNodeEditor && <NodeEditorPanel projectId={projectId} />}

      {showAIPanel && <AIGeneratePanel projectId={projectId} nodeCount={currentNodes.length} />}

      {showSearchPanel && (
        <SearchPanel nodes={currentNodes} projectId={projectId} />
      )}

      {fullscreenArtifactId && (
        <ArtifactFullscreen artifactId={fullscreenArtifactId} />
      )}

      <QuickMenu
        projectId={projectId}
        onCreateNode={handleCreateNodeFromMenu}
      />
    </div>
  );
}
