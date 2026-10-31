# Exams

## Shortlist exams: the builder
After Shortlist (Yes, prepare an exam) the recruiter builds the exam in the quiz builder: question cards dragged into
order, a Choice or a Typed question each (the right choices ticked, or the expected answer), its own time if wanted, a
Preview as candidates see it, then Send (`POST /jobs/:id/path` with the questions). Later keeps a draft on the server
(`PUT /jobs/:id/exam`). The builder edits the questions as JSON:

`{ id, kind: 'mcq' | 'typed', text, choices: [text], correct: [index], answer, secs }` (secs 0: worked out)

The server checks them when they are sent and says what is missing. Markdown (bold, italic, code, code blocks, lists)
works in questions and choices.

## Questions from any AI: the block format
Copy rules for an AI (`GET /exams/rules`) gives the block format's rules; Import sends the text an AI wrote to
`POST /exams/import`, which reads it into questions and lists what it could not read.

| Block | Keywords |
|---|---|
| Multiple choice | `TYPE question;` `QUESTION:` `CHOICES:` (A) B) ...) `ANSWER(S) :` `INDEX[S]:` (0 based, several allowed) |
| Typed answer | `TYPE typed;` `QUESTION:` `ANSWER KEY:` (what a good answer says) |
| Optional | `LAST_IN_SECS n;` sets the question's time |

## Timing
The server works out each question's time (reading time plus thinking time) when it has none, and the exam's deadline
when a candidate starts (`POST /tests/:app/start`). The exam room counts down to that deadline, using the server's
clock; at zero it submits by itself, and the server refuses answers that come too late.

## Marking
Multiple choice is marked by the server when the exam is submitted (all right choices, no wrong ones). Written answers
are reviewed by the recruiter beside the expected answer: Right 1, Partly 0.5, Wrong 0 (`POST /applications/:id/marks`).
The server gives the exam its score once every question has its mark; until then the shortlist shows Review.

## Psychometric test
Made by the server for each application: 8 abstract reasoning rows (pick the figure that comes next, drawn by
`src/quiz/figure.jsx`) and 8 work style statements (1 to 5), 8 minutes. The server keeps the answers and scores it.
