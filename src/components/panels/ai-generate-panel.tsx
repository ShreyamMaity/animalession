"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useNodes } from "@/hooks/use-nodes";
import { Sparkles, Loader2 } from "lucide-react";
import { getSpiralPosition } from "@/lib/constants";

interface AIGeneratePanelProps {
  projectId: string;
  nodeCount: number;
}

export function AIGeneratePanel({ projectId, nodeCount }: AIGeneratePanelProps) {
  const { showAIPanel, setShowAIPanel } = useWorkspaceStore();
  const { mutate } = useNodes(projectId);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");

    const pos = getSpiralPosition(nodeCount);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          projectId,
          posX: pos[0],
          posY: pos[1],
          posZ: pos[2],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }

      setPrompt("");
      setShowAIPanel(false);
      mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={showAIPanel} onOpenChange={setShowAIPanel}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate with Claude AI
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleGenerate} className="space-y-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want Claude to create...&#10;&#10;e.g., 'Create an interactive periodic table with element details on hover'"
            rows={5}
            autoFocus
          />

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full gap-2"
            disabled={loading || !prompt.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Artifact
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
