# Site atelier textile — V1

Site statique (HTML, CSS, JS, sans build) d'un atelier de confection en marque blanche, construit à partir de la fiche technique gabarit V1.0.

## Pages

- `index.html` : accueil (deux portes d'entrée, catalogue des supports, techniques de marquage, processus, fiche technique en 11 blocs, contrôle qualité, marque blanche, FAQ, demande de devis).
- `studio.html` : configurateur. Chaque support (t-shirt, chemise, polo, sweat, hoodie, casquette, tote bag) a ses propres options, matières, coloris, emplacements de marquage, techniques compatibles et gammes de tailles. Il calcule une estimation par palier et génère une fiche technique imprimable (blocs 1, 2, 3, 5, 7, 8, 9, 11). `studio.html#chemise` ouvre directement un support.

## À personnaliser

- `assets/config.js` : **nom de marque** (neutre pour l'instant : « Atelier »), coordonnées, MOQ, délais, paliers et remises. Changer `name` met à jour tout le site.
- `assets/catalog.js` : supports, options et suppléments, matières, coloris, zones (cm), techniques, prix de base et mesures graduées. Toutes les valeurs sont indicatives et doivent être validées par l'atelier.
- Formulaires : sans `formEndpoint`, la demande s'ouvre dans le client email du visiteur. Renseigner une URL (Formspree, backend…) pour recevoir les demandes directement.

## Lancer en local

```
python3 -m http.server 8000
```
puis ouvrir http://localhost:8000.
