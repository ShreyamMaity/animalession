"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PROJECT_COLORS } from "@/lib/constants";
import { Plus } from "lucide-react";

interface CreateProjectDialogProps {
  onCreated: () => void;
}

export function CreateProjectDialog({ onCreated }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<string>(PROJECT_COLORS[0]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined, color }),
      });

      if (res.ok) {
        setName("");
        setDescription("");
        setColor(PROJECT_COLORS[0]);
        setOpen(false);
        onCreated();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Research Project"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this project about?"
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Color</label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    outline:
                      color === c ? "2px solid white" : "2px solid transparent",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading || !name.trim()}>
            {loading ? "Creating..." : "Create Project"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
