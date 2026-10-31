/* ai/schema.js: check(data, schema) -> null when the answer has the shape a task needs, else a short reason (sent back
   to the model in the repair message). A schema maps each required key to a spec:
   'string' | 'number' | 'boolean' | 'array' | 'object'      the type
   ['a', 'b']                                                 one of these values
   { type: 'number', min, max }                               a number in range
   { type: 'array', of: 'string' | { key: spec } }           an array whose items have that type or shape */
const type_of = v => (Array.isArray(v) ? 'array' : v === null ? 'null' : typeof v);

function check_value(v, spec, at) {
  if (Array.isArray(spec)) return spec.includes(v) ? null : `"${at}" must be one of ${spec.map(s => JSON.stringify(s)).join(', ')}`;
  const s = typeof spec === 'string' ? { type: spec } : spec;
  if (type_of(v) !== s.type) return `"${at}" must be ${s.type === 'array' || s.type === 'object' ? 'an' : 'a'} ${s.type}`;
  if (s.type === 'number' && (!Number.isFinite(v) || (s.min !== undefined && v < s.min) || (s.max !== undefined && v > s.max)))
    return `"${at}" must be a number from ${s.min} to ${s.max}`;
  if (s.type === 'array' && s.of) {
    for (let i = 0; i < v.length; i++) {
      const err = typeof s.of === 'string' ? check_value(v[i], s.of, `${at}[${i}]`) : check(v[i], s.of, `${at}[${i}].`);
      if (err) return err;
    }
  }
  return null;
}

function check(data, schema, path = '') {
  if (type_of(data) !== 'object') return `${path ? `"${path.slice(0, -1)}"` : 'the answer'} must be a JSON object`;
  for (const [key, spec] of Object.entries(schema || {})) {
    if (data[key] === undefined) return `the key "${path}${key}" is missing`;
    const err = check_value(data[key], spec, `${path}${key}`);
    if (err) return err;
  }
  return null;
}

module.exports = { check };
