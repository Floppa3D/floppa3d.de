import { SITE_URL, LOGO_URL } from '../data/site';
import { etsyShopUrl } from './etsy';

export const ORG_ID = `${SITE_URL}/#org`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

const sameAs = ['https://www.instagram.com/floppa3d_ppstudio/'];
if (etsyShopUrl && etsyShopUrl.startsWith('https://www.etsy.com/')) sameAs.push(etsyShopUrl);

/** Organisations-Block; das Layout hängt ihn an jede Seite. */
export const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': ORG_ID,
  name: 'Floppa3D',
  legalName: 'Floppa3D GbR',
  description: '3D-Druck-Studio in Neufahrn bei Freising, Bayern: 3D-gedruckte Deko, personalisierte Buchstaben und Auftragsdruck. Versand nur innerhalb Deutschlands.',
  url: SITE_URL,
  logo: LOGO_URL,
  email: 'management@floppa3d.de',
  telephone: '+49 1515 4837335',
  founder: [
    { '@type': 'Person', name: 'Florian Kindler' },
    { '@type': 'Person', name: 'Paul Breitsprecher' },
  ],
  areaServed: { '@type': 'Country', name: 'Deutschland' },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Auweg 45',
    postalCode: '85375',
    addressLocality: 'Neufahrn bei Freising',
    addressCountry: 'DE',
  },
  sameAs,
};

/** WebSite-Block; hängt das Layout zusammen mit der Organisation an jede Seite. */
export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: `${SITE_URL}/`,
  name: 'Floppa3D',
  inLanguage: 'de-DE',
  publisher: { '@id': ORG_ID },
};

/** JSON für ein ld+json-Skript; "</" wird entschärft, damit das Tag nicht bricht. */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/<\//g, '<\\/');
}
