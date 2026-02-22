"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useNodes } from "@/hooks/use-nodes";
import { NODE_COLORS } from "@/lib/constants";
import { getSpiralPosition } from "@/lib/constants";
import { Code, FileText } from "lucide-react";

interface NodeEditorPanelProps {
  projectId: string;
}

const shapes = ["SPHERE", "CUBE", "OCTAHEDRON", "TORUS"] as const;
const types = ["TEXT", "ARTIFACT", "LINK", "IMAGE", "NOTE"] as const;

export function NodeEditorPanel({ projectId }: NodeEditorPanelProps) {
  const { showNodeEditor, setShowNodeEditor, editingNodeId, setEditingNodeId } =
    useWorkspaceStore();
  const { nodes, mutate } = useNodes(projectId);

  const editingNode = editingNodeId
    ? nodes.find((n) => n.id === editingNodeId)
    : null;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [htmlCode, setHtmlCode] = useState("");
  const [color, setColor] = useState<string>(NODE_COLORS[0]);
  const [shape, setShape] = useState<(typeof shapes)[number]>("SPHERE");
  const [type, setType] = useState<(typeof types)[number]>("TEXT");
  const [size, setSize] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingNode) {
      setTitle(editingNode.title);
      setContent(editingNode.content ?? "");
      setColor(editingNode.color);
      setShape(editingNode.shape);
      setType(editingNode.type);
      setSize(editingNode.size);
      setHtmlCode("");
    } else {
      setTitle("");
      setContent("");
      setHtmlCode("");
      setColor(NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)]);
      setShape("SPHERE");
      setType("TEXT");
      setSize(1);
    }
  }, [editingNode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      if (type === "ARTIFACT" && htmlCode.trim()) {
        // Create artifact first, then node linked to it
        const artifactRes = await fetch("/api/artifacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            html: htmlCode.trim(),
            projectId,
          }),
        });

        if (!artifactRes.ok) {
          throw new Error("Failed to create artifact");
        }
      } else if (editingNode) {
        await fetch(`/api/projects/${projectId}/nodes/${editingNode.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content: content || undefined,
            color,
            shape,
            type,
            size,
          }),
        });
      } else {
        const pos = getSpiralPosition(nodes.length);
        await fetch(`/api/projects/${projectId}/nodes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content: content || undefined,
            color,
            shape,
            type,
            size,
            posX: pos[0],
            posY: pos[1],
            posZ: pos[2],
          }),
        });
      }
      mutate();
      setShowNodeEditor(false);
      setEditingNodeId(null);
    } finally {
      setLoading(false);
    }
  }

  const isArtifactMode = type === "ARTIFACT";

  return (
    <Sheet
      open={showNodeEditor}
      onOpenChange={(open) => {
        setShowNodeEditor(open);
        if (!open) setEditingNodeId(null);
      }}
    >
      <SheetContent className="w-[420px] bg-background/95 backdrop-blur-xl border-border/50 overflow-hidden">
        <SheetHeader className="shrink-0">
          <SheetTitle>{editingNode ? "Edit Node" : "New Node"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 px-4 pb-6 min-h-0">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Node title"
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Type</label>
            <div className="flex gap-1.5 flex-wrap">
              {types.map((t) => (
                <Button
                  key={t}
                  type="button"
                  variant={type === t ? "default" : "outline"}
                  size="sm"
                  onClick={() => setType(t)}
                  className="text-xs"
                >
                  {t === "ARTIFACT" && <Code className="h-3 w-3 mr-1" />}
                  {t === "TEXT" && <FileText className="h-3 w-3 mr-1" />}
                  {t}
                </Button>
              ))}
            </div>
          </div>

          {isArtifactMode && !editingNode ? (
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                React / JSX Code
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Paste a React component as default export. Supports JSX, hooks, and inline styles.
              </p>
              <Textarea
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                placeholder={'import { useState } from "react";\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n  return (\n    <div style={{ padding: 20 }}>\n      <h1>Count: {count}</h1>\n      <button onClick={() => setCount(c => c + 1)}>\n        Increment\n      </button>\n    </div>\n  );\n}'}
                rows={10}
                className="!field-sizing-fixed min-h-[200px] max-h-[300px] overflow-y-auto resize-y font-mono text-xs"
              />
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Content</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Node content or notes..."
                rows={4}
                className="!field-sizing-fixed max-h-[200px] min-h-[100px] overflow-y-auto resize-y"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-1.5 block">Shape</label>
            <div className="flex gap-1.5">
              {shapes.map((s) => (
                <Button
                  key={s}
                  type="button"
                  variant={shape === s ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShape(s)}
                  className="text-xs"
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Color</label>
            <div className="flex gap-2 flex-wrap">
              {NODE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    outline: color === c ? "2px solid white" : "2px solid transparent",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Size: {size.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.3"
              max="3"
              step="0.1"
              value={size}
              onChange={(e) => setSize(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !title.trim() || (isArtifactMode && !editingNode && !htmlCode.trim())}
          >
            {loading
              ? "Saving..."
              : editingNode
                ? "Update Node"
                : isArtifactMode
                  ? "Create Artifact Node"
                  : "Create Node"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
