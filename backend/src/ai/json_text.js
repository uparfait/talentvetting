/* ai/json_text.js: parse_json(text) finds the JSON object in a model's answer. Models without a JSON mode (Gemma) may
   wrap it in code fences, write a sentence before or after it, think aloud first or leave a trailing comma: this strips
   those and parses the first complete object it finds. Returns undefined when there is none. */
const try_parse = s => { try { return JSON.parse(s); } catch { return undefined; } };
const is_obj = v => !!v && typeof v === 'object' && !Array.isArray(v);
const no_trailing_commas = s => s.replace(/,\s*([}\]])/g, '$1');

/* index of the brace that closes the object opened at start, strings and escapes respected; -1 when it never closes */
function close_of(t, start) {
  let depth = 0, in_str = false, esc = false;
  for (let i = start; i < t.length; i++) {
    const c = t[i];
    if (in_str) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') in_str = false; continue; }
    if (c === '"') in_str = true;
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return i;
  }
  return -1;
}

function parse_json(text) {
  const t = String(text ?? '').replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/```(?:json)?/gi, '').trim();
  const whole = try_parse(t);
  if (is_obj(whole)) return whole;
  for (let i = t.indexOf('{'), n = 0; i >= 0 && n < 25; i = t.indexOf('{', i + 1), n++) {
    const end = close_of(t, i);
    if (end < 0) continue;
    const piece = t.slice(i, end + 1), v = try_parse(piece) ?? try_parse(no_trailing_commas(piece));
    if (is_obj(v)) return v;
  }
  return undefined;
}

module.exports = { parse_json };
