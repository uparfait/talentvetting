# Architecture

## Layers
| Folder | What it holds | With a backend |
|---|---|---|
| `src/pages` | screens, one area per folder (public, auth, app, recruiter, seeker, exam, shared) | unchanged |
| `src/shell` | public header and footer, the signed in shell (sidebar, top bar, bell, account) | unchanged |
| `src/ui` | the template's components: toast, dialog, field, table, tabs, chips, tooltip, theme | unchanged |
| `src/api` | every call that will reach a server (auth, jobs, profiles, applications, pipeline, notices) | calls `fetch` |
| `src/ai` | the LLM gateway, task routes, prompts, schemas and the agents | moves to Vercel Functions |
| `src/vision` | camera, screen share, face detection, liveness, exam monitoring | stays in the browser |
| `src/quiz` | the exam block format, timing, the psychometric test | parser shared with the server |
| `src/store` | the demo database (localStorage), change events, session, seed data | replaced by the API |
| `src/router` | history router, routes and who may open them | unchanged |

## Data flow
Screens never touch the database directly for writes: they call `src/api`. Each api function validates input like a
server would, waits a short network like delay (`api/net.js`) and fails with a level (info, warning, error) and a
message, the reply shape a real API returns. Reads in the demo come from `src/store`; with a backend they come from
the same api module (a cache such as SWR or TanStack Query can sit there).

## Routing and access
`router/routes.js` lists every address, its page and who may open it: public, guest (signed out), user, recruiter or
seeker. `app.jsx` redirects others (signed out people to sign in, then back). A backend checks the same rule on every
request (the session cookie's role), never trusting the browser.

## Loading
- Each page is its own lazy chunk; React is a separate long cached file.
- face-api.js and its models load only on the photo and exam screens.
- Cartoons, patterns and fonts are static files in `public/` with long cache headers (`vercel.json`).

## Events, not polling
Writes emit a change event (`store/bus.js`) and screens redraw. A backend pushes the same changes with server sent
events or a realtime channel (Supabase Realtime), for example a score arriving from a queued scoring job.
