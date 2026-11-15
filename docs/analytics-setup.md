# Analytics aktivieren (GoatCounter, cookielos) — ca. 5 Min

Vorbereitet, aber bewusst **inaktiv**. Zum Aktivieren:

1. Gratis-Account auf [goatcounter.com](https://www.goatcounter.com) anlegen → eigenen Code wählen (z. B. `floppa3d`).
2. `count.js` herunterladen (https://gc.zgo.at/count.js) und als `public/assets/vendor/count.js` ablegen (Self-Hosting, kein CDN).
3. In `src/layouts/Basis.astro` im auskommentierten Analytics-Block (`{/* … */}`) `CODE` durch den eigenen Code ersetzen und die Kommentar-Zeichen entfernen; im Skript-Tag `is:inline` ergänzen (`<script is:inline data-goatcounter=… async src=…>`), damit Astro es unverändert ausgibt. Danach in `public/_headers` die Sicherheitsregel (CSP) um die Adresse `https://CODE.goatcounter.com` bei `connect-src` und `img-src` erweitern — sonst blockiert der Browser die Zählung.
4. Den Absatz aus `docs/dse-absatz-analytics.md` **prüfen** und in die Datenschutzerklärung (`src/pages/datenschutz.astro`) einfügen.
5. `npm test` ausführen, committen und per Pull Request nach `main` bringen.

Reihenfolge wichtig: Erst Datenschutzerklärung ergänzen, dann live schalten.
