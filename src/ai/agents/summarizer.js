/* ai/agents/summarizer.js: SummarizerAgent, one source's text to a short summary and its facts */
export function summarize(text) {
  const s = String(text || '').split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(Boolean);
  return { summary: s.slice(0, 2).join(' '), facts: s.slice(0, 5) };
}
