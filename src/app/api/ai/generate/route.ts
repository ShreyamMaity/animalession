import { NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";
import { generateArtifactSchema } from "@/lib/validators";
import { createArtifact } from "@/services/artifact-service";
import { createNode } from "@/services/node-service";
import { getSessionUser, verifyProjectOwnership } from "@/lib/auth-helpers";

const SYSTEM_PROMPT = `You are an artifact generator for a knowledge workspace. When asked to create something, you MUST output a complete, self-contained HTML document that can run in an iframe.

Rules:
- Output ONLY the HTML content, nothing else. No markdown code fences.
- All CSS must be inline in a <style> tag
- All JavaScript must be inline in a <script> tag
- Use a dark theme: background #0a0a1a, text #e2e8f0, accents #8b5cf6
- Make it interactive and visually appealing
- Use modern CSS (flexbox, grid, gradients, animations)
- No external dependencies unless via CDN
- The HTML should be a complete page that works standalone
- Include hover effects, transitions, and smooth animations
- Make it responsive to container size`;

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = generateArtifactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { prompt, projectId, model, posX, posY, posZ } = parsed.data;

    if (!(await verifyProjectOwnership(projectId, user.id))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const message = await anthropic.messages.create({
      model: model || "claude-opus-4-6",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const textContent = message.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      return NextResponse.json(
        { error: "No content generated" },
        { status: 500 }
      );
    }

    let html = textContent.text;

    // Strip markdown code fences if present
    html = html.replace(/^```html?\n?/i, "").replace(/\n?```$/i, "");

    const title =
      prompt.length > 60 ? prompt.substring(0, 57) + "..." : prompt;

    const artifact = await createArtifact({
      title,
      html,
      prompt,
      model: model || "claude-opus-4-6",
    });

    const node = await createNode(projectId, {
      title,
      type: "ARTIFACT",
      artifactId: artifact.id,
      color: "#8b5cf6",
      shape: "OCTAHEDRON",
      posX: posX ?? 0,
      posY: posY ?? 0,
      posZ: posZ ?? 0,
    });

    return NextResponse.json({ artifact, node }, { status: 201 });
  } catch (error) {
    console.error("AI generation failed:", error);
    const message =
      error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
