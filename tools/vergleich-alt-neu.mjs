// Vergleich alt (fertiges HTML im Wurzelverzeichnis) gegen neu (dist/).
// Aufruf: node tools/vergleich-alt-neu.mjs [seite ...]   (Standard: index, shop, alle produkte/*)
// Verglichen werden: title, alle meta/link im head, JSON-LD als Daten, übrige Skripte, und der Body als
// normalisierte Folge aus Tags (Attribute sortiert, Entitäten dekodiert), Text (Leerraum zusammengefasst),
// ohne Kommentare; <x/> gilt als <x></x>.
// Erlaubte Unterschiede: die CSS-Einbindung (/_astro/*.css statt /styles/main.css samt Preload).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const RAW = new Set(['script', 'style']);
const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', copy: '©', middot: '·', rarr: '→', larr: '←', hellip: '…', ndash: '–', mdash: '—', shy: '­' };

function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+\d*);/gi, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return NAMED[e] ?? NAMED[e.toLowerCase()] ?? m;
  });
}

/** Zerlegt HTML in Token: {t:'open'|'close'|'text'|'doctype', ...}; Kommentare entfallen. */
function tokenize(html) {
  const out = [];
  let i = 0;
  while (i < html.length) {
    if (html[i] !== '<') {
      const j = html.indexOf('<', i);
      const end = j === -1 ? html.length : j;
      out.push({ t: 'text', v: html.slice(i, end) });
      i = end;
      continue;
    }
    if (html.startsWith('<!--', i)) { const j = html.indexOf('-->', i); i = j === -1 ? html.length : j + 3; continue; }
    if (html.startsWith('<!', i)) { const j = html.indexOf('>', i); out.push({ t: 'doctype', v: html.slice(i, j + 1).toLowerCase() }); i = j + 1; continue; }
    if (html[i + 1] === '/') {
      const j = html.indexOf('>', i);
      out.push({ t: 'close', name: html.slice(i + 2, j).trim().toLowerCase() });
      i = j + 1;
      continue;
    }
    // Start-Tag
    const m = /^<([a-zA-Z][^\s/>]*)/.exec(html.slice(i, i + 100));
    if (!m) { out.push({ t: 'text', v: '<' }); i++; continue; }
    const name = m[1].toLowerCase();
    let p = i + m[0].length;
    const attrs = {};
    let selfClose = false;
    for (;;) {
      while (/\s/.test(html[p])) p++;
      if (html[p] === '>') { p++; break; }
      if (html[p] === '/' && html[p + 1] === '>') { selfClose = true; p += 2; break; }
      if (html[p] === '/') { p++; continue; }
      const am = /^[^\s=>/]+/.exec(html.slice(p, p + 200));
      const an = am[0].toLowerCase();
      p += am[0].length;
      let val = '';
      while (/\s/.test(html[p])) p++;
      if (html[p] === '=') {
        p++;
        while (/\s/.test(html[p])) p++;
        if (html[p] === '"' || html[p] === "'") {
          const q = html[p];
          const e = html.indexOf(q, p + 1);
          val = html.slice(p + 1, e);
          p = e + 1;
        } else {
          const vm = /^[^\s>]+/.exec(html.slice(p));
          val = vm[0];
          p += val.length;
        }
      }
      attrs[an] = decode(val);
    }
    out.push({ t: 'open', name, attrs });
    i = p;
    if (RAW.has(name) && !selfClose) {
      const e = html.toLowerCase().indexOf(`</${name}`, i);
      out.push({ t: 'raw', v: html.slice(i, e) });
      i = e;
    } else if (selfClose && !VOID.has(name)) {
      out.push({ t: 'close', name });
    }
  }
  return out;
}

const fmtAttrs = (a) => Object.keys(a).sort().map((k) => `${k}="${a[k]}"`).join(' ');
const normText = (s) => decode(s).replace(/\s+/g, ' ').trim();

