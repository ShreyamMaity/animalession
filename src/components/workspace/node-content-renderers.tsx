"use client";

import { useState, useEffect, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import useSWR from "swr";
import { Code, ImageOff, ExternalLink, RefreshCw } from "lucide-react";

const ogFetcher = (url: string) => fetch(url).then((r) => r.json());

// --- Markdown Content ---

interface MarkdownContentProps {
  content: string;
  compact?: boolean;
}

export const MarkdownContent = memo(function MarkdownContent({
  content,
  compact = false,
}: MarkdownContentProps) {
  return (
    <div
      className={
        compact
          ? "px-3 py-2 max-h-[160px] overflow-hidden prose-node"
          : "px-4 pb-4 prose-preview"
      }
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
});

// --- Image Content ---

interface ImageContentProps {
  url: string;
  compact?: boolean;
}

export const ImageContent = memo(function ImageContent({
  url,
  compact = false,
}: ImageContentProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [retries, setRetries] = useState(0);
  const [imgKey, setImgKey] = useState(0);

  // Timeout: if image hasn't loaded after 8s, show error
  useEffect(() => {
    if (loaded || error) return;
    const timer = setTimeout(() => {
      if (!loaded) setError(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [loaded, error, imgKey]);

  function handleRetry() {
    if (retries >= 1) return; // max 2 total attempts
    setError(false);
    setLoaded(false);
    setRetries((r) => r + 1);
    setImgKey((k) => k + 1);
  }

  if (error) {
    return (
      <div className={compact ? "px-3 py-3" : "px-4 py-4"}>
        <div className="flex flex-col items-center gap-2 text-white/40">
          <ImageOff className="h-5 w-5" />
          <span className="text-xs text-center">Failed to load image</span>
          <span className="text-[10px] text-white/25 truncate max-w-full">{url}</span>
          {retries < 1 && (
            <button
              onClick={handleRetry}
              className="flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 mt-1"
            >
              <RefreshCw className="h-3 w-3" /> Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={compact ? "flex-1 min-h-0 overflow-hidden p-1.5" : "px-4 pb-4"}>
      {!loaded && (
        <div className="animate-pulse bg-white/5 rounded-lg h-20 w-full" />
      )}
      <img
        key={imgKey}
        src={url}
        alt="Image content"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`rounded-lg ${
          compact
            ? "w-full h-full object-contain"
            : "w-full object-contain max-h-[400px]"
        } ${loaded ? "block" : "hidden"}`}
      />
    </div>
  );
});

// --- Link Preview Content ---

interface OGData {
  title: string;
  description: string | null;
  image: string | null;
  siteName: string;
  favicon: string;
}

interface LinkPreviewContentProps {
  url: string;
  metadata: unknown;
  projectId: string;
  nodeId: string;
  compact?: boolean;
}

export const LinkPreviewContent = memo(function LinkPreviewContent({
  url,
  metadata,
  projectId,
  nodeId,
  compact = false,
}: LinkPreviewContentProps) {
  const cached = (metadata as Record<string, unknown>)?.ogPreview as OGData | undefined;

  const { data: fetched } = useSWR<OGData>(
    !cached ? `/api/og-preview?url=${encodeURIComponent(url)}` : null,
    ogFetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  // Cache OG data to node metadata on first fetch
  const og = cached ?? fetched;
  if (fetched && !cached) {
    fetch(`/api/projects/${projectId}/nodes/${nodeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metadata: { ogPreview: fetched } }),
    }).catch(() => {});
  }

  if (!og) {
    // Loading state or fallback
    return (
      <div className={compact ? "px-3 py-2" : "px-4 py-4"}>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate underline underline-offset-2">{url}</span>
        </a>
      </div>
    );
  }

  return (
    <div className={compact ? "px-2 py-2" : "px-4 py-4"}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-lg border border-white/10 overflow-hidden bg-white/[0.03] hover:bg-white/[0.06] transition-colors group/link"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {og.image && (
          <div className={compact ? "h-20 overflow-hidden" : "h-32 overflow-hidden"}>
            <img
              src={og.image}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className={compact ? "p-2" : "p-3"}>
          <div className="flex items-center gap-1.5 mb-1">
            {og.favicon && (
              <img
                src={og.favicon}
                alt=""
                className="w-3 h-3 rounded-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <span className="text-[10px] text-white/40 truncate">
              {og.siteName}
            </span>
          </div>
          <p className={`font-medium text-white/90 truncate ${compact ? "text-xs" : "text-sm"}`}>
            {og.title}
          </p>
          {og.description && (
            <p
              className={`text-white/50 mt-0.5 ${
                compact ? "text-[10px] line-clamp-1" : "text-xs line-clamp-2"
              }`}
            >
              {og.description}
            </p>
          )}
        </div>
      </a>
    </div>
  );
});

// --- Artifact Thumbnail ---

import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
} from "@codesandbox/sandpack-react";

function isHtmlContent(code: string): boolean {
  const trimmed = code.trimStart().toLowerCase();
  return trimmed.startsWith("<!doctype") || trimmed.startsWith("<html");
}

interface ArtifactThumbnailProps {
  html: string | null;
  title: string;
  compact?: boolean;
}

export const ArtifactThumbnail = memo(function ArtifactThumbnail({
  html,
  title,
  compact = false,
}: ArtifactThumbnailProps) {
  if (!html) {
    return (
      <div className={compact ? "px-3 py-2.5 flex items-center gap-2" : "px-4 py-4 flex items-center gap-3"}>
        <Code className="h-4 w-4 text-purple-400/60 shrink-0" />
        <p className={`text-white/50 truncate ${compact ? "text-xs" : "text-sm"}`}>{title}</p>
      </div>
    );
  }

  const isHtml = isHtmlContent(html);

  return (
    <div className="relative flex-1 min-h-0 flex flex-col">
      <div className="artifact-sandpack-fill flex-1 min-h-0 pointer-events-none">
        <SandpackProvider
          template={isHtml ? "static" : "react"}
          theme="dark"
          files={
            isHtml
              ? { "/index.html": html }
              : { "/App.js": html }
          }
        >
          <SandpackLayout style={{ height: "100%", border: "none", borderRadius: 0 }}>
            <SandpackPreview
              showNavigator={false}
              showRefreshButton={false}
              showOpenInCodeSandbox={false}
            />
          </SandpackLayout>
        </SandpackProvider>
      </div>
      {compact && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[rgba(10,10,26,0.95)] to-transparent px-3 py-1.5 flex items-center gap-1.5">
          <Code className="h-3 w-3 text-purple-400/60" />
          <span className="text-[10px] text-purple-400/60">dbl-click to run</span>
        </div>
      )}
    </div>
  );
});
