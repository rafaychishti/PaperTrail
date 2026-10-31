// Demo mode is on when there's no AI key at all, or when PAPERTRAIL_DEMO=1.
// Add OPENROUTER_API_KEY (free open models) or ANTHROPIC_API_KEY (Claude) to
// .env.local to switch on AI marking. If both are set, OpenRouter is used.
export function isDemo(): boolean {
  return (!process.env.ANTHROPIC_API_KEY && !process.env.OPENROUTER_API_KEY) || process.env.PAPERTRAIL_DEMO === "1";
}
