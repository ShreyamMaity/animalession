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
import { Code, FileText, Eye, EyeOff, Upload } from "lucide-react";
import { MarkdownContent } from "@/components/workspace/node-content-renderers";

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
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleImageUpload(file: File) {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const { url } = await res.json();
        setContent(url);
        if (!title.trim()) setTitle("Pasted Image");
      }
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    if (editingNode) {
      setTitle(editingNode.title);
      setContent(editingNode.content ?? "");
      setColor(editingNode.color);
      setShape(editingNode.shape);
      setType(editingNode.type);
      setSize(editingNode.size);
      // Fetch artifact code if editing an artifact node
      if (editingNode.type === "ARTIFACT" && editingNode.artifactId) {
        fetch(`/api/artifacts/${editingNode.artifactId}`)
          .then((r) => r.json())
          .then((data) => setHtmlCode(data.html || ""))
          .catch(() => setHtmlCode(""));
      } else {
        setHtmlCode(editingNode.content ?? "");
      }
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
      if (type === "ARTIFACT" && htmlCode.trim() && editingNode?.artifactId) {
        // Update existing artifact code + node metadata
        const artifactRes = await fetch(`/api/artifacts/${editingNode.artifactId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim(), html: htmlCode.trim() }),
        });
        if (!artifactRes.ok) throw new Error("Failed to update artifact");

        await fetch(`/api/projects/${projectId}/nodes/${editingNode.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, color, shape, type, size }),
        });
      } else if (type === "ARTIFACT" && htmlCode.trim()) {
        // Create new artifact + node
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

          {isArtifactMode ? (
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Artifact Code
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                HTML document or React component. Supports full HTML pages, JSX with hooks, and inline styles.
              </p>
              <Textarea
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                placeholder={'import { useState } from "react";\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n  return (\n    <div style={{ padding: 20 }}>\n      <h1>Count: {count}</h1>\n      <button onClick={() => setCount(c => c + 1)}>\n        Increment\n      </button>\n    </div>\n  );\n}'}
                rows={10}
                className="!field-sizing-fixed min-h-[200px] max-h-[300px] overflow-y-auto resize-y font-mono text-xs"
              />
            </div>
          ) : type === "IMAGE" ? (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Image</label>
              {/* Paste / Drop zone */}
              <div
                className="border-2 border-dashed border-border/50 rounded-lg p-4 mb-2 text-center cursor-pointer hover:border-purple-500/40 transition-colors"
                onPaste={(e) => {
                  const items = e.clipboardData?.items;
                  if (!items) return;
                  for (const item of items) {
                    if (item.type.startsWith("image/")) {
                      e.preventDefault();
                      const file = item.getAsFile();
                      if (file) handleImageUpload(file);
                      break;
                    }
                  }
                }}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files[0];
                  if (file?.type.startsWith("image/")) handleImageUpload(file);
                }}
                tabIndex={0}
              >
                {uploading ? (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">Uploading...</span>
                  </div>
                ) : content ? (
                  <img src={content} alt="Preview" className="max-h-[120px] mx-auto rounded-lg object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                    <Upload className="h-5 w-5" />
                    <span className="text-xs">Paste image or drag & drop</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-1.5">Or enter a URL:</p>
              <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="https://example.com/image.png"
              />
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium">Content</label>
                {(type === "TEXT" || type === "NOTE") && content.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-muted-foreground px-2"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? (
                      <><EyeOff className="h-3 w-3 mr-1" />Hide Preview</>
                    ) : (
                      <><Eye className="h-3 w-3 mr-1" />Preview</>
                    )}
                  </Button>
                )}
              </div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={type === "LINK" ? "URL (https://...)" : "Node content or notes... (supports markdown)"}
                rows={4}
                className="!field-sizing-fixed max-h-[200px] min-h-[100px] overflow-y-auto resize-y"
              />
              {showPreview && content.length > 0 && (type === "TEXT" || type === "NOTE") && (
                <div className="mt-2 rounded-lg border border-border/50 bg-black/30 max-h-[200px] overflow-y-auto">
                  <MarkdownContent content={content} />
                </div>
              )}
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
            disabled={loading || !title.trim() || (isArtifactMode && !htmlCode.trim())}
          >
            {loading
              ? "Saving..."
              : editingNode
                ? isArtifactMode
                  ? "Update Artifact"
                  : "Update Node"
                : isArtifactMode
                  ? "Create Artifact Node"
                  : "Create Node"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
