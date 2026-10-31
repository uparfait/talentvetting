/* ai/agents/document.js: DocumentAgent. In the demo, the text of a document comes from the degree it was uploaded for
   (a production browser runs Tesseract.js on images and unpdf on PDFs: docs/vision.md); the agent then checks the name,
   the year and the institution against the profile. A file whose name hints at an edit is flagged. */
import { rng } from '../deps.js';

export function document_check(doc, e, user) {
  const r = rng(doc.name + e.id), flags = [];
  const text = `${e.level} of ${e.degree}${e.field ? ` in ${e.field}` : ''}. ${e.school}. Awarded to ${user.name} in ${e.year}.`;
  if (/edit|copy|fake|final2|modified/i.test(doc.name)) flags.push('The file name suggests an edited copy');
  if (doc.type && !/pdf|image/.test(doc.type)) flags.push('Not a PDF or an image');
  if (r.next() < 0.07) flags.push(`The year on the document does not match ${e.year}`);
  return { text, fields: { name: user.name, institution: e.school, year: e.year, degree: e.degree }, authentic: !flags.length, flags };
}
