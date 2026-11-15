// Sitemap (Nachbau von generateSitemap aus build.js; lastmod = Baudatum wie dort).
import { SITE_URL } from '../data/site';
import { alleProdukte } from '../lib/produkt';

const STATIC_PAGES = [
  { loc: '/', priority: '1.0' },
  { loc: '/shop.html', priority: '0.9' },
  { loc: '/auftragsdruck.html', priority: '0.8' },
  { loc: '/material.html', priority: '0.7' },
  { loc: '/about.html', priority: '0.7' },
  { loc: '/journal/index.html', priority: '0.6' },
  { loc: '/journal/pla-vs-petg.html', priority: '0.6' },
  { loc: '/journal/3d-druck-deko-pflegen.html', priority: '0.6' },
  { loc: '/faq.html', priority: '0.6' },
  { loc: '/kontakt.html', priority: '0.6' },
  { loc: '/impressum.html', priority: '0.3' },
  { loc: '/datenschutz.html', priority: '0.3' },
  { loc: '/agb.html', priority: '0.3' },
];

export async function GET() {
  const products = await alleProdukte();
  const all = [
    ...STATIC_PAGES,
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
