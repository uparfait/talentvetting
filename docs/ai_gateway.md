# AI gateway

Every AI call goes through the server's gateway (`backend/src/ai`); keys never reach the browser.

## What it does
1. Tries the task's first provider, with a pool of keys.
2. On 429, 5xx or a timeout, cools that key down and moves to the next key, then the next provider.
3. Checks the answer against the task's schema, retrying once.
4. Logs every call: task, what it was about, provider, model, result, latency, tokens.

## In the web app
- Every call is kept in the `ai_log` collection for 90 days (task, provider, model, time, result, failovers as failed calls), for audits.
- Every AI result shows the model that produced it (scores, summaries, reports).
- Screening flags a job whose scores came from more than one model; Screen again has everyone scored anew.
- The final score (profile and psychometric test, with the recruiter's weight) needs no AI: the server works it out
  again when the weight changes and the ranking comes back re-sorted.
