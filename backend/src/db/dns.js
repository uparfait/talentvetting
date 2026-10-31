/* db/dns.js: mongodb+srv needs SRV lookups. DNS_SERVERS (for example 8.8.8.8,1.1.1.1) is used when set; otherwise the
   local resolver is tried once and, if it refuses, the public resolvers 8.8.8.8 and 1.1.1.1 take over. */
const dns = require('dns');
const config = require('../config');

let ready = false;
async function prepare_dns(uri) {
  if (ready) return; ready = true;
  if (config.dns_servers.length) return dns.setServers(config.dns_servers);
  const m = uri.match(/^mongodb\+srv:\/\/(?:[^@]*@)?([^/?]+)/i); if (!m) return;
  try { await dns.promises.resolveSrv(`_mongodb._tcp.${m[1]}`); }
  catch (err) { console.warn(`[db] SRV lookup failed (${err.code}); using public DNS`); dns.setServers(['8.8.8.8', '1.1.1.1']); }
}
module.exports = { prepare_dns };
