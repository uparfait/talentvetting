# Backend integration

Every simulated part sits behind a function in `src/api` or `src/ai`. Replace each body with a call; screens stay.

## Endpoints (Next.js route handlers on Vercel, or Vercel Functions)
| Function | Method and path | Notes |
|---|---|---|
| `register`, `sign_in` | POST /api/auth/register, /api/auth/sign-in | Auth.js or Supabase Auth, session cookie |
| `save_job`, `remove_job`, `set_status` | POST, PATCH, DELETE /api/jobs/:id | owner only |
| `suggestions(job)` | GET /api/jobs/:id/suggestions | pgvector nearest 10 not applied |
| `save_profile` | PATCH /api/profile | marks the summary stale, queues verification |
| `verify` | POST /api/profile/verify | enqueues Document, Crawler, Summarizer, Synthesizer |
| `check(job)` | POST /api/jobs/:id/qualify | QualificationAgent |
| `apply(job)` | POST /api/applications | rejects if not qualified |
| `submit_test` | POST /api/applications/:id/tests | text event log plus answers |
| `screen`, `rescore` | POST /api/jobs/:id/screen | enqueues one scoring message per applicant |
| `set_weight` | PATCH /api/jobs/:id | no AI: finals are computed from stored scores |
| `shortlist`, `set_path`, `best`, `publish` | POST /api/jobs/:id/(shortlist, path, best, publish) | notifies |
| `notice`, `my_notices`, `mark_read` | GET, PATCH /api/notices | plus email with Resend |

Replies: `{ level: 'info' | 'warning' | 'error' | 'success', message, data }`, as `api/net.js` simulates.

## Files
Document uploads go straight from the browser to Vercel Blob or Supabase Storage with a signed URL; the profile stores
the URL. The demo keeps only the name, type and size.

## Queues (Upstash QStash)
Each AI or crawl task is one message and one short function: a document, a link, an applicant to score. Long jobs such
as scoring 500 applicants become 500 messages. Results write to the database and notify the screen.

## Key pool (Upstash Redis)
`GEMINI_KEYS`, `GROQ_KEYS`, `OPENROUTER_KEYS` hold comma separated keys. A failing key gets `cool:<key>` with a TTL;
the gateway skips cooled keys (docs/ai_gateway.md). Keys never reach the browser.

## Environment
`DATABASE_URL, AUTH_SECRET, BLOB_READ_WRITE_TOKEN, QSTASH_TOKEN, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN,
RESEND_API_KEY, GEMINI_KEYS, GROQ_KEYS, OPENROUTER_KEYS`

## Order of work
1. Auth and users  2. Jobs and profiles with storage  3. Gateway and agents with QStash  4. Applications and pipeline
5. Embeddings and suggestions  6. Notifications and email. Each step keeps the demo running for the rest.
