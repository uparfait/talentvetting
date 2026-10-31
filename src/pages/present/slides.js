/* pages/present/slides.js: the presentation of TalentVetting, four slides with few words: the cover, how it works, the
   tools and models behind it, and who it is for. Each slide: a kicker, the title, a line or points [icon, words], and
   its drawing (art.jsx). */
export const SLIDES = [
  { kicker: 'AI powered recruitment', title: 'TalentVetting', text: 'Every applicant read fairly. The best ones found, with reasons.', art: 'mark' },
  { kicker: 'How it works', title: 'From application to selection.', art: 'steps',
    points: [['user', 'Build one verified profile'], ['check', 'Apply where you qualify'], ['sparkle', 'AI scores every application'], ['tasks', 'Shortlist, exam, select']] },
  { kicker: 'Tools and models', title: 'Several models, one answer.', art: 'nodes',
    points: [['file', 'Gemma 4 reads documents and scores'], ['layers', 'Gemini Flash Lite steps in when busy'], ['note', 'GPT-OSS on Groq writes summaries'],
      ['eye', 'Face models on our own server'], ['shield', 'MongoDB Atlas and Vercel']] },
  { kicker: 'Who it is for', title: 'Anyone who hires, anyone who seeks.', art: 'people',
    points: [['briefcase', 'Hiring companies'], ['users', 'Recruitment agencies'], ['cap', 'Schools and public institutions'], ['user', 'Job seekers and graduates']] }
];
/* a slide's colour: the same title, the same hue (as the template's agenda on the whole screen) */
export const hue = s => [...String(s || '')].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7) % 360;