function analyse(html) {
  const toks = tokenize(html);
  const res = { title: '', head: [], jsonld: [], headScripts: [], body: [] };
  let area = 'pre';
  for (let k = 0; k < toks.length; k++) {
    const tk = toks[k];
    if (tk.t === 'open' && tk.name === 'head') { area = 'head'; continue; }
    if (tk.t === 'close' && tk.name === 'head') { area = 'post'; continue; }
    if (tk.t === 'open' && tk.name === 'body') { area = 'body'; res.body.push(`<body ${fmtAttrs(tk.attrs)}>`); continue; }
    if (tk.t === 'open' && tk.name === 'html') { res.html = fmtAttrs(tk.attrs); continue; }
    if (tk.t === 'close' && ['html', 'body'].includes(tk.name)) continue;
    if (area === 'head') {
      if (tk.t === 'open' && tk.name === 'title') { res.title = normText(toks[k + 1]?.v ?? ''); k += 2; continue; }
      if (tk.t === 'open' && (tk.name === 'meta' || tk.name === 'link')) { res.head.push(`<${tk.name} ${fmtAttrs(tk.attrs)}>`); continue; }
      if (tk.t === 'open' && tk.name === 'script') {
        const raw = toks[k + 1]?.t === 'raw' ? toks[k + 1].v : '';
        if (tk.attrs.type === 'application/ld+json') res.jsonld.push(JSON.parse(raw));
        else res.headScripts.push(`<script ${fmtAttrs(tk.attrs)}>${raw.replace(/\s+/g, ' ').trim()}`);
        k += 2;
        continue;
      }
    } else if (area === 'body') {
      if (tk.t === 'open') res.body.push(`<${tk.name}${Object.keys(tk.attrs).length ? ' ' + fmtAttrs(tk.attrs) : ''}>`);
      else if (tk.t === 'close') res.body.push(`</${tk.name}>`);
      else if (tk.t === 'raw') { const r = tk.v.replace(/\s+/g, ' ').trim(); if (r) res.body.push(`#raw ${r}`); }
      else if (tk.t === 'text') { const x = normText(tk.v); if (x) res.body.push(`#text ${x}`); }
    }
  }
  // Bei Void-Elementen kein Schluss-Tag erwarten: alte Seiten haben keins, Astro auch nicht.
  res.body = res.body.filter((t) => !/^<\/(img|br|hr|source|input|meta|link)>$/.test(t));
  // Erlaubt abweichend: CSS-Einbindung
  res.head = res.head.filter((h) => !/rel="stylesheet"/.test(h) && !/rel="preload".*as="style"|as="style".*rel="preload"/.test(h));
  return res;
}

/** Einfaches Diff (LCS) auf Zeilenlisten; liefert Zeilen mit -/+ . */
function diffLines(a, b) {
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) out.push(`  - alt: ${a[i++]}`);
    else out.push(`  + neu: ${b[j++]}`);
  }
  while (i < n) out.push(`  - alt: ${a[i++]}`);
  while (j < m) out.push(`  + neu: ${b[j++]}`);
  return out;
}

function compare(rel) {
  const oldFile = path.join(ROOT, rel);
  const newFile = path.join(ROOT, 'dist', rel);
  if (!fs.existsSync(oldFile)) return [`alte Datei fehlt: ${rel}`];
  if (!fs.existsSync(newFile)) return [`neue Datei fehlt: dist/${rel}`];
  const a = analyse(fs.readFileSync(oldFile, 'utf8'));
  const b = analyse(fs.readFileSync(newFile, 'utf8'));
  const diffs = [];
  if (a.title !== b.title) diffs.push(`title: "${a.title}" != "${b.title}"`);
  if (a.html !== b.html) diffs.push(`html-Attribute: ${a.html} != ${b.html}`);
  diffs.push(...diffLines(a.head, b.head).map((d) => 'head' + d));
  const ja = a.jsonld.map((x) => JSON.stringify(x)), jb = b.jsonld.map((x) => JSON.stringify(x));
  diffs.push(...diffLines(ja, jb).map((d) => 'jsonld' + d));
  diffs.push(...diffLines(a.headScripts, b.headScripts).map((d) => 'headscript' + d));
  diffs.push(...diffLines(a.body, b.body).map((d) => 'body' + d));
  return diffs;
}

let pages = process.argv.slice(2);
if (!pages.length) {
  pages = ['index.html', 'shop.html', ...fs.readdirSync(path.join(ROOT, 'produkte')).filter((f) => f.endsWith('.html')).map((f) => `produkte/${f}`)];
}
let bad = 0;
for (const p of pages) {
  const d = compare(p);
  console.log(`${d.length ? 'ABWEICHUNG' : 'gleich    '}  ${p}`);
  for (const line of d.slice(0, 40)) console.log('  ' + line);
  if (d.length > 40) console.log(`  … ${d.length - 40} weitere`);
  if (d.length) bad++;
}
// Sitemap: gleiche Adressen und Felder
const locs = (f) => [...fs.readFileSync(f, 'utf8').matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1].replace(/<lastmod>[^<]*<\/lastmod>/, '<lastmod>X</lastmod>').replace(/\s+/g, ''));
const sd = diffLines(locs(path.join(ROOT, 'sitemap.xml')), locs(path.join(ROOT, 'dist/sitemap.xml')));
console.log(`${sd.length ? 'ABWEICHUNG' : 'gleich    '}  sitemap.xml (lastmod ausgenommen)`);
sd.forEach((l) => console.log('  ' + l));
process.exit(bad || sd.length ? 1 : 0);
