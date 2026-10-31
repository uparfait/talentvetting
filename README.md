# TalentVetting

AI powered recruitment, as a frontend demo: recruiters post jobs and vet candidates through six stages; job seekers build
verified profiles and apply. Everything that needs a server (accounts, database, files, queues, AI models, crawling,
email) is simulated in the browser behind the same functions a backend will answer, so integration swaps modules, not
screens.

## Run
```
npm install
npm run dev        # http://localhost:5173
npm run build      # into dist/, served as a single page app (vercel.json)
```

## Demo accounts (password demo1234)
| Role | Email |
|---|---|
| Recruiter (Technology) | recruiter@talentvetting.demo |
| Recruiter (Finance) | finance.recruiter@talentvetting.demo |
| Job seeker | seeker@talentvetting.demo |
| Shortlisted job seeker | diane@talentvetting.demo |

Data lives in this browser (localStorage). Account menu, Reset demo data, starts over.

## What works
- Registration: recruiters with a business category; job seekers with a national ID, date of birth and a live photo
  checked by head turns (face-api.js in the browser)
- Profiles: education with documents, skills, hobbies, links; Verify runs the agents into a Grand Profile Summary
- Jobs: Markdown details, required skills, experience, education, places, psychometric test and its weight; top 10
  suggested candidates before anyone applies
- Pipeline: qualification check, proctored psychometric test, AI scoring with reasons and evidence, weight changes
  without AI calls, shortlist by exam or message, best performers, published results, notifications
- AI gateway: providers, key pool, cooldown, failover, schema checks and a log of every call

## Docs
| | |
|---|---|
| [Architecture](docs/architecture.md) | [Data model](docs/data_model.md) |
| [Backend integration](docs/backend.md) | [AI gateway](docs/ai_gateway.md) |
| [Agents](docs/agents.md) | [Vision in the browser](docs/vision.md) |
| [Exams](docs/exams.md) | [Pipeline and scores](docs/pipeline.md) |
| [Design, speed and access](docs/design.md) | |

## Stack
Vite, React 19 and Tailwind 3.4, with the Imberabyombi template's design system (tokens, fonts, components, patterns,
cartoons). Every source file is at most 60 lines.
