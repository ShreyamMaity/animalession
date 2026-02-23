import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helpers";

function extractMeta(html: string, property: string): string | null {
  // Match <meta property="og:title" content="..."> or <meta name="description" content="...">
  const regex = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`,
    "i"
  );
  const match = html.match(regex);
  if (match) return match[1];

  // Also try reversed attribute order: content before property
  const regexReversed = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${property}["']`,
    "i"
  );
  const matchReversed = html.match(regexReversed);
  return matchReversed ? matchReversed[1] : null;
}

function extractFavicon(html: string, origin: string): string {
  const regex = /<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]+href=["']([^"']*)["']/i;
  const match = html.match(regex);
  if (match) {
    const href = match[1];
    if (href.startsWith("http")) return href;
    if (href.startsWith("//")) return `https:${href}`;
    return `${origin}${href.startsWith("/") ? "" : "/"}${href}`;
  }
  return `${origin}/favicon.ico`;
}

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json({ error: "Only HTTP(S) URLs allowed" }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "AnimalessionBot/1.0 (Open Graph Preview)",
        Accept: "text/html",
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch URL" }, { status: 502 });
    }

    const html = await response.text();
    const origin = parsed.origin;

    const ogData = {
      title: extractMeta(html, "og:title") ?? extractMeta(html, "twitter:title") ?? parsed.hostname,
      description: extractMeta(html, "og:description") ?? extractMeta(html, "description") ?? null,
      image: extractMeta(html, "og:image") ?? extractMeta(html, "twitter:image") ?? null,
      siteName: extractMeta(html, "og:site_name") ?? parsed.hostname,
      favicon: extractFavicon(html, origin),
    };

    return NextResponse.json(ogData);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return NextResponse.json({ error: "Request timed out" }, { status: 504 });
    }
    console.error("OG preview error:", error);
    return NextResponse.json({ error: "Failed to fetch preview" }, { status: 500 });
  }
}
