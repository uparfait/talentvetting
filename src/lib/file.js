/* lib/file.js: read_file(file) -> { name, type, data }: a chosen file read in the browser, its content as base64, the
   shape the API takes for a degree document (the server checks its type and size). */
export const read_file = file => new Promise((ok, no) => {
  const r = new FileReader();
  r.onload = () => ok({ name: file.name, type: file.type || 'application/octet-stream', data: String(r.result).split(',')[1] || '' });
  r.onerror = () => no(Object.assign(new Error('The file could not be read. Choose it again.'), { level: 'warning' }));
  r.readAsDataURL(file);
});
