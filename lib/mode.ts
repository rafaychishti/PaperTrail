// Demo mode is on when there's no Anthropic key, or when PAPERTRAIL_DEMO=1.
// Adding ANTHROPIC_API_KEY to .env.local switches to real AI marking.
export function isDemo(): boolean {
  return !process.env.ANTHROPIC_API_KEY || process.env.PAPERTRAIL_DEMO === "1";
}
