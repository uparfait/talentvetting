# Data the web app reads

The server keeps the data (MongoDB); the app only reads these shapes from the API and sends input back.

## user (GET /me, sign in)
`id, role ('recruiter' | 'seeker'), name, email, phone, company, category, id_number, dob, photo, created`

## profile view (GET /profile, and every profile change)
`{ profile, experience { months, text }, completeness { pct, missing [{ label, section }] } }`
- `profile`: `headline, about, location { city, district, country }, work [], skills [], hobbies [], education [],
  links [], summary, stale, updated`
- `education[]`: `id, level, degree, field, school, year, doc { name, type, size, status, flags, summary, model }`
  (status pending, verified, flagged or review)
- `links[]`: `id, name, url, desc, status ('new' | 'read' | 'skipped'), host, title, summary`
- `summary`: `items [{ text, source, verified }], words, at, model`

## job (GET /jobs/:id; a list row has counts instead of details)
`id, title, category, years, level, expected, details (HTML), skills, psych { enabled, weight }, status, path,
exam { questions, secs }, message, best_done, published, created, counts { applied, scored, shortlisted, best, selected }`

## application row (recruiter)
`id, job, user { id, name, email, phone, photo }, stage, qual { qualified, matched, gaps }, score { score, reasoning,
evidence, strengths, gaps, provider, model }, psych { score, reasoning, style, report, at }, exam { score, to_mark,
report, at }, best, final, combined, created`. Rows come sorted by final score, unscored last.

## application (job seeker)
`id, job { id, title, company, path, published, status, psych_test, message }, stage, psych_done, exam { done, score },
scored, can_withdraw, created, next ('psych' | 'exam' | null)`

## stages
psych, screening, scored, shortlisted, not_shortlisted, selected, not_selected

## notice and AI log
`notice: id, title, text, href, read, created`; `ai_log: at, task, label, provider, model, ok, ms, tokens, note`
