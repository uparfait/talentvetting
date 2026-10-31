# Exams

## Shortlist exams: the builder and the block format
After Shortlist (Yes, prepare an exam) the recruiter builds the exam in the quiz builder: question cards dragged into
order, a Choice or a Typed question each (the right choices ticked, or the expected answer), its own time if wanted, a
Preview as candidates see it, then Send. The builder saves the block format below, between lines of four double quotes
(from the HTML-CSS quiz), so any AI can write questions too: Copy rules for an AI, then Import what it writes.

| Block | Keywords |
|---|---|
| Multiple choice | `TYPE question;` `QUESTION:` `CHOICES:` (A) B) ...) `ANSWER(S) :` `INDEX[S]:` (0 based, several allowed) |
| Typed answer | `TYPE typed;` `QUESTION:` `ANSWER KEY:` (the words a good answer contains) |
| Optional | `LAST_IN_SECS n;` sets the question's time |

`src/quiz/parse.js` reads it; the builder lists what is missing and the exam cannot be sent until nothing is.
Markdown (bold, italic, code, code blocks, lists) works in questions and choices.

## Timing
Each question's time: words / 160 x 60 + thinking time (recall 8 s, application 20 s, code 45 s) + 5 s, rounded up to
5 s. The exam's time is the sum; at zero it submits itself.

## Marking (`src/api/exams.js`)
Multiple choice is marked by itself when the exam is submitted (all right choices, no wrong ones). Written answers are
reviewed by the recruiter beside the expected answer: Right 1, Partly 0.5, Wrong 0. Exam score = marks / questions x
100, once every question has its mark; until then the shortlist shows Review.

## Psychometric test (`src/quiz/psych.js`)
Made from the application id, so it is stable for that candidate. Ten minutes.
- Abstract reasoning: six rows of three figures following a rule (count, rotation or shape, drawn as SVG from a seeded
  generator, the HTML-CSS diagram trainer's idea); pick the fourth.
- Work style: six statements, 1 to 5, some reverse keyed.
- Score = reasoning share x 60 + work style share x 40.
