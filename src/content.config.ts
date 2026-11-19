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
    imageAlts: z.array(z.string().min(1)).optional(), // Alt-Texte je Bild, gleiche Reihenfolge wie images; ohne Angabe gilt der Produktname
    tags: z.array(z.string()),
    featured: z.boolean(),
    // Bewusst ohne Standardwert: bei jedem neuen Produkt muss entschieden werden, ob die Bilder KI-Anteile haben.
    kiBilder: z.boolean({
      error: 'Das Feld "kiBilder" fehlt oder ist kein true/false. Bitte im Produkt in src/data/products.json eintragen: true, wenn die Bilder mit KI verbessert, bearbeitet oder erstellt wurden (dann erscheint der KI-Hinweis), sonst false.',
    }),
    // Ausnahmen von kiBilder: Pfade aus images, die ein unbearbeitetes Foto zeigen (kein KI-Etikett)
    echteBilder: z.array(z.string().min(1)).optional(),
    etsyUrl: z.string(), // darf leer sein, solange der Etsy-Shop nicht live ist
  }).refine((p) => !p.imageAlts || p.imageAlts.length === p.images.length, {
    message: 'imageAlts braucht genau einen Alt-Text pro Bild in images (gleiche Anzahl, gleiche Reihenfolge) oder muss ganz fehlen.',
    path: ['imageAlts'],
  }).refine((p) => !p.echteBilder || p.echteBilder.every((b) => p.images.includes(b)), {
    message: 'echteBilder enthält einen Pfad, der nicht in images steht. Jeder Eintrag muss genau so in images vorkommen (z. B. "custom-fonts/floppa3d-werkstatt-echt.png").',
    path: ['echteBilder'],
  }).refine((p) => !p.echteBilder || p.echteBilder.length === 0 || p.kiBilder, {
    message: 'echteBilder nimmt Bilder von kiBilder aus und ergibt nur bei kiBilder: true Sinn. Bei kiBilder: false die Liste bitte entfernen.',
    path: ['echteBilder'],
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
