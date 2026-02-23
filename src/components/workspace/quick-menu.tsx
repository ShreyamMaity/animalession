"use client";

import { useEffect, useRef } from "react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import {
  FileText,
  Code,
  Link2,
  StickyNote,
  Sparkles,
  Search,
} from "lucide-react";

interface QuickMenuProps {
  projectId: string;
  onCreateNode: (type: string, canvasX: number, canvasY: number) => void;
}

const menuItems = [
  { id: "text", icon: <FileText className="h-4 w-4" />, label: "New Text Node", group: "create" },
  { id: "artifact", icon: <Code className="h-4 w-4" />, label: "New Artifact Node", group: "create" },
  { id: "link", icon: <Link2 className="h-4 w-4" />, label: "New Link Node", group: "create" },
  { id: "note", icon: <StickyNote className="h-4 w-4" />, label: "New Note Node", group: "create" },
  { id: "divider-1", icon: null, label: "", group: "divider" },
  { id: "ai", icon: <Sparkles className="h-4 w-4" />, label: "AI Generate", group: "action" },
  { id: "search", icon: <Search className="h-4 w-4" />, label: "Search", group: "action" },
];

export function QuickMenu({ projectId, onCreateNode }: QuickMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    quickMenu,
    setQuickMenu,
    setShowAIPanel,
    setShowSearchPanel,
  } = useWorkspaceStore();

  useEffect(() => {
    if (!quickMenu.open) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as HTMLElement)) {
        setQuickMenu({ ...quickMenu, open: false });
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setQuickMenu({ ...quickMenu, open: false });
      }
    }
    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [quickMenu, setQuickMenu]);

  if (!quickMenu.open) return null;

  function handleSelect(id: string) {
    setQuickMenu({ ...quickMenu, open: false });

    switch (id) {
      case "text":
        onCreateNode("TEXT", quickMenu.canvasX, quickMenu.canvasY);
        break;
      case "artifact":
        onCreateNode("ARTIFACT", quickMenu.canvasX, quickMenu.canvasY);
        break;
      case "link":
        onCreateNode("LINK", quickMenu.canvasX, quickMenu.canvasY);
        break;
      case "note":
        onCreateNode("NOTE", quickMenu.canvasX, quickMenu.canvasY);
        break;
      case "ai":
        setShowAIPanel(true);
        break;
      case "search":
        setShowSearchPanel(true);
        break;
    }
  }

  // Clamp position to viewport
  const menuW = 200;
  const menuH = 260;
  const x = Math.min(quickMenu.x, window.innerWidth - menuW - 8);
  const y = Math.min(quickMenu.y, window.innerHeight - menuH - 8);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 animate-in fade-in zoom-in-95 duration-100"
      style={{ left: x, top: y }}
    >
      <div className="bg-[#0a0a1a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-1.5 min-w-[200px]">
        <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-white/30 font-medium">
          Quick Actions
        </div>
        {menuItems.map((item) =>
          item.group === "divider" ? (
            <div key={item.id} className="my-1 border-t border-white/5" />
          ) : (
            <button
              key={item.id}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              onClick={() => handleSelect(item.id)}
            >
              <span className="text-white/50">{item.icon}</span>
              {item.label}
            </button>
          )
        )}
      </div>
    </div>
  );
}
