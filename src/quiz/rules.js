/* quiz/rules.js: the rules a recruiter copies to any AI to get exam questions in this format (adapted from HTML-CSS) */
const Q4 = '""""';
export const RULES = `Write exam questions using EXACTLY this plain text format. Each block sits between lines of four double quotes (${Q4}).

Multiple choice (one or more right answers; INDEX[S] is 0 based: A=0, B=1, C=2):
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

Typed answer (graded against the key words):
${Q4}
TYPE typed;
QUESTION:
Explain how you would make a form accessible.
ANSWER KEY:
labels, focus order, error messages, keyboard, contrast, aria
${Q4}

RULES:
- Keep every keyword (TYPE, QUESTION:, CHOICES:, ANSWER(S) :, INDEX[S]:, ANSWER KEY:, LAST_IN_SECS) on its own line.
- Markdown works in questions and choices: **bold**, *italic*, \`code\` and fenced code blocks.
- Time each question: words / 160 x 60 + thinking time (recall 8 s, application 20 s, code 45 s) + 5 s.
- Plain words, short sentences, no em dash and no decorative symbols. Nothing outside the blocks.`;
