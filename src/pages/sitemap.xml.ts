// Sitemap ohne priority; lastmod nur, wenn ein echtes Datum bekannt ist (Journal-Frontmatter).
import { getCollection } from 'astro:content';
import { SITE_URL } from '../data/site';
import { alleProdukte } from '../lib/produkt';

/* Feste Seiten; die Journal-Artikel kommen zwischen ANFANG und REST aus der Sammlung. */
const ANFANG = [
  { loc: '/' },
  { loc: '/shop.html' },
  { loc: '/auftragsdruck.html' },
  { loc: '/material.html' },
  { loc: '/about.html' },
  { loc: '/journal/index.html' },
];

const REST = [
  { loc: '/faq.html' },
  { loc: '/kontakt.html' },
  { loc: '/impressum.html' },
  { loc: '/datenschutz.html' },
  { loc: '/agb.html' },
];

export async function GET() {
  const products = await alleProdukte();
  // Artikel in der Reihenfolge des Feldes `order` (wie in der Journal-Übersicht)
  const artikel = (await getCollection('journal')).sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));
  const all: Array<{ loc: string; lastmod?: string }> = [
    ...ANFANG,
    ...artikel.map((a) => ({ loc: `/journal/${a.id}.html`, lastmod: a.data.aktualisiert ?? a.data.datum })),
    ...REST,
    ...products.map((p) => ({ loc: `/produkte/${p.slug}.html` })),
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const page of all) {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_URL}${page.loc}</loc>\n`;
    if (page.lastmod) xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
    xml += '  </url>\n';
  }
  xml += '</urlset>\n';
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
