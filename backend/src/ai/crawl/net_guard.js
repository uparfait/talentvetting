/* ai/crawl/net_guard.js: guard_url(url) refuses what a public crawler must never touch: other protocols than http(s),
   addresses with a user or password, unusual ports, and hosts that are, or resolve to, private, loopback, link local or
   shared addresses (localhost, 127.x, 10.x, 172.16-31.x, 192.168.x, 169.254.x, 100.64-127.x, ::1, fc00::/7, fe80::/10).
   Throws an Error whose message says why. */
const dns = require('dns').promises;
const net = require('net');

const PORTS = new Set(['', '80', '443', '8080', '8443']);

function private_v4(ip) {
  const [a, b] = ip.split('.').map(Number);
  return a === 0 || a === 10 || a === 127 || a >= 224 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || (a === 192 && b === 0) || (a === 198 && (b === 18 || b === 19));
}

function private_ip(ip) {
  if (net.isIPv4(ip)) return private_v4(ip);
  const v = ip.toLowerCase();
  const dotted = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (dotted) return private_v4(dotted[1]);
  const hex = v.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (hex) { const h = parseInt(hex[1], 16), l = parseInt(hex[2], 16); return private_v4(`${h >> 8}.${h & 255}.${l >> 8}.${l & 255}`); }
  return v === '::1' || v === '::' || /^f[cd]/.test(v) || /^fe[89ab]/.test(v) || /^ff/.test(v);
}

async function guard_url(url) {
  if (!/^https?:$/.test(url.protocol)) throw new Error('only http and https pages are read');
  if (url.username || url.password) throw new Error('addresses with a user name or password are not read');
  if (!PORTS.has(url.port)) throw new Error('only the usual web ports are read');
  const host = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (!host || host === 'localhost' || /\.(localhost|local|internal|lan|home)$/.test(host)) throw new Error('private network addresses are not read');
  let ips;
  try {
    ips = net.isIP(host) ? [host] : (await dns.lookup(host, { all: true, verbatim: true })).map(a => a.address);
  } catch {
    throw new Error('the site could not be found');
  }
  if (!ips.length || ips.some(private_ip)) throw new Error('private network addresses are not read');
}

module.exports = { guard_url, private_ip };
