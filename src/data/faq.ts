// FAQ: eine Quelle für die sichtbaren Fragen und das FAQPage-JSON-LD.
// Antworten sind HTML (enthalten teils Links); das JSON-LD entfernt die Tags.
export const faqSections = [
  {
    "heading": "Versand & Lieferung",
    "label": "Versand und Lieferung",
    "items": [
      {
        "q": "Wohin verschickt ihr? Liefert ihr ins Ausland?",
        "a": "Wir verschicken aktuell ausschließlich innerhalb Deutschlands, per DHL. Bestellungen in andere Länder sind derzeit nicht möglich; eine Erweiterung auf weitere Länder ist geplant."
      },
      {
        "q": "Wie lange dauert der Versand?",
        "a": "In der Regel verlässt Ihre Bestellung innerhalb von 4–5 Werktagen unsere Werkstatt – oft schneller, denn gedruckt wird erst nach Ihrer Bestellung. Der Versand erfolgt anschließend per DHL; die Lieferzeit ab Versand richtet sich nach DHL."
      },
      {
        "q": "Was kostet der Versand?",
        "a": "Die Versandkosten sind im Etsy-Checkout ausgewiesen, bevor Sie die Bestellung abschließen. Innerhalb Deutschlands liegt der Versand in der Regel unter 5 Euro."
      }
    ]
  },
  {
    "heading": "Material & Pflege",
    "label": "Material und Pflege",
    "items": [
      {
        "q": "PLA oder PETG – was ist der Unterschied?",
        "a": "PLA wird aus pflanzlichen Rohstoffen gewonnen und eignet sich für Innenobjekte. Es ist steif, detailscharf und matt in der Oberfläche. PETG ist ein technischer Kunststoff: schlagfester, feuchtigkeitsresistenter und deutlich UV-stabiler – deshalb unsere Wahl für Funktionsteile und Stücke für den überdachten Außenbereich im Auftragsdruck."
      },
      {
        "q": "Ist PLA kompostierbar?",
        "a": "PLA ist biologisch abbaubar – allerdings nur unter industriellen Kompostierbedingungen (hohe Temperatur, spezifische Mikroorganismen). Im Heimkompost oder in der freien Natur zerfällt PLA kaum. Wir empfehlen, Objekte lange zu nutzen statt sie zu entsorgen."
      },
      {
        "q": "Wie pflege ich die Stücke?",
        "a": "Alle Objekte werden mit einem feuchten Tuch gereinigt. Weder PLA noch PETG sind spülmaschinenfest. Vermeiden Sie bei PLA-Stücken direkte Sonneneinstrahlung und Temperaturen über 60 °C – das Material verliert sonst seine Form."
      },
      {
        "q": "Kann ich echte Kerzen ins Glow House stellen?",
        "a": "Nein, ins Glow House gehören nur LED-Kerzen, die nicht heiß werden, niemals echte Kerzen oder Teelichter. Das Haus ist aus PLA gedruckt, und PLA wird ab etwa 55–60 °C weich. Die LED-Kerze ist nicht im Lieferumfang enthalten; verkauft wird nur das Haus (ca. 6,9 × 5,1 × 6,3 cm)."
      },
      {
        "q": "Sind eure Stücke für draußen geeignet?",
        "a": "Unsere Deko ist aus PLA und für drinnen gedacht. Für draußen drucken wir im Auftrag aus PETG, ausgelegt für überdachte Außenbereiche (Balkon, Terrasse). PETG ist feuchtigkeitsbeständig und gegenüber UV-Strahlung deutlich stabiler als PLA – bei dauerhafter direkter Sonneneinstrahlung kann es allerdings langfristig zu Farbveränderungen kommen. Bei extremen Minusgraden empfehlen wir, empfindlichere Stücke ins Innere zu holen."
      }
    ]
  },
  {
    "heading": "Sonderwünsche & Kauf",
    "label": "Sonderwünsche und Kauf",
    "items": [
      {
        "q": "Kann ich Sonderfarben bestellen?",
        "a": "In begrenztem Umfang ja. Schreiben Sie uns vor einer Bestellung über das <a href=\"/kontakt.html\">Kontaktformular</a> oder direkt per Etsy-Nachricht. Wir prüfen, ob das gewünschte Filament vorrätig ist und teilen Ihnen die Verfügbarkeit mit."
      },
      {
        "q": "Bieten Sie Maßanfertigungen an?",
        "a": "Für Sondermaße und individuelle Projekte nehmen wir uns gerne Zeit. Schreiben Sie uns über das <a href=\"/kontakt.html\">Kontaktformular</a> mit einer kurzen Beschreibung Ihres Vorhabens. Kleine Anpassungen bestehender Modelle sind meist unkompliziert möglich."
      },
      {
        "q": "Wie groß kann ein Buchstabe sein?",
        "a": "Ein Buchstabe lässt sich in einem Stück bis etwa 25 cm drucken. Das ist der Bauraum unseres Druckers, einer Prusa CORE One mit 250 × 220 × 270 mm (Breite × Tiefe × Höhe); je nach Form und Druckrichtung ist es etwas weniger oder mehr. Größere Buchstaben drucken wir in mehreren Teilen und setzen sie zusammen."
      },
      {
        "q": "Wo sitzt Floppa3D?",
        "a": "Floppa3D sitzt in Neufahrn bei Freising in Bayern und wurde von Florian Kindler und Paul Breitsprecher gegründet. Dort drucken wir alle Stücke in unserer Werkstatt. Verkauft wird online über Etsy, verschickt wird per DHL innerhalb Deutschlands. Mehr über uns finden Sie auf der <a href=\"/about.html\">Über-uns-Seite</a>."
      },
      {
        "q": "Warum verkaufen Sie über Etsy und nicht direkt?",
        "a": "Etsy übernimmt Zahlungsabwicklung, Käuferschutz und einen Teil der Logistik. Das erlaubt uns, uns auf das Entwerfen und Drucken zu konzentrieren, statt auf Shopsysteme. Bewusst klein, bewusst fokussiert."
      }
    ]
  }
];

const strip = (s: string) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqSections.flatMap((s) => s.items).map((i) => ({
    '@type': 'Question',
    name: strip(i.q),
    acceptedAnswer: { '@type': 'Answer', text: strip(i.a) },
  })),
};
