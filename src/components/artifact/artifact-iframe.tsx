"use client";

import { useEffect, useRef, useState } from "react";

interface ArtifactIframeProps {
  artifactId: string;
}

export function ArtifactIframe({ artifactId }: ArtifactIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/artifacts/${artifactId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.html) setHtml(data.html);
      })
      .catch(() => {});
  }, [artifactId]);

  useEffect(() => {
    if (!html || !iframeRef.current) return;
    const iframe = iframeRef.current;
    iframe.addEventListener("load", () => {
      iframe.contentWindow?.postMessage(
        { type: "render", html },
        "*"
      );
    });
  }, [html]);

  if (!html) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black/50">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <iframe
      ref={iframeRef}
      src="/sandbox.html"
      sandbox="allow-scripts"
      className="w-full h-full border-0"
      title="Artifact Preview"
    />
  );
}
