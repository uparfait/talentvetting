/* quiz/sample.js: the exam a recruiter starts from (two multiple choice, one typed), in the block format */
const Q4 = '""""';
export const SAMPLE = `${Q4}
TYPE question;
QUESTION:
Which practice keeps a React list fast and stable when items move?
CHOICES:
A) Using the array index as the key
B) Using a stable id from the data as the key
C) Leaving the key out
D) Using Math.random() as the key
ANSWER(S) :
INDEX[S]:
1
${Q4}
TYPE question;
QUESTION:
Which two make a page more accessible? Select two.
CHOICES:
A) A label for every form field
B) Removing focus outlines
C) Enough colour contrast
D) Text inside images only
ANSWER(S) :
INDEX[S]:
0,2
${Q4}
TYPE typed;
QUESTION:
A page loads slowly on phones. What would you check first, and why?
ANSWER KEY:
bundle size, images, lazy loading, network, caching, measure, lighthouse
${Q4}`;
