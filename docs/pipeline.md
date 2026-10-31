# Pipeline and scores

| Stage | Who acts | What happens | Application stage |
|---|---|---|---|
| 1 Qualification | job seeker | Check if I qualify; Apply only when qualified | psych or screening |
| 2 Psychometric | job seeker | proctored test, then its integrity report | screening |
| 3 Screening | recruiter | Run screening: every applicant scored 0 to 100 | scored |
| 4 Shortlist | recruiter | top n (all by default); then an exam or a message | shortlisted, not_shortlisted |
| 5 Best performers | recruiter | ranked by combined score; top places selected | selected, not_selected |
| 6 Results | recruiter | Publish results: everyone is notified, the job closes | job.published |

## Scores
- Profile score: the ScoringAgent, rubric skills 40, experience 30, education 15, verified evidence 15.
- Final score: `profile x (1 - w) + psychometric x w`, w the recruiter's weight (0 when the test is off).
  Changing w only recomputes and re-sorts; no AI call (`api/pipeline.js`, `final_of`).
- Combined score for best performers: the final score, averaged with the exam score when the shortlist took an exam.

## Suggestions before applying
The job's top 10: people who have not applied, ranked by similarity between the job and their profile (embeddings and
pgvector in production; a word vector cosine in the demo). Invite sends them a notification.

## Notifications
New application (to the recruiter), shortlisted with the exam or the message, exam submitted, results. Each opens the
page it is about.
