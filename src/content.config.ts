// Inhaltssammlungen: Produkte (aus products.json) und Journal (Markdown).
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

const products = defineCollection({
  loader: file('src/data/products.json', {
    parser: (text) => {
      const { products } = JSON.parse(text);
      return products.map((p: { slug: string }) => ({ id: p.slug, ...p }));
    },
  }),
  schema: z.object({
    slug: z.string().min(1),
    modelId: z.string().min(1),
    name: z.string().min(1),
    // erlaubte Werte; Tippfehler fallen so beim Build auf (Filter-Chips im Shop: blumen, organisation, deko)
    category: z.enum(['blumen', 'organisation', 'deko', 'auftragsdruck']),
    categoryLabel: z.string().min(1),
    material: z.string().min(1),
    price: z.string().min(1),
    priceNumeric: z.string(), // leer bei Auftragsdruck (Preis auf Anfrage)
    shortDescription: z.string().min(1),
    longDescription: z.string().min(1),
    details: z.record(z.string(), z.string()),
    colors: z.array(z.string().min(1)),
    images: z.array(z.string().min(1)),
    tags: z.array(z.string()),
    featured: z.boolean(),
    etsyUrl: z.string(), // darf leer sein, solange der Etsy-Shop nicht live ist
  }),
});

const journal = defineCollection({
  loader: glob({ pattern: '*.md', base: 'src/content/journal' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    eyebrow: z.string(),
    lead: z.string(),
    teaser: z.string(), // Kartentext in der Journal-Übersicht
    order: z.number().optional(),
  }),
});

export const collections = { products, journal };
