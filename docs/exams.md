# Exams

## Shortlist exams: the block format
Questions sit between lines of four double quotes (from the HTML-CSS quiz), so any AI can write them: the recruiter
copies the rules (Copy rules for an AI) and pastes the answer.

| Block | Keywords |
|---|---|
| Multiple choice | `TYPE question;` `QUESTION:` `CHOICES:` (A) B) ...) `ANSWER(S) :` `INDEX[S]:` (0 based, several allowed) |
| Typed answer | `TYPE typed;` `QUESTION:` `ANSWER KEY:` (the words a good answer contains) |
| Optional | `LAST_IN_SECS n;` sets the question's time |

`src/quiz/parse.js` checks each block as the recruiter types and lists errors; the exam cannot be sent with errors.
Markdown (bold, italic, code, code blocks, lists) works in questions and choices.

## Timing
Each question's time: words / 160 x 60 + thinking time (recall 8 s, application 20 s, code 45 s) + 5 s, rounded up to
5 s. The exam's time is the sum; at zero it submits itself.

## Marking
Multiple choice is marked in the exam (all right choices, no wrong ones). Typed answers go to the ExamGraderAgent
(0 to 1 each against the key). Exam score = (right choices + typed scores) / questions x 100.

## Psychometric test (`src/quiz/psych.js`)
Made from the application id, so it is stable for that candidate. Ten minutes.
- Abstract reasoning: six rows of three figures following a rule (count, rotation or shape, drawn as SVG from a seeded
  generator, the HTML-CSS diagram trainer's idea); pick the fourth.
- Work style: six statements, 1 to 5, some reverse keyed.
- Score = reasoning share x 60 + work style share x 40.
