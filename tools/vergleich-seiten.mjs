// Vergleich alt (Wurzel) gegen neu (dist/): title, head meta/link, JSON-LD, normalisierter Body.
// Aufruf: node tools/vergleich-seiten.mjs agb.html faq.html journal/index.html ...
import fs from 'node:fs';
const VOID = new Set(['meta','link','img','br','hr','input','source','path','rect','circle','line','polyline','polygon','use']);
function tokenize(html) {
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  const toks = [];
  const re = /<(\/?)([a-zA-Z][\w:-]*)((?:\s+[^\s=>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>|([^<]+|<)/g;
  let m;
  while ((m = re.exec(html))) {
    if (m[5] !== undefined) { const t = m[5].replace(/\s+/g, ' '); if (t.trim()) toks.push('T:' + t.trim()); continue; }
    const close = m[1] === '/', name = m[2].toLowerCase();
    if (close) { if (!VOID.has(name)) toks.push('</' + name + '>'); continue; }
    const attrs = [];
    for (const a of m[3].matchAll(/([^\s=>\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
      attrs.push(a[1].toLowerCase() + '=' + (a[2] ?? a[3] ?? a[4] ?? '').replace(/\s+/g, ' ').trim());
    }
    attrs.sort();
    toks.push('<' + name + (attrs.length ? ' ' + attrs.join(' ') : '') + '>');
    if (m[4] && !VOID.has(name)) toks.push('</' + name + '>');
  }
  // benachbarte Texte zusammenfassen
  return toks;
}
function parts(html) {
  const head = /<head[\s\S]*?<\/head>/i.exec(html)?.[0] ?? '';
  const body = /<body[\s\S]*<\/body>/i.exec(html)?.[0] ?? '';
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
  const title = /<title>([\s\S]*?)<\/title>/.exec(head)?.[1];
  const hd = [...head.matchAll(/<(meta|link)\b[^>]*>/g)].map(m => tokenize(m[0])[0])
    .filter(t => !/rel=stylesheet|rel=preload.*as=style|as=style/.test(t)).sort();
  const bodyNoLd = body.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
  return { title, hd, ld, body: tokenize(bodyNoLd) };
}
function diff(a, b, label) {
  const A = JSON.stringify(a), B = JSON.stringify(b);
  if (A === B) return 0;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) {
    console.log(`  ${label} Abweichung bei ${i}:\n    alt: ${JSON.stringify(a[i])}\n    neu: ${JSON.stringify(b[i])}`); return 1;
  }
  return 1;
}
let bad = 0;
for (const p of process.argv.slice(2)) {
  const o = parts(fs.readFileSync(p, 'utf8')), n = parts(fs.readFileSync('dist/' + p, 'utf8'));
  // zusammenhängende Texte vergleichen: Tokenfolgen reichen, da Leerraum normalisiert
  let d = 0;
  if (o.title !== n.title) { console.log(`  title: ${o.title} / ${n.title}`); d++; }
  d += diff(o.hd, n.hd, 'head');
  d += diff(o.ld, n.ld, 'jsonld');
  d += diff(o.body, n.body, 'body');
  console.log(`${d ? 'DIFF' : 'OK  '} ${p} (body-tokens ${o.body.length}/${n.body.length}, ld ${o.ld.length}/${n.ld.length})`);
  bad += d;
}
process.exit(bad ? 1 : 0);
