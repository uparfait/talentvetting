# Agents

The agents run on the server (`backend/src/ai`). The web app starts them with ordinary requests and shows their
results with the model that produced them.

| Agent | Started by | What the app shows |
|---|---|---|
| Skills reader | POST /skills/read, POST /jobs | the skills preview in the job form, the job's skills |
| Document check | POST /profile/verify | a degree's status (checked, flagged, under review) and its flags |
| Link reader | POST /profile/verify | a link read and summarized, or skipped with its description used |
| Profile synthesizer | POST /profile/verify | the Grand Profile Summary: items with source, verified or not |
| Scoring | applying, the psychometric test, Screen again | score 0 to 100, reasoning, strengths, gaps, evidence |
| Proctor report | submitting a test | verdict, integrity, findings |

Qualification is a rule on the server (skills found in the profile, years from work entries, education level), not
an AI call; the apply panel shows its matched skills and gaps.

## Verification steps
`POST /profile/verify` answers with the steps it ran (`name, status 'ok' | 'warn' | 'review' | 'skipped', detail`);
the verify panel lists them. Items checked before show as such.

## Crawling rules
The server respects robots.txt and skips sites that forbid reading them; for those the person's own description is
used and the item stays unverified. Only https pages are visited.
