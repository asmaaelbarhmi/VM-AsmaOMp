# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication avec l'utilisateur

- **Toujours répondre en français**, quelle que soit la langue de la question.
- L'utilisateur débute en code : expliquer simplement, sans jargon non défini. Quand un terme technique est nécessaire (IIFE, viewBox, DOM, etc.), le définir en une phrase la première fois.
- Avant une modification, dire en une ou deux phrases ce qui va changer et pourquoi. Après, résumer ce qui a été fait et comment le vérifier dans le navigateur.
- Préférer de petites explications concrètes (quel fichier, quelle ligne, quel effet visible) aux explications abstraites.

## What this is

A static French-language marketing site + product configurator for a white-label textile workshop (Morocco, prices in MAD). Plain HTML/CSS/ES5 JavaScript — **no build step, no package manager, no tests, no linter**. All UI copy, comments and identifiers are in French; keep new code and text in French.

## Running locally

```
python3 -m http.server 8000
```
Then open http://localhost:8000. Any static server works; opening the HTML files directly via `file://` works too.

There is no test suite. Verify changes by loading `index.html` and `studio.html` in a browser and checking the console.

## Architecture

Two pages share three global scripts loaded in a fixed order (`config.js` → `catalog.js` → `site.js`, then `studio.js` on the studio page). Each script is an IIFE that reads/writes one `window` global; there are no modules or imports.

| File | Global | Role |
|---|---|---|
| `assets/config.js` | `window.SITE` | Brand name, contact details, MOQ, lead times, quantity tiers/discount factors, per-color surcharge, sample fee, optional `formEndpoint`. The brand is intentionally neutral ("Atelier"); changing `name` rebrands the whole site. |
| `assets/catalog.js` | `window.CATALOG` | Product data (`SUPPORTS`, `TECHS`, `COLORS`, `SIZES`, `CARE`) plus the SVG garment renderer (`draw`), graded measurement generator (`measures`) and helpers (`defaults`, `optionActive`, `isDark`, `esc`). |
| `assets/site.js` | — | Fills `[data-brand]`, `[data-email]`, `[data-delay="quote|sample|series"]`, `[data-moq]`… from `SITE`; handles `form[data-lead]` submission (POST to `formEndpoint` if set, otherwise builds a `mailto:` from inputs' `data-label`). |
| `assets/studio.js` | — | The configurator: a single state object `S` → `update()` = `normalize()` + `build()` + `drawStage()` + `summary()`. Also computes the per-tier estimate and generates the printable tech sheet (`fiche()`). |
| `assets/site.css` | — | Shared styles, CSS custom properties in `:root`, dark theme via `prefers-color-scheme` and `[data-theme]`. Studio-specific styles live inline in `studio.html`'s `<style>`. |

`index.html` has its own inline script that renders the hero garments, the support catalogue cards (linking to `studio.html#<supportKey>`) and the technique grid from `CATALOG`.

### Catalog data conventions (`assets/catalog.js`)

Most records are **positional arrays**, not objects — read the accessor before adding fields:

- Option choice: `[key, label, priceDelta]`. An option group may carry `when: {otherOptionKey: value}` to show only conditionally (checked by `optionActive`).
- Material: `[key, label, composition, grammage, priceDelta, careKey]` — index 5 maps to `CARE` and is also what `needsPoly` techniques test (`'poly'`).
- Genre/size range: `[key, label, sizesKey]` → `SIZES[sizesKey]`.
- Zone: `[label, x, y, w, h, view('f'|'b'), cmW, cmH, positionText, when?]` — x/y/w/h are in the 400×480 SVG viewBox; cm values drive the price per cm² and the tech sheet.
- Measure row (returned by each support's `measures(opts, genre)`): `[letter, label, refValue, gradeStep, tolerance]`; `CATALOG.measures` grades around the middle size.
- Technique: `base` + optional `perColor`/`setupPerColor` (screen print) or `setup` (others), `perCm2`, and compatibility flags `needsPoly` / `needsLight` enforced by `techBlock()` in studio.js.

Each support's `draw(opts, view, color)` returns `{ body, det, under? }` path strings; `CATALOG.draw` wraps them with shading, clip path, drop shadow and the back-neck label (`griffeY`). Adding a support = new entry in `SUPPORTS` with all of those keys; the catalogue page and the studio pick it up automatically.

### Pricing model (`estimate()` in studio.js)

`unit = (garment + markings) × tierFactor(qty) + labelling/packaging + setup / qty`, where garment = support `base` + material delta + option deltas, multiplied by `1 + colorSurcharge × (colors − 1)`. Labelling costs (`GRIFFES`, `BAGS`, `COST`) are constants at the top of studio.js, not in config. All figures are indicative placeholders meant to be validated by the workshop.

### Tech sheet

The "fiche technique" (dialog `#fiche`) is generated as HTML by `fiche()` and covers blocks 1, 2, 3, 5, 7, 8, 9 and 11 of the workshop's V1.0 template; the block numbers are referenced throughout comments and copy, so keep them consistent when editing.

## Conventions

- ES5 only (`var`, `function`, no arrow functions/template literals) to match the existing code and avoid needing a build.
- HTML is built with string concatenation; always pass user-supplied text through `CATALOG.esc`. Uploaded SVG motifs go through `sanitize()` in studio.js.
- `document.title` uses the `{brand}` placeholder, replaced at runtime from `SITE.name`.
