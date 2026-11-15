import data from '../data/products.json';
import { SITE_URL } from '../data/site';

const ETSY_PREFIX = 'https://www.etsy.com/';

export const etsyShopUrl: string = data.etsyShopUrl || '';

/**
 * Nur https-Etsy-Adressen und eigene Pfade durchlassen
 * (verhindert javascript:, data: usw.).
 */
export function safeUrl(url: string | null | undefined): string {
  if (!url) return '#';
  const s = String(url).trim();
  if (s.startsWith('/') || s.startsWith('#')) return s;
  if (s.startsWith(ETSY_PREFIX)) return s;
  if (s.startsWith(SITE_URL)) return s;
  return '#';
}
