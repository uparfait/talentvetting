/* ai/documents.js: extract_text({ buffer, type }) reads the text of a PDF (first 20000 characters; images give '': the
   model reads the file itself). check_document(file, { user, item, owner }) asks the AI whether an uploaded certificate
   or transcript is genuine for this person and this degree: the actual file (inline, PDF or image) and its text both go
   to Gemma on the Gemini API, with the account details and the education item the person typed. The answer is checked
   on the server (verified with flags becomes review). kind 'cv' checks a CV instead, against the typed profile (profile:
   its fact lines), and its summary says what the CV holds. Throws the gateway's 503 when no provider answers. */
const pdf_parse = require('pdf-parse/lib/pdf-parse.js');
const { run } = require('./gateway');
const prompt = require('./prompts/check_document');
const cv_prompt = require('./prompts/check_cv');
const { fail } = require('../http/errors');
const { clean, cut_words, tidy, strs } = require('./text');

const MAX_TEXT = 20000;
const FILE_TYPES = /^(application\/pdf|image\/(png|jpeg|webp|heic|heif))$/;

function to_buffer(b) {
  if (Buffer.isBuffer(b)) return b;
  if (b instanceof Uint8Array || b instanceof ArrayBuffer) return Buffer.from(b);
  if (typeof b === 'string') return Buffer.from(b.replace(/^data:[^,]*,/, ''), 'base64');
  return Buffer.alloc(0);
}
const mime_of = type => String(type || '').toLowerCase().trim().replace('image/jpg', 'image/jpeg');

/* the pdf.js inside pdf-parse ignores a Buffer's byteOffset (small or sliced Buffers share memory), so it gets a copy */
async function extract_text({ buffer, type } = {}) {
  if (!/pdf/.test(mime_of(type))) return '';
  try {
    const r = await pdf_parse(new Uint8Array(to_buffer(buffer)), { max: 30 });
    return clean(r.text || '').slice(0, MAX_TEXT);
  } catch {
    return '';
  }
}

async function check_document({ buffer, type, name = '', text } = {}, { user = {}, item = {}, owner = null, kind = 'degree', profile = '' } = {}) {
  const data = to_buffer(buffer), mime = mime_of(type);
  if (!data.length) throw fail('The document file is empty.', 400);
  const extracted = typeof text === 'string' ? text.slice(0, MAX_TEXT) : await extract_text({ buffer: data, type: mime });
  const files = FILE_TYPES.test(mime) ? [{ mime_type: mime, data: data.toString('base64') }] : [];
  if (!files.length && !extracted.trim())
    return { status: 'review', flags: ['The file is not a PDF or an image the checker can read.'], summary: '', provider: 'rules', model: 'file_type' };
  const cv = kind === 'cv', p = cv ? cv_prompt : prompt, label = cv ? 'CV' : `${item.level || ''} ${item.degree || 'document'}`.trim();
  const parts = p.build({ user, item, profile, file: { name, type: mime, size: data.length }, text: extracted, attached: files.length > 0 });
  const out = await run('document', parts, { owner, label, schema: p.schema, files });
  const flags = strs(out.data.flags, 8);
  const status = out.data.status === 'verified' && flags.length ? 'review' : out.data.status;
  return { status, flags, summary: cut_words(tidy(out.data.summary), cv ? 160 : 80), provider: out.provider, model: out.model };
}

module.exports = { extract_text, check_document };
