"use client";

import { useEffect, useState } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
} from "@codesandbox/sandpack-react";
import { X } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";

interface ArtifactFullscreenProps {
  artifactId: string;
}

const HEADER_HEIGHT = 48;

// Minimal CSS injected into Sandpack — only ensures html/body/#root fill
// the iframe viewport. The artifact's own layout handles the rest.
const FULLSCREEN_STYLES = `
html, body, #root {
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}
#root > div {
  min-height: 100% !important;
}
`;

export function ArtifactFullscreen({ artifactId }: ArtifactFullscreenProps) {
  const { setFullscreenArtifactId } = useWorkspaceStore();
  const [code, setCode] = useState<string | null>(null);
  const [title, setTitle] = useState("Artifact");

  useEffect(() => {
    if (artifactId.startsWith("content:")) {
      const stored = sessionStorage.getItem("artifact-code");
      if (stored) {
        setCode(stored);
        setTitle("Artifact");
      }
      return;
    }

    fetch(`/api/artifacts/${artifactId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.html) {
          setCode(data.html);
          setTitle(data.title || "Artifact");
        }
      })
      .catch(() => {});
  }, [artifactId]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setFullscreenArtifactId(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setFullscreenArtifactId]);

  const close = () => setFullscreenArtifactId(null);

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={close}
      />

      <div
        className="fixed z-50 rounded-xl border border-white/10 bg-[#0a0a1a] overflow-hidden"
        style={{
          top: "3vh",
          left: "2.5vw",
          width: "95vw",
          height: "94vh",
        }}
      >
        <div
          className="flex items-center justify-between px-4 border-b border-white/10"
          style={{ height: HEADER_HEIGHT }}
        >
          <h2 className="font-medium text-white truncate">{title}</h2>
          <button
            onClick={close}
            className="text-white/60 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {code ? (
          <div
            className="artifact-sandpack-fill"
            style={{ height: `calc(94vh - ${HEADER_HEIGHT}px)` }}
          >
            <SandpackProvider
              template="react"
              theme="dark"
              files={{
                "/App.js": code,
                "/styles.css": { code: FULLSCREEN_STYLES },
              }}
            >
              <SandpackLayout
                style={{
                  height: "100%",
                  border: "none",
                  borderRadius: 0,
                }}
              >
                <SandpackPreview
                  showNavigator={false}
                  showRefreshButton={false}
                  showOpenInCodeSandbox={false}
                />
              </SandpackLayout>
            </SandpackProvider>
          </div>
        ) : (
          <div
            className="flex items-center justify-center"
            style={{ height: `calc(94vh - ${HEADER_HEIGHT}px)` }}
          >
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </>
  );
}
