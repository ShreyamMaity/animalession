import Anthropic from "@anthropic-ai/sdk";

const globalForAnthropic = globalThis as unknown as {
  anthropic: Anthropic | undefined;
};

function isOAuthToken(key: string) {
  return key.includes("sk-ant-oat");
}

function createAnthropicClient() {
  const key = process.env.ANTHROPIC_API_KEY ?? "";

  if (isOAuthToken(key)) {
    return new Anthropic({
      apiKey: null as unknown as string,
      authToken: key,
      defaultHeaders: {
        "anthropic-beta":
          "claude-code-20250219,oauth-2025-04-20,fine-grained-tool-streaming-2025-05-14,interleaved-thinking-2025-05-14",
        "user-agent": "claude-cli/1.0.0 (external, cli)",
        "x-app": "cli",
      },
    });
  }

  return new Anthropic({ apiKey: key });
}

export const anthropic =
  globalForAnthropic.anthropic ?? createAnthropicClient();

if (process.env.NODE_ENV !== "production")
  globalForAnthropic.anthropic = anthropic;
