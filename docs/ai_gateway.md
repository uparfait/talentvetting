# AI gateway

All AI calls go through `llm(task, run, label)` (`src/ai/gateway.js`). In the demo `run` is a deterministic agent; on a
server it is the Vercel AI SDK call with the task's prompt and schema.

## Routes (`src/ai/routes.js`)
| Task | Primary | Fallbacks | Temperature |
|---|---|---|---|
| qualification | gemini-flash-lite | llama-3.3-70b (Groq), gpt-oss-20b:free (OpenRouter) | 0 |
| scoring | gemini-flash | gpt-oss-120b (Groq), gemma-3-27b (Google) | 0.1 |
| document | gemini-flash | llama-3.3-70b (Groq) | 0 |
| summary | gemini-flash-lite | gemma-3-27b, gpt-oss-20b:free | 0.2 |
| synthesis | gemini-flash | gpt-oss-120b (Groq) | 0.2 |
| grading | gemini-flash | llama-3.3-70b (Groq) | 0 |
| proctor | gemini-flash-lite | llama-3.3-70b (Groq) | 0 |

Matching uses embeddings (Gemini) and pgvector; the weighted final score uses no AI at all.

## Steps for every call
1. Take the next key of the task's primary provider that is not cooling down.
2. On 429, 5xx or a timeout, cool that key for 60 s (Redis TTL) and try the next key; when all keys of a provider are
   cooling, move to the next provider.
3. Check the answer against the task's schema (`src/ai/schemas.js`, zod on a server); retry once, then fall back.
4. Log provider, model, key, latency, tokens and the result (the AI activity page shows the demo's log).
5. Return the answer with `model` and `prompt_v`, stored with every result.

## Fairness
Within one job every applicant is scored with the same model. Scores from a fallback model are marked; Screening shows
"Re-score with the primary" so all scores come from one model before comparing.

## Prompts (`src/ai/prompts.js`)
- JSON only, matching a schema; low temperature (0 to 0.2); a fixed rubric with anchors (20, 50, 80).
- Applicant content sits inside tags and is treated as data: an instruction inside a CV or a page has no effect.
- Every claim cites a profile item and its source; verified items weigh more.
- Prompts carry a version; each result records the version that made it.
