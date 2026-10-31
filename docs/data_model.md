# Data model

The demo keeps collections in localStorage (`tv:v1:c:<name>`). The same shapes become Postgres tables (Neon or
Supabase), with `pgvector` for matching.

## users
`id, role ('recruiter' | 'seeker'), name, email (unique), pass (hash), phone, created`
- recruiter: `company, category`
- seeker: `id_number (unique, 16 digits), dob, photo (file url), descriptor (128 floats), face_check ('live' | 'simulated')`

## profiles (one per seeker, id = user id)
`headline, about, years, skills[], hobbies[], summary_stale`
- `education[]`: `id, level, degree, field, school, year, doc { name, type, size, status, flags[], text, model }`
- `links[]`: `id, name, desc, url, status ('new' | 'read' | 'skipped'), host, summary`
- `summary`: `items[] { text, source, verified }, words, at, model, prompt_v`
- production adds `embedding vector(768)` for matching

## jobs
`id, owner, title, category, details (markdown), skills[], years, level, expected, psych { enabled, weight },
status ('open' | 'closed'), shortlist_n, path ('exam' | 'message'), exam_md, message, best_done, published`
- production adds `embedding vector(768)`

## applications
`id, job, user, created, stage, qual, psych, score, exam`
- `stage`: psych, screening, scored, shortlisted, not_shortlisted, selected, not_selected
- `qual`: `qualified, matched[], gaps[], model, prompt_v`
- `psych` and `exam`: `score, at, events[], report { verdict, integrity, findings[], model, prompt_v }`
- `score`: `score, reasoning, strengths[], gaps[], evidence[] { claim, source, verified }, parts, model, prompt_v`

## notices
`id, to, title, text, href, read, created`

## ai_log
`id, at, task, label, provider, model, key, ok, ms, tokens, note` (production: a table, or a log service)

## Indexes to add
`users(email)`, `users(id_number)`, `applications(job, stage)`, `applications(user)`, `notices(to, read)`,
and `ivfflat` or `hnsw` indexes on the embedding columns.
