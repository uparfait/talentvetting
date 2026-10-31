/* pages/present/slides.js: the presentation of TalentVetting, five slides with few words: the cover, how it works, the
   tools and models behind it, who it is for, and how it earns (employers pay, job seekers never do). Each slide: a
   kicker, the title, a line or points [icon, words, what it does], and its drawing (art.jsx). The cover also lists the problems it
   solves in a few words [icon, colour, problem, the fix]. */
export const SLIDES = [
  { kicker: 'AI powered recruitment', title: 'TalentVetting', text: 'Every applicant read fairly. The best ones found, with reasons.', art: 'mark',
    solves: [['eye', 'teal', 'Exam cheating', 'Watched exams'], ['star', 'amber', 'Hidden talent', 'Every CV read'],
      ['file', 'blue', 'Forged papers', 'Checked documents'],
      ['globe', 'sky', 'Unread links', 'Every link crawled'], ['users', 'violet', 'Too many CVs', 'Instant screening'], ['shield', 'green', 'Unfair picks', 'Scores with reasons']] },
  { kicker: 'How it works', title: 'From application to selection.', art: 'steps',
    points: [['user', 'Build one verified profile'], ['check', 'Apply where you qualify'], ['sparkle', 'AI scores every application'], ['tasks', 'Shortlist, exam, select']] },
  { kicker: 'Tools and models', title: 'Several tools, one answer.', art: 'nodes',
    points: [['file', 'Gemma 4', 'reads each document with the file itself, checks it is real, scores applicants'],
      ['globe', 'Link crawler', 'opens every link on a profile, AI sums up what it finds'],
      ['copy', 'Document reader', 'pulls the text out of each upload for the AI'],
      ['note', 'GPT-OSS on Groq', 'fast skills and summaries'],
      ['eye', 'Face models', 'liveness and identity, on our own server'], ['shield', 'MongoDB Atlas and Vercel', 'data and hosting']] },
  { kicker: 'Who it is for', title: 'Anyone who hires, anyone who seeks.', art: 'people',
    points: [['briefcase', 'Hiring companies'], ['users', 'Recruitment agencies'], ['cap', 'Schools and public institutions'], ['user', 'Job seekers and graduates']] },
  { kicker: 'Business model', title: 'Employers pay. Job seekers never do.', art: 'money',
    points: [['coin', 'A fee for each job posted'], ['briefcase', 'Plans for companies that hire often'], ['users', 'Volume plans for agencies'], ['heart', 'Always free for job seekers']] }
];
/* a slide's colour: the same title, the same hue (as the template's agenda on the whole screen) */
export const hue = s => [...String(s || '')].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7) % 360;
