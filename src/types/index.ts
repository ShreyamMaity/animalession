import type { Project, Node, Edge, Artifact } from "@prisma/client";

export type { Project, Node, Edge, Artifact };

export type NodeWithArtifact = Node & {
  artifact?: Artifact | null;
};

export type ProjectWithCounts = Project & {
  _count: {
    nodes: number;
    edges: number;
  };
};

export interface QuickMenuState {
  open: boolean;
  x: number;
  y: number;
  canvasX: number;
  canvasY: number;
}

export interface WorkspaceState {
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  showNodeEditor: boolean;
  showNodePreview: boolean;
  showAIPanel: boolean;
  showSearchPanel: boolean;
  editingNodeId: string | null;
  fullscreenArtifactId: string | null;
  quickMenu: QuickMenuState;

  setSelectedNodeId: (id: string | null) => void;
  setHoveredNodeId: (id: string | null) => void;
  setShowNodeEditor: (show: boolean) => void;
  setShowNodePreview: (show: boolean) => void;
  setShowAIPanel: (show: boolean) => void;
  setShowSearchPanel: (show: boolean) => void;
  setEditingNodeId: (id: string | null) => void;
  setFullscreenArtifactId: (id: string | null) => void;
  setQuickMenu: (menu: QuickMenuState) => void;
  resetSelection: () => void;
}
