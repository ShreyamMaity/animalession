"use client";

import { useCallback, useEffect, useRef } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { ReactFlowCanvas } from "./react-flow-canvas";
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
import type { NodeWithArtifact, Edge } from "@/types";

interface WorkspaceClientProps {
  projectId: string;
  projectName: string;
  initialNodes: NodeWithArtifact[];
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

  // Clipboard paste: create IMAGE node from pasted image
  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      // Skip if user is typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) continue;

          // Upload the image
          const formData = new FormData();
          formData.append("file", file);

          try {
            const uploadRes = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });
            if (!uploadRes.ok) continue;
            const { url } = await uploadRes.json();

            // Create an IMAGE node at a reasonable position
            const nodeCount = currentNodes.length;
            const posX = 100 + (nodeCount % 5) * 300;
            const posY = 100 + Math.floor(nodeCount / 5) * 250;

            const nodeRes = await fetch(`/api/projects/${projectId}/nodes`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: `Pasted Image`,
                type: "IMAGE",
                content: url,
                posX,
                posY,
                color: "#06b6d4",
              }),
            });
            if (nodeRes.ok) mutateNodes();
          } catch {
            // Silently fail
          }
          break; // Only handle the first image
        }
      }
    },
    [projectId, currentNodes.length, mutateNodes]
  );

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

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
      <ReactFlowProvider>
        <ReactFlowCanvas
          nodes={currentNodes}
          edges={currentEdges}
          projectId={projectId}
        />
      </ReactFlowProvider>

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
