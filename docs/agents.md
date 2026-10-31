# Agents

Each agent is a stateless function: a queue message starts it, it writes its result. In the demo each is a pure
function in `src/ai/agents` that returns the JSON its prompt asks for, so the screens already handle real shapes.

| Agent | Input | Output | Demo logic |
|---|---|---|---|
| QualificationAgent | profile, job | qualified, matched, gaps | 60 % of required skills, years and level met |
| DocumentAgent | file, degree entry, user | fields, authentic, flags | names, year, school; flags edited looking files |
| CrawlerAgent | one link | page text or why skipped | skips LinkedIn, Facebook, Instagram, X, non https |
| SummarizerAgent | page text | summary, facts | first sentences |
| ProfileSynthesizer | user, profile | items with source and verified | up to 10000 words |
| ScoringAgent | profile, job | score, reasoning, strengths, gaps, evidence | rubric 40, 30, 15, 15 |
| ExamGraderAgent | typed questions, answers | per question score and why (kept for a backend; written answers are marked by the recruiter) | share of key words |
| ProctorReportAgent | event log | verdict, integrity, findings | points per event kind |

## Trigger chain
- Profile update: Document per file, Crawler then Summarizer per link, then Synthesizer, then re-matching.
- Application: Qualification (before applying), Scoring (at screening).
- Exam submission: ProctorReport (the log); choices are marked by themselves, written answers by the recruiter.

## Crawling rules
The crawler respects robots.txt and skips sites that forbid scraping; for those the user's own description is used and
the item stays unverified. Only https pages are visited.

## Verified or not
An item is verified when a checked document, a read page or the live photo backs it. Scoring counts verified evidence
(15 of 100) and the evidence list shows which claims are verified.
