/* ai/routes.js: each AI task's ordered providers and models (primary first, then fallbacks), its temperature and its
   prompt version (every result records the version that produced it). The same table drives the real gateway. */
export const TASKS = {
  qualification: { v: 3, t: 0, route: [['gemini', 'gemini-flash-lite'], ['groq', 'llama-3.3-70b'], ['openrouter', 'gpt-oss-20b:free']] },
  scoring: { v: 4, t: 0.1, route: [['gemini', 'gemini-flash'], ['groq', 'gpt-oss-120b'], ['google', 'gemma-3-27b']] },
  document: { v: 2, t: 0, route: [['gemini', 'gemini-flash'], ['groq', 'llama-3.3-70b']] },
  summary: { v: 2, t: 0.2, route: [['gemini', 'gemini-flash-lite'], ['google', 'gemma-3-27b'], ['openrouter', 'gpt-oss-20b:free']] },
  synthesis: { v: 2, t: 0.2, route: [['gemini', 'gemini-flash'], ['groq', 'gpt-oss-120b']] },
  grading: { v: 1, t: 0, route: [['gemini', 'gemini-flash'], ['groq', 'llama-3.3-70b']] },
  proctor: { v: 1, t: 0, route: [['gemini', 'gemini-flash-lite'], ['groq', 'llama-3.3-70b']] }
};
/* the key pools (on a server: GEMINI_KEYS=key1,key2 and so on, never in the browser) */
export const KEYS = { gemini: ['gemini_key_1', 'gemini_key_2'], groq: ['groq_key_1', 'groq_key_2'], google: ['gemma_key_1'], openrouter: ['openrouter_key_1'] };
export const primary = task => TASKS[task].route[0].join('/');
