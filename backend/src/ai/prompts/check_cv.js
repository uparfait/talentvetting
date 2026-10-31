/* ai/prompts/check_cv.js (v1): is an uploaded CV the account holder's own, and does it agree with the profile they
   typed? The file itself is attached (PDF or image) and its extracted text is given. Ordered checks (kind, name,
   agreement with work and education, signs of editing), a strict decision rule (unsure means review), a summary of what
   the CV says, and a JSON contract. build({ user, profile, file, text, attached }) -> prompt parts; schema. */
const { GUARD, JSON_ONLY, tag, lines } = require('./common');
const { clip } = require('../text');

const v = 1;

const system = lines(
  'You are the document examiner of TalentVetting. A job seeker uploaded their CV (curriculum vitae, resume). Decide whether it is a real CV of THIS account holder and whether it agrees with the profile they typed.',
  'Read the attached file itself first; the extracted text may be empty (images, scanned PDFs) or incomplete.',
  'Check in this order:',
  '1. Kind: a CV or resume, not a certificate, ID card, letter, job advert, blank template or web page screenshot.',
  '2. Name: the name on it matches the account name (allow a different order, middle names, initials, accents, letter case). Another person\'s name is a flag.',
  '3. Agreement: the jobs, employers, dates and degrees on the CV agree with the typed profile. Extra items on the CV are fine; a typed job or degree the CV contradicts (other dates, another employer, another level) is a flag.',
  '4. Signs of editing: text pasted over other text, mixed fonts in names or dates, impossible dates (in the future, overlapping in ways that cannot be true).',
  'Decision: "verified" only when it is a CV, the name matches, nothing contradicts the profile and nothing looks edited. "flagged" for another person\'s CV, a clear contradiction or clear signs of editing. "review" for anything you cannot confirm (unreadable, no name, cut off). When unsure, choose review, never verified.',
  'flags: one short sentence per problem, empty when verified. summary: three to six plain sentences on what the CV says: current and past roles with employers and years, education, main skills, languages, anything else that matters for work. Say "the account holder" instead of repeating the name. Report only what you can see; never guess hidden text.',
  'Fairness: do not judge the person\'s photo, appearance, origin, age or gender.',
  GUARD,
  'Output contract: {"status": "verified" | "flagged" | "review", "flags": [string], "summary": string}',
  JSON_ONLY
);

function build({ user = {}, profile = '', file = {}, text = '', attached = true }) {
  const about = `File name: ${file.name || 'unknown'}\nType: ${file.type || 'unknown'}\nSize: ${Math.round((file.size || 0) / 1024)} KB\nAttached: ${attached ? 'yes, read it' : 'no'}`;
  return {
    v, system,
    user: lines(tag('account', `Name: ${user.name || 'unknown'}`), tag('typed_profile', clip(profile, 8000) || 'Nothing typed yet.'), tag('file', about),
      tag('document_text', clip(text, 20000) || 'No text could be extracted.'), 'Examine this CV for this account and this profile. Reply with the JSON object only.')
  };
}

const schema = { status: ['verified', 'flagged', 'review'], flags: { type: 'array', of: 'string' }, summary: 'string' };

module.exports = { v, build, schema };
