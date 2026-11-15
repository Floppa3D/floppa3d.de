// Hilfsfunktionen für Produktseiten (Nachbau aus build.js).
import fs from 'node:fs';
import path from 'node:path';
import { getCollection } from 'astro:content';
import { SITE_URL } from '../data/site';
import { etsyShopUrl, safeUrl } from './etsy';
import data from '../data/products.json';

export interface Product {
  slug: string;
  modelId: string;
  name: string;
  category: string;
  categoryLabel: string;
  material: string;
  price: string;
  priceNumeric: string;
  shortDescription: string;
  longDescription: string;
  details: Record<string, string>;
  colors: string[];
  images: string[];
  tags: string[];
  featured: boolean;
  etsyUrl: string;
}

export async function alleProdukte(): Promise<Product[]> {
  // getCollection liefert nicht die Reihenfolge der Datei — die Reihenfolge in products.json gilt.
  const reihenfolge = data.products.map((p) => p.slug);
  return (await getCollection('products'))
    .map((e) => e.data as Product)
    .sort((a, b) => reihenfolge.indexOf(a.slug) - reihenfolge.indexOf(b.slug));
}

/** Farb-Swatches: Hex-Näherungen an die Brand-Palette; unbekannte Namen → neutrales Grau. */
const COLOR_HEX: Record<string, string> = {
  'Sand Beige': '#D6C4A8',
  'Sage Green': '#9CAF88',
  'Terracotta': '#C56B4E',
  'Matt Schwarz': '#3A3A3A',
  'Matte Black': '#2B2B2B',
  'Cremeweiß': '#F2EFE9',
  'Matt Weiß': '#F2EFE9',
  'Arctic White': '#F4F6F5',
  'Marble White': '#EDEAE4',
  'Olive Green': '#7A8450',
  'Forest Green': '#2F4F3E',
  'Moss Green': '#6B7F59',
  'Dusty Rose': '#C9A9A6',
  'Soft Peach': '#F2C4A8',
  'Soft Lavender': '#B9A7C9',
  'Lavendel': '#B9A7C9',
  'Stone Grey': '#9A9A94',
  'Warm Grey': '#A39E93',
  'Sandstone': '#C8B597',
  'Clay Brown': '#9B6A4F',
  'Matte Cream': '#EFE6D5',
};

export function colorHex(name: string): string {
  return COLOR_HEX[name] || '#8A8A8A';
}

export function colorFileSlug(name: string): string {
  return name.toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/\s+/g, '-');
}

/** Pfad des Farbbilds (ab "/"), nur wenn die Datei unter public/ wirklich existiert. */
export function colorImage(slug: string, color: string): string | undefined {
  const rel = `assets/products/${slug}/farbe-${colorFileSlug(color)}.webp`;
  return fs.existsSync(path.join(process.cwd(), 'public', rel)) ? `/${rel}` : undefined;
}

/** Etsy-Adresse, wenn der Shop live ist (gepflegte etsyUrl), sonst null. */
export function liveEtsyHref(p: Pick<Product, 'etsyUrl'>): string | null {
  const href = safeUrl(p.etsyUrl);
  return Boolean(p.etsyUrl) && href !== '#' ? href : null;
}

/** Adresse des Etsy-Shops, wenn gepflegt (etsyShopUrl), sonst null. */
export function shopEtsyHref(): string | null {
  const href = safeUrl(etsyShopUrl);
  return Boolean(etsyShopUrl) && href !== '#' ? href : null;
}

export function relatedProducts(current: Product, all: Product[]): Product[] {
  const related = all.filter((p) => p.slug !== current.slug && p.category === current.category).slice(0, 3);
  if (related.length > 0) return related;
  return all.filter((p) => p.slug !== current.slug).slice(0, 3);
}

/** JSON-LD Product (offers erst, wenn der Etsy-Shop live ist). */
export function productJsonLd(product: Product) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription,
    image: (product.images || []).map((i) => `${SITE_URL}/assets/products/${i}`),
    brand: { '@type': 'Brand', name: 'Floppa3D' },
    category: product.categoryLabel,
    material: product.material,
    url: `${SITE_URL}/produkte/${product.slug}.html`,
  };
  const href = liveEtsyHref(product);
  if (href) {
    data.offers = {
      '@type': 'Offer',
      price: product.priceNumeric,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: href,
    };
  }
  return data;
}

export function breadcrumbJsonLd(product: Product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Start', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Shop', item: `${SITE_URL}/shop.html` },
      { '@type': 'ListItem', position: 3, name: product.name },
    ],
  };
}
