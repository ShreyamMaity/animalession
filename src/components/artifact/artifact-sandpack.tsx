"use client";

import { useEffect, useState } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
} from "@codesandbox/sandpack-react";

const FILL_STYLES = `
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

function isHtmlContent(code: string): boolean {
  const trimmed = code.trimStart().toLowerCase();
  return trimmed.startsWith("<!doctype") || trimmed.startsWith("<html");
}

interface ArtifactSandpackProps {
  artifactId?: string;
  code?: string;
  showPreviewOnly?: boolean;
}

export function ArtifactSandpack({
  artifactId,
  code: codeProp,
  showPreviewOnly = true,
}: ArtifactSandpackProps) {
  const [code, setCode] = useState<string | null>(codeProp ?? null);

  useEffect(() => {
    if (codeProp) {
      setCode(codeProp);
      return;
    }
    if (!artifactId) return;
    fetch(`/api/artifacts/${artifactId}`)
      .then((r) => r.json())
      .then((data) => {
        setCode(data.html || data.content || "");
      })
      .catch(() => {});
  }, [artifactId, codeProp]);

  if (!code) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black/50">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const html = isHtmlContent(code);

  return (
    <div className="artifact-sandpack-fill w-full h-full">
      <SandpackProvider
        template={html ? "static" : "react"}
        theme="dark"
        files={
          html
            ? { "/index.html": code }
            : { "/App.js": code, "/styles.css": { code: FILL_STYLES } }
        }
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
  );
}
