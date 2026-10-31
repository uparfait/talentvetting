# Pipeline and scores

| Stage | Who acts | What happens | Application stage |
|---|---|---|---|
| 1 Qualification | job seeker | Check if I qualify; Apply only when qualified | psych or screening |
| 2 Psychometric | job seeker | proctored test, then its integrity report | screening |
| 3 Screening | automatic | each application scored 0 to 100 as it comes in; Screen again if wanted | scored |
| 4 Shortlist | recruiter | ticks applicants, Shortlist: with an exam (prepare, preview, send) or a message | shortlisted, not_shortlisted |
| 5 Best performers | recruiter | ticked on the shortlist, ranked by combined score; ticks who is selected | best, then selected, not_selected |
| 6 Results | recruiter | Publish results: everyone is notified, the job closes | job.published |

## Scores
Every score is worked out on the server and comes with each application row (`final`, `combined`).
- Profile score: the scoring agent, rubric skills 40, experience 30, education 15, verified evidence 15.
- Final score: `profile x (1 - w) + psychometric x w`, w the recruiter's weight (0 when the test is off).
  Changing w sends it to the server (`PATCH /jobs/:id/psych`), which re-ranks without an AI call.
- Combined score for best performers: the final score, averaged with the exam score when the shortlist took an exam.

## Suggestions before applying
The job's top 10 (`GET /jobs/:id/suggestions`): people who have not applied, ranked on the server by how well their
profile fits the job. Invite sends them a notification.

## Ticking and locks
Every step picks people the same way: ticks in the table (a box in its header ticks the page), kept while paging, and a
Selected panel at the bottom that shows who is ticked (x takes one out). A posted job cannot be edited, and it can be
deleted only while nobody has applied (the server answers 409 after that); then it can be closed. Once the results are
published every pipeline change is refused, and Publish waits until the selection is marked.

## Automatic screening
The server scores an application when it is made, or once its psychometric test is in, and catches up anything still
waiting when a job's applications are read; the job page asks again every few seconds while some wait. Screen again
clears the scores (`POST /jobs/:id/restart`), then an overlay has the server score each applicant in turn
(`POST /applications/:id/score`).

## Notifications
New application (to the recruiter), shortlisted with the exam or the message, exam submitted, results. Each opens the
page it is about.
