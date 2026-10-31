/* quiz/rules.js: RULES, the text a recruiter copies to any AI to get exam questions in the block format parse.js reads. */
const Q4 = '""""';

const RULES = `Write exam questions in EXACTLY this plain text format. Put every question in its own block, between lines
that hold only four double quotes (${Q4}). Write nothing outside the blocks.

Multiple choice (one or more right answers):
${Q4}
TYPE question;
QUESTION:
LAST_IN_SECS 30;
Which hook keeps a value between renders without causing a new render?
CHOICES:
A) useState
B) useRef
C) useMemo
D) useEffect
ANSWER(S) :
INDEX[S]:
1
${Q4}

Typed answer (the candidate writes the answer; give the answer you expect):
${Q4}
TYPE typed;
QUESTION:
Explain how you would make a sign up form accessible.
ANSWER:
Every field has a label, the focus order follows the page, errors are announced next to the field, everything
works with the keyboard and the text has enough contrast.
${Q4}

THE FORMAT:
- TYPE question; for multiple choice, TYPE typed; for a written answer.
- QUESTION: then the question. Markdown works: **bold**, *italic*, \`code\` and fenced code blocks.
- CHOICES: one choice per line, starting with a letter and a bracket: A) B) C) D). Give two to six choices.
- ANSWER(S) : then INDEX[S]: then the numbers of the right choices, 0 based (A=0, B=1, C=2, D=3).
  Several right choices are separated by commas, for example 0,2. The candidate must pick exactly those.
- A typed question carries the expected answer after ANSWER: (ANSWER KEY: is read the same way). Write what a good
  answer must say; the recruiter marks the written answer against it.
- LAST_IN_SECS n; on its own line sets the seconds the question stays on screen. Leave it out to use the standard
  time: words / 160 x 60 + thinking time (recall 8 s, application 20 s, code 45 s) + 5 s, rounded up to 5 s, and
  60 s more to write a typed answer.
- Keep every keyword (TYPE, QUESTION:, CHOICES:, ANSWER(S) :, INDEX[S]:, ANSWER:, LAST_IN_SECS) at the start of its
  own line. Use plain words, short sentences, no long dashes and no decorative symbols.`;

module.exports = { RULES };
