import { create } from "zustand";
import type { WorkspaceState } from "@/types";

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  selectedNodeId: null,
  hoveredNodeId: null,
  showNodeEditor: false,
  showNodePreview: false,
  showAIPanel: false,
  showSearchPanel: false,
  editingNodeId: null,
  fullscreenArtifactId: null,
  quickMenu: { open: false, x: 0, y: 0, canvasX: 0, canvasY: 0 },

  setSelectedNodeId: (id) =>
    set({ selectedNodeId: id, showNodePreview: id !== null }),
  setHoveredNodeId: (id) => set({ hoveredNodeId: id }),
  setShowNodeEditor: (show) => set({ showNodeEditor: show }),
  setShowNodePreview: (show) => set({ showNodePreview: show }),
  setShowAIPanel: (show) => set({ showAIPanel: show }),
  setShowSearchPanel: (show) => set({ showSearchPanel: show }),
  setEditingNodeId: (id) =>
    set({ editingNodeId: id, showNodeEditor: id !== null }),
  setFullscreenArtifactId: (id) => set({ fullscreenArtifactId: id }),
  setQuickMenu: (menu) => set({ quickMenu: menu }),
  resetSelection: () =>
    set({
      selectedNodeId: null,
      hoveredNodeId: null,
      showNodePreview: false,
      showNodeEditor: false,
      editingNodeId: null,
    }),
}));
