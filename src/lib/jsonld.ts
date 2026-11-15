import { SITE_URL, DEFAULT_OG_IMAGE } from '../data/site';

/** Organisations-Block; das Layout hängt ihn an jede Seite. */
export const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Floppa3D GbR',
  url: SITE_URL,
  logo: DEFAULT_OG_IMAGE,
  email: 'management@floppa3d.de',
  telephone: '+49 1515 4837335',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Auweg 45',
    postalCode: '85375',
    addressLocality: 'Neufahrn bei Freising',
    addressCountry: 'DE',
  },
  sameAs: ['https://www.instagram.com/floppa3d_ppstudio/'],
};

/** JSON für ein ld+json-Skript; "</" wird entschärft, damit das Tag nicht bricht. */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/<\//g, '<\/');
}
