/**
 * Winziger statischer Server für dist/ — löst Adressen wie Cloudflare auf
 * (html_handling "none": nur exakte Dateien, "/" → index.html, Weiterleitungen aus
 * _redirects, sonst 404.html). `astro preview` tut das nicht ganz gleich.
 * Start: node tools/serve-dist.mjs [Port]   (Standard 4242)
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const DIST = path.join(import.meta.dirname, '..', 'dist');
const TYPEN = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2',
  '.xml': 'application/xml', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json', '.mp4': 'video/mp4',
};

function leseWeiterleitungen() {
  const datei = path.join(DIST, '_redirects');
  if (!fs.existsSync(datei)) return new Map();
  const map = new Map();
  for (const zeile of fs.readFileSync(datei, 'utf8').split(/\r?\n/)) {
    const [von, nach, status] = zeile.trim().split(/\s+/);
    if (von && !von.startsWith('#') && nach) map.set(von, { nach, status: Number(status) || 301 });
  }
  return map;
}

export function starteServer(port = 4242) {
  const weiter = leseWeiterleitungen();
  const server = http.createServer((req, res) => {
    const pfad = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const regel = weiter.get(pfad);
    let datei = path.join(DIST, pfad);
    const sicher = datei.startsWith(DIST);
    if (sicher && fs.existsSync(datei) && fs.statSync(datei).isFile()) {
      // exakte Datei
    } else if (regel && regel.status === 301) {
      res.writeHead(301, { Location: regel.nach });
      return res.end();
    } else if (regel && regel.status === 200) {
      datei = path.join(DIST, regel.nach);
    } else {
      res.writeHead(404, { 'Content-Type': TYPEN['.html'] });
      return res.end(fs.readFileSync(path.join(DIST, '404.html')));
    }
    res.writeHead(200, { 'Content-Type': TYPEN[path.extname(datei)] || 'application/octet-stream' });
    fs.createReadStream(datei).pipe(res);
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(server)));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.argv[2]) || 4242;
  await starteServer(port);
  console.log(`dist/ unter http://127.0.0.1:${port}/`);
}
