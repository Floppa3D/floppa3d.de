// Sitemap (Nachbau von generateSitemap aus build.js; lastmod = Baudatum wie dort).
import { getCollection } from 'astro:content';
import { SITE_URL } from '../data/site';
import { alleProdukte } from '../lib/produkt';

/* Feste Seiten; die Journal-Artikel kommen zwischen ANFANG und REST aus der Sammlung. */
const ANFANG = [
  { loc: '/', priority: '1.0' },
  { loc: '/shop.html', priority: '0.9' },
  { loc: '/auftragsdruck.html', priority: '0.8' },
  { loc: '/material.html', priority: '0.7' },
  { loc: '/about.html', priority: '0.7' },
  { loc: '/journal/index.html', priority: '0.6' },
];

const REST = [
  { loc: '/faq.html', priority: '0.6' },
  { loc: '/kontakt.html', priority: '0.6' },
  { loc: '/impressum.html', priority: '0.3' },
  { loc: '/datenschutz.html', priority: '0.3' },
  { loc: '/agb.html', priority: '0.3' },
];

export async function GET() {
  const products = await alleProdukte();
  // Artikel in der Reihenfolge des Feldes `order` (wie in der Journal-Übersicht)
  const artikel = (await getCollection('journal')).sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));
  const all = [
    ...ANFANG,
    ...artikel.map((a) => ({ loc: `/journal/${a.id}.html`, priority: '0.6' })),
    ...REST,
    ...products.map((p) => ({ loc: `/produkte/${p.slug}.html`, priority: '0.8' })),
  ];
  const today = new Date().toISOString().split('T')[0];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const page of all) {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_URL}${page.loc}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  }
  xml += '</urlset>\n';
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
