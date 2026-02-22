"use client";

import { useState, useMemo } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { Badge } from "@/components/ui/badge";
import type { Node } from "@/types";

interface SearchPanelProps {
  nodes: Node[];
  projectId: string;
}

export function SearchPanel({ nodes }: SearchPanelProps) {
  const { showSearchPanel, setShowSearchPanel, setSelectedNodeId } =
    useWorkspaceStore();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return nodes;
    const q = search.toLowerCase();
    return nodes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content?.toLowerCase().includes(q)
    );
  }, [nodes, search]);

  function handleSelect(nodeId: string) {
    setSelectedNodeId(nodeId);
    setShowSearchPanel(false);
    setSearch("");
  }

  return (
    <CommandDialog open={showSearchPanel} onOpenChange={setShowSearchPanel}>
      <CommandInput
        placeholder="Search nodes..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No nodes found.</CommandEmpty>
        <CommandGroup heading="Nodes">
          {filtered.map((node) => (
            <CommandItem
              key={node.id}
              value={node.title}
              onSelect={() => handleSelect(node.id)}
              className="flex items-center gap-2"
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: node.color }}
              />
              <span className="truncate">{node.title}</span>
              <Badge variant="outline" className="ml-auto text-[10px]">
                {node.type}
              </Badge>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
