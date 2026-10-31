# Architecture

The web app shows data and sends input. Every score, check, AI call, face check, timing, marking, skills extraction,
matching and completeness runs on the API (`backend/`, its own README).

## Layers
| Folder | What it holds |
|---|---|
| `src/pages` | screens, one area per folder (public, auth, app, recruiter, seeker, exam, shared) |
| `src/shell` | public header and footer, the signed in shell (sidebar, top bar, bell, account menu) |
| `src/ui` | the template's components: toast, dialog, field, table, tabs, chips, tooltip, picker |
| `src/net` | the API client: base address, `api()` with the token, the session, `use_data` and its cache |
| `src/api` | thin functions for every change sent to the server (auth, jobs, pipeline, profile, tests, vision) |
| `src/vision` | the camera (frames as JPEG) and the screen share check, nothing else |
| `src/quiz` | `Figure`, which draws the reasoning figures the server sends |
| `src/router` | history router, routes and who may open them |
| `src/lib` | dates, Markdown and safe HTML for job details, this browser's view settings, reading a file |

## Data flow
- Reads: `use_data(path)` gives `{ data, error, loading, reload }`. Replies sit in a memory cache: a page opened again
  draws at once and reloads behind; `loading` is true only while there is nothing to show (the template's page loader).
- Changes: an `src/api` function calls the server, then `refresh(prefix)` reloads every shown path under that prefix.
  Replies that already hold the new data (the profile view) are stored directly.
- Errors: the server replies `{ ok: false, level, message }`; `api()` throws an Error with that level and the status,
  and screens show the message (a toast, or the form's error line).
- Polling: the bell asks for notifications every minute; a job page asks again every few seconds while applications
  wait for the server to score them.

## Session
`POST /auth/sign-in` and `/auth/register` return a token and the user, kept as `tv:token` and `tv:user`; every call
sends `Authorization: Bearer <token>`. A 401 on a signed in call signs out. On start the app asks `GET /me` once.

## Routing and access
`router/routes.js` lists every address, its page and who may open it: public, guest (signed out), user, recruiter or
seeker. `app.jsx` redirects others using the session's role; the API checks the same rule on every request.

## Loading
- Each page is its own lazy chunk; React is a separate long cached file.
- Cartoons, patterns and fonts are static files in `public/` with long cache headers (`vercel.json`).
