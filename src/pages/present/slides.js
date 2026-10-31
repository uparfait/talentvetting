/* pages/present/slides.js: the presentation of TalentVetting, one slide each: a kicker, the title, a line, up to four
   points, and the illustration to draw (art.jsx). Plain words, short points, one idea per slide. */
export const SLIDES = [
  { kicker: 'TalentVetting', title: 'Hire on evidence, not on guesses.', text: 'AI powered recruitment that reads every applicant fairly, from the first application to the final selection.', art: 'mark' },
  { kicker: 'The problem', title: 'Hundreds of applications, too little time.', art: 'pile',
    points: ['Reading every application by hand is slow', 'Good people get missed in the pile', 'Claims on a CV are hard to check', 'Choices are hard to explain afterwards'] },
  { kicker: 'The answer', title: 'Every applicant read, every score explained.', art: 'scan',
    text: 'The recruiter sets what matters. The AI reads each application, scores it from 0 to 100 and shows the evidence behind it.' },
  { kicker: 'How it works', title: 'Six clear stages.', art: 'steps',
    points: ['Qualify: apply only where you meet the job', 'Psychometric test, proctored', 'Screening: scored by itself on arrival', 'Shortlist, an exam, then the selection'] },
  { kicker: 'For job seekers', title: 'One verified profile that speaks for you.', art: 'profile',
    points: ['Identity proven by a live photo', 'Degrees checked from the actual documents', 'Links read and summarized', 'Every application followed step by step'] },
  { kicker: 'For recruiters', title: 'From the post to the results in one place.', art: 'board',
    points: ['Write the job in a Word-like editor', 'Scores with reasons arrive on their own', 'Tick to shortlist, build an exam by drag and drop', 'Mark written answers, publish the results'] },
  { kicker: 'Trust', title: 'Fair, checked and proctored.', art: 'shield',
    points: ['Scores ignore name, gender, age and origin', 'Faces matched to the registration photo', 'Tests watched for tab switches and other faces', 'Every AI call logged with its model'] },
  { kicker: 'The AI', title: 'Several models, one reliable answer.', art: 'nodes',
    points: ['Gemma reads documents and scores profiles', 'Llama on Groq writes the summaries', 'Gemma on Hugging Face steps in when one is busy', 'Face models run on our own server'] },
  { kicker: 'Built for scale', title: 'Light in the browser, every decision on the server.', art: 'stack',
    points: ['React web app on Vercel', 'Node API on Vercel functions', 'MongoDB Atlas with indexes and file storage', 'Fast pages, small files, accessible design'] },
  { kicker: 'TalentVetting', title: 'Fair hiring, ready today.', text: 'talentvetting.vercel.app', art: 'mark' }
];
/* a slide's colour: the same title, the same hue (as the template's agenda on the whole screen) */
export const hue = s => [...String(s || '')].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7) % 360;
