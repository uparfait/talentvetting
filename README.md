# TalentVetting

AI powered recruitment: recruiters post jobs and vet candidates through six stages; job seekers build verified
profiles and apply. This is the web app. It shows data and sends input; the API in `backend/` makes every decision
(scores, qualification, AI, face checks, timing and marking).

## Run
```
npm install
npm run dev        # http://localhost:5173, using the API at http://localhost:5000/api
npm run build      # into dist/, served as a single page app (vercel.json)
```
Set `VITE_API_URL` at build time to use another API; deployed builds use https://talentvetting-backend.vercel.app/api.
Start the API first (`backend/README.md`). The database starts empty: register a recruiter and a job seeker.

## What works
- Registration: recruiters with a business category; job seekers with a national ID, date of birth and a live photo
  checked by head turns on the server
- Profiles: work, education with documents, skills, hobbies, links; Verify has the server check documents, read links
  and write a Grand Profile Summary
- Public site for job seekers: Home (hero, partners), About us, Jobs (search, category) and each job; Apply sends a
  signed out visitor to sign in and back to the job, which checks at once whether they qualify
- Jobs: a Word-like description (the server reads its skills), any category (or a new one), experience, education,
  places, psychometric test and its weight; top 10 suggested candidates before anyone applies
- Pipeline: qualification check, proctored psychometric test, automatic AI scoring with reasons and evidence, weight
  changes without AI calls, shortlist the applicants you tick with an exam (drag and drop builder, preview) or a message,
  choices marked by the server and written answers by you, best performers, published results, notifications

## Docs
| | |
|---|---|
| [Architecture](docs/architecture.md) | [Data the app reads](docs/data_model.md) |
| [The API](docs/backend.md) | [AI gateway](docs/ai_gateway.md) |
| [Agents](docs/agents.md) | [Camera and screen](docs/vision.md) |
| [Exams](docs/exams.md) | [Pipeline and scores](docs/pipeline.md) |
| [Design, speed and access](docs/design.md) | |

## Stack
Vite, React 19 and Tailwind 3.4, with the Imberabyombi template's design system (tokens, fonts, components, patterns,
cartoons). Every source file is at most 60 lines.
