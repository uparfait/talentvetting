# The API

## Address
`src/net/config.js`: `VITE_API_URL` when it is set at build time; else `http://localhost:5000/api` while the app runs
on localhost; else `https://talentvetting-backend.vercel.app/api`. The API allows the app's origins (CORS).

## Replies
Success: `{ ok: true, data }` (200, 201 on create). Error: `{ ok: false, level: 'info' | 'warning' | 'error', message }`
with 400, 401, 403, 404, 409, 413, 429 or 500. The app shows `message` as it is.

## What each screen calls
| Screen | Reads | Changes |
|---|---|---|
| Sign in, register | GET /categories | POST /auth/sign-in, /auth/check, /auth/register, /vision/liveness |
| Public jobs, a job | GET /public/jobs?q=&category=, /public/jobs/:id | GET /applications/check/:job, POST /applications |
| Dashboard | GET /jobs, or GET /profile and /applications | |
| Notifications, bell | GET /notices | POST /notices/read |
| My account | GET /me | PATCH /me, POST /me/password |
| Post a job | GET /categories | POST /categories, /skills/read, /jobs |
| Job page | GET /jobs/:id, /jobs/:id/applications, /jobs/:id/suggestions | PATCH status and psych, DELETE, invite, restart, score, shortlist, path, best, select, publish |
| Exam builder | GET /jobs/:id | POST /exams/import, GET /exams/rules, PUT /jobs/:id/exam, POST /jobs/:id/path |
| Exam review | GET /applications/:id/review | POST /applications/:id/marks |
| Candidate | GET /candidates/:user?job= | |
| My profile, summary | GET /profile | PATCH /profile, POST and DELETE work, education, links, POST /profile/verify |
| My applications | GET /applications | DELETE /applications/:id |
| Exam room | GET /applications | POST /vision/check, /tests/:app/start, /tests/:test/events, frame, submit |

## Files
A degree document is read in the browser and sent with the degree as `{ name, type, data }` (base64). The server
checks its type and size and stores it.

## Environment
`VITE_API_URL` (optional, at build time). Nothing secret lives in the web app.
