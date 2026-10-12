/* =========================================================
   Catalogue des supports, matières, techniques et mesures.
   Toutes les valeurs (prix, grammages, mesures) sont des bases
   indicatives à valider par l'atelier (blocs 3, 5, 7 et 11).
   ========================================================= */
(function () {
  var COLORS = {
    blanc: ['Blanc', '#F3F1EA'], ecru: ['Écru', '#E6DCC6'], naturel: ['Naturel', '#E9DFC9'],
    sable: ['Sable', '#CDB998'], gris: ['Gris chiné', '#B7B6B1'], ciel: ['Bleu ciel', '#B9CADB'],
    terracotta: ['Terracotta', '#B5573A'], bordeaux: ['Bordeaux', '#5E1F2B'], marine: ['Marine', '#1E2A44'],
    foret: ['Vert forêt', '#24352C'], noir: ['Noir', '#222220']
  };

  var CARE = {
    coton: 'Lavage 30 °C · Pas de blanchiment · Pas de sèche-linge · Repassage doux · Nettoyage à sec P',
    lin: 'Lavage 40 °C · Pas de blanchiment · Séchage à plat · Repassage chaud · Nettoyage à sec P',
    molleton: 'Lavage 30 °C à l\'envers · Pas de blanchiment · Pas de sèche-linge · Repassage doux hors marquage',
    poly: 'Lavage 30 °C · Pas de blanchiment · Séchage à plat · Pas de repassage sur le marquage',
    toile: 'Lavage 30 °C · Pas de blanchiment · Pas de sèche-linge · Repassage moyen',
    cap: 'Nettoyage à la main · Pas de machine · Séchage à l\'air libre'
  };

  /* Techniques de marquage (bloc 7) */
  var TECHS = {
    serigraphie: {
      label: 'Sérigraphie', short: 'Aplats, 1 à 4 couleurs, grandes séries',
      file: 'Vectoriel (SVG, AI, PDF), une couche par couleur', colors: '1 à 4 Pantone',
      rules: 'Pas de dégradé, trait ≥ 0,5 mm', prepress: 'Typons, cadres, test de repérage',
      base: 4, perColor: 2.2, perCm2: 0.006, setupPerColor: 280
    },
    broderie: {
      label: 'Broderie', short: 'Relief premium, logos et petites surfaces',
      file: 'Fichier de points (DST, EMB) ou vectoriel à numériser', colors: 'Fils référencés',
      rules: 'Texte ≥ 5 mm de haut, surface ≤ 15 × 15 cm sans stabilisateur renforcé',
      prepress: 'Numérisation, test sur chute', base: 6, perCm2: 0.09, setup: 450, maxCm: 15
    },
    dtf: {
      label: 'DTF', short: 'Multicolore, dégradés, photos',
      file: 'PNG ou PDF 300 dpi, fond transparent', colors: 'Illimitées, quadri',
      rules: 'Blanc de soutien automatique sur fonds foncés', prepress: 'Impression film, test de transfert',
      base: 5, perCm2: 0.022, setup: 0
    },
    sublimation: {
      label: 'Sublimation', short: 'Intégrale, polyester clair uniquement',
      file: 'PNG ou PDF 300 dpi, au format du panneau', colors: 'Illimitées',
      rules: 'Polyester clair uniquement, prévoir débord 1 cm', prepress: 'Calibration couleur',
      base: 6, perCm2: 0.015, setup: 150, needsPoly: true, needsLight: true
    }
  };

  var SIZES = {
    unisexe: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    femme: ['XS', 'S', 'M', 'L', 'XL'],
    homme: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
    chemiseF: ['36', '38', '40', '42', '44', '46'],
    chemiseH: ['S', 'M', 'L', 'XL', 'XXL'],
    unique: ['TU']
  };

  /* ---------- Silhouettes (viewBox 400 × 480) ---------- */
  var B = {
    teeShort: 'M120 60 L70 78 L30 165 L96 195 L96 445 L304 445 L304 195 L370 165 L330 78 L280 60 C268 96 232 112 200 112 C168 112 132 96 120 60 Z',
    teeLong: 'M120 60 L70 78 L44 170 L22 400 L68 410 L96 232 L96 445 L304 445 L304 232 L332 410 L378 400 L356 170 L330 78 L280 60 C268 96 232 112 200 112 C168 112 132 96 120 60 Z',
    shirtLong: 'M140 58 L84 76 L52 170 L30 404 L76 414 L102 236 L102 456 L298 456 L298 236 L324 414 L370 404 L348 170 L316 76 L260 58 L200 70 Z',
    shirtShort: 'M140 58 L84 76 L44 176 L100 202 L102 236 L102 456 L298 456 L298 236 L300 202 L356 176 L316 76 L260 58 L200 70 Z',
    sweat: 'M118 62 L60 84 L30 240 L92 258 L92 450 L308 450 L308 258 L370 240 L340 84 L282 62 C270 100 230 114 200 114 C170 114 130 100 118 62 Z',
    hoodie: 'M200 24 C250 24 292 44 292 92 L340 110 L370 240 L308 258 L308 450 L92 450 L92 258 L30 240 L60 110 L108 92 C108 44 150 24 200 24 Z',
    cap: 'M80 240 C80 120 130 70 200 70 C270 70 320 120 320 240 Z',
    tote: 'M90 200 L310 200 L330 460 L70 460 Z'
  };
  var L = function (d, w, o) { return '<path d="' + d + '" fill="none" stroke="rgba(0,0,0,' + (o || .2) + ')" stroke-width="' + (w || 1.5) + '" stroke-linecap="round"/>'; };
  var F = function (d, o) { return '<path d="' + d + '" fill="rgba(0,0,0,' + o + ')"/>'; };
  var DOT = function (x, y, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + (r || 3) + '" fill="rgba(0,0,0,.32)"/>'; };

  function teeNeck(kind) {
    if (kind === 'v') return F('M124 62 L200 150 L276 62 C262 94 232 110 200 110 C168 110 138 94 124 62Z', .14) + L('M122 60 L200 152 L278 60', 9, .28);
    if (kind === 'montante') return L('M120 60 C140 108 260 108 280 60', 20, .22);
    return L('M120 60 C140 108 260 108 280 60', 10, .28);
  }
  function teeSides(long) {
    return long ? L('M96 430 L304 430 M25 384 L70 394 M375 384 L330 394')
      : L('M96 195 L108 182 M304 195 L292 182 M96 430 L304 430', 1.5, .18);
  }

  /* Chaque support : options du modèle, matières, coloris, zones de marquage,
     techniques compatibles, gammes de tailles, mesures de base et dessin. */
  var SUPPORTS = {
    tshirt: {
      label: 'T-shirt', code: 'TSH', base: 42, family: 'Haut maille',
      pitch: 'Le basique de toute collection, du jersey léger au heavyweight.',
      icon: 'M40 18 28 22 10 36l10 16 10-6v58h60V46l10 6 10-16-18-14-12-4c-4 8-12 12-20 12s-16-4-20-12z',
      options: [
        { key: 'coupe', label: 'Coupe', choices: [['regular', 'Regular', 0], ['oversize', 'Oversize', 3], ['ajustee', 'Ajustée', 0], ['boxy', 'Boxy', 3]] },
        { key: 'encolure', label: 'Encolure', choices: [['ronde', 'Col rond', 0], ['v', 'Col V', 1], ['montante', 'Col montant', 2]] },
        { key: 'manches', label: 'Manches', choices: [['courtes', 'Courtes', 0], ['longues', 'Longues', 6]] }
      ],
      materials: [
        ['jersey160', 'Jersey coton bio', '100 % coton biologique', 160, 0, 'coton'],
        ['jersey180', 'Jersey coton peigné', '100 % coton peigné', 180, 4, 'coton'],
        ['heavy240', 'Heavy jersey', '100 % coton, maille serrée', 240, 10, 'coton'],
        ['poly150', 'Jersey technique', '100 % polyester recyclé', 150, 2, 'poly']
      ],
      colors: ['blanc', 'ecru', 'sable', 'gris', 'terracotta', 'bordeaux', 'marine', 'foret', 'noir'],
      techs: ['serigraphie', 'broderie', 'dtf', 'sublimation'],
      genres: [['unisexe', 'Unisexe', 'unisexe'], ['femme', 'Femme', 'femme'], ['homme', 'Homme', 'homme']],
      zones: {
        poitrine: ['Poitrine', 130, 150, 140, 170, 'f', 28, 34, '8 cm sous l\'encolure, centré milieu devant'],
        coeur: ['Cœur', 222, 150, 50, 50, 'f', 10, 10, '20 cm sous la pointe d\'épaule gauche, 10 cm du milieu devant'],
        manche: ['Manche', 314, 118, 32, 32, 'f', 8, 8, 'Manche gauche, 8 cm sous la couture d\'épaule'],
        dos: ['Dos', 130, 120, 140, 190, 'b', 30, 40, '10 cm sous l\'encolure, centré milieu dos']
      },
      griffeY: 86,
      measures: function (o, g) {
        var w = { oversize: 5, boxy: 6, ajustee: -2 }[o.coupe] || 0, f = g === 'femme' ? -3 : 0;
        return [
          ['A', '1/2 tour de poitrine (2,5 cm sous emmanchure)', 52 + w + f, 2.5, 1],
          ['C', '1/2 largeur bas', 52 + w + f, 2.5, 1],
          ['D', 'Longueur totale (point haut d\'épaule)', 71 + (o.coupe === 'boxy' ? -3 : 0) + (g === 'femme' ? -4 : 0), 2, 1],
          ['F', 'Longueur épaule', 15 + (w > 0 ? 4 : 0), 0.6, 0.5],
          ['J', 'Largeur d\'encolure, couture à couture', 18, 0.5, 0.5],
          ['K', 'Hauteur bord-côte d\'encolure', o.encolure === 'montante' ? 3.5 : 2, 0, 0.2],
          ['M', 'Longueur de manche', o.manches === 'longues' ? 62 : 21, 1, 0.5],
          ['N', 'Profondeur d\'emmanchure', 23 + (w > 0 ? 2 : 0), 1, 0.5]
        ];
      },
      draw: function (o, v) {
        var long = o.manches === 'longues';
        return {
          body: long ? B.teeLong : B.teeShort,
          det: (v === 'f' ? teeNeck(o.encolure) : L('M120 60 C150 82 250 82 280 60', 10, .28)) + teeSides(long)
        };
      }
    },

    chemise: {
      label: 'Chemise', code: 'CHE', base: 135, family: 'Chaîne et trame',
      pitch: 'Popeline, oxford ou lin : col, poignets et boutons au choix.',
      icon: 'M44 16 30 22 12 40l8 64h24l2-56v62h28V50l2 54h24l8-64-18-18-14-6-16 10z M60 26v80',
      options: [
        { key: 'coupe', label: 'Coupe', choices: [['regular', 'Regular', 0], ['slim', 'Slim', 0], ['oversize', 'Oversize', 5]] },
        { key: 'col', label: 'Col', choices: [['classique', 'Classique', 0], ['boutonne', 'Boutonné', 2], ['mao', 'Mao', 0], ['cubain', 'Cubain', 3]] },
        { key: 'manches', label: 'Manches', choices: [['longues', 'Longues', 0], ['courtes', 'Courtes', -6]] },
        { key: 'poignets', label: 'Poignets', choices: [['simple', 'Boutonnés', 0], ['mousquetaire', 'Mousquetaires', 6]], when: { manches: 'longues' } },
        { key: 'poche', label: 'Poche', choices: [['aucune', 'Sans poche', 0], ['poitrine', 'Poche poitrine', 4]] },
        { key: 'boutons', label: 'Boutons', choices: [['resine', 'Résine assortie', 0], ['corozo', 'Corozo', 5], ['nacre', 'Nacre', 9]] }
      ],
      materials: [
        ['popeline', 'Popeline', '100 % coton', 115, 0, 'coton'],
        ['oxford', 'Oxford', '100 % coton', 140, 8, 'coton'],
        ['lin', 'Lin lavé', '100 % lin', 150, 22, 'lin'],
        ['flanelle', 'Flanelle', '100 % coton gratté', 180, 15, 'coton']
      ],
      colors: ['blanc', 'ecru', 'ciel', 'sable', 'terracotta', 'marine', 'foret', 'noir'],
      techs: ['broderie', 'serigraphie', 'dtf'],
      genres: [['femme', 'Femme', 'chemiseF'], ['homme', 'Homme', 'chemiseH']],
      zones: {
        coeur: ['Cœur', 234, 148, 40, 40, 'f', 8, 8, 'Poitrine gauche, 20 cm sous la pointe d\'épaule'],
        poignet: ['Poignet', 334, 382, 28, 18, 'f', 3, 2, 'Poignet gauche, centré, 1,5 cm de la boutonnière', { manches: 'longues' }],
        empiecement: ['Empiècement', 150, 92, 100, 30, 'b', 20, 6, 'Centré sur l\'empiècement dos'],
        dos: ['Dos', 132, 170, 136, 160, 'b', 26, 30, '5 cm sous l\'empiècement, centré milieu dos']
      },
      griffeY: 70,
      measures: function (o, g) {
        var h = g === 'homme', w = { oversize: 5, slim: -2 }[o.coupe] || 0, long = o.manches !== 'courtes';
        var r = [
          ['A', '1/2 tour de poitrine', (h ? 58 : 56) + w, 2, 1],
          ['B', '1/2 largeur taille', (h ? 56 : 54) + w, 2, 1],
          ['C', '1/2 largeur bas', (h ? 57 : 55) + w, 2, 1],
          ['D', 'Hauteur devant (pointe épaule – bas)', h ? 78 : 72, 0.7, 0.7],
          ['E', 'Longueur milieu dos', h ? 80 : 74, 0.75, 0.7],
          ['F', 'Longueur épaule', h ? 15 : 13.4, 0.5, 0.5],
          ['H', 'Carrure devant', h ? 43 : 40, 1.5, 0.3],
          ['I', 'Carrure dos', h ? 45 : 41, 1.5, 0.3],
          ['J', 'Tour d\'encolure', h ? 41 : 38, 1, 0.5],
          ['K', 'Hauteur pied de col milieu dos', o.col === 'mao' ? 3.5 : 3, 0, 0.2]
        ];
        if (o.col !== 'mao') r.push(['L', 'Hauteur col milieu dos', 4.4, 0, 0.2]);
        r.push(['M', long ? 'Longueur manche avec poignet' : 'Longueur manche', long ? (h ? 65 : 62) : 24, 0.5, 0.4]);
        r.push(['N', 'Profondeur d\'emmanchure', h ? 24 : 22, 0.5, 0.5]);
        if (long) { r.push(['P', '1/2 bas de manche, poignet fermé', h ? 12 : 11.1, 0.4, 0.2]); r.push(['Q', 'Hauteur poignet', o.poignets === 'mousquetaire' ? 7 : 6, 0, 0.2]); }
        r.push(['R', 'Hauteur empiècement dos', 13, 0, 0.2]);
        return r;
      },
      draw: function (o, v) {
        var long = o.manches !== 'courtes', d = '';
        var stand = F('M140 56 C160 46 240 46 260 56 L260 66 C240 58 160 58 140 66Z', .16);
        if (v === 'f') {
          var top = o.col === 'cubain' ? 150 : 76;
          d += L('M192 ' + top + ' L192 456 M208 ' + top + ' L208 456', 1.2, .22);
          for (var y = (o.col === 'cubain' ? 176 : 104); y < 450; y += 50) d += DOT(200, y, 3.2);
          if (o.col === 'mao') d += F('M142 48 C160 38 240 38 258 48 L262 66 C240 74 160 74 138 66 Z', .14) + L('M142 48 C160 38 240 38 258 48 L262 66 C240 74 160 74 138 66 Z', 1.2, .25);
          else if (o.col === 'cubain') d += F('M200 150 L142 56 L126 72 L176 150 Z', .12) + F('M200 150 L258 56 L274 72 L224 150 Z', .12) + L('M200 150 L142 56 L126 72 L176 150 M200 150 L258 56 L274 72 L224 150', 1.2, .25);
          else {
            d += stand + F('M200 74 L142 54 L134 68 L166 112 Z', .1) + F('M200 74 L258 54 L266 68 L234 112 Z', .1) + L('M200 74 L142 54 L134 68 L166 112 Z M200 74 L258 54 L266 68 L234 112 Z', 1.2, .28);
            if (o.col === 'boutonne') d += DOT(162, 104, 2.2) + DOT(238, 104, 2.2);
          }
          if (o.poche === 'poitrine') d += L('M230 146 L272 146 L272 196 L251 204 L230 196 Z', 1.3, .26);
          d += long ? L('M33 378 L80 388 M367 378 L320 388', 1.5, .25) : L('M48 168 L102 194 M352 168 L298 194', 1.5, .2);
          if (long && o.poignets === 'mousquetaire') d += L('M31 392 L78 402 M369 392 L322 402', 1, .2);
        } else {
          d += stand + L('M140 56 C160 46 240 46 260 56', 1.2, .25) + L('M106 130 C160 138 240 138 294 130', 1.5, .25) + L('M200 132 L200 176', 1.2, .2);
          d += long ? L('M33 378 L80 388 M367 378 L320 388', 1.5, .25) : '';
        }
        return { body: long ? B.shirtLong : B.shirtShort, det: d };
      }
    },

    polo: {
      label: 'Polo', code: 'POL', base: 78, family: 'Haut maille',
      pitch: 'Piqué coton, col côtes ou tissé, pour l\'uniforme comme la mode.',
      icon: 'M40 18 28 22 10 36l10 16 10-6v58h60V46l10 6 10-16-18-14-12-4c-4 8-12 12-20 12s-16-4-20-12zM48 20l12 14 12-14M60 34v18',
      options: [
        { key: 'coupe', label: 'Coupe', choices: [['regular', 'Regular', 0], ['ajustee', 'Ajustée', 0]] },
        { key: 'col', label: 'Col', choices: [['cotes', 'Col côtes', 0], ['tisse', 'Col tissé', 3]] },
        { key: 'patte', label: 'Patte', choices: [['2', '2 boutons', 0], ['3', '3 boutons', 1]] },
        { key: 'manches', label: 'Manches', choices: [['courtes', 'Courtes', 0], ['longues', 'Longues', 7]] }
      ],
      materials: [
        ['pique', 'Piqué coton', '100 % coton', 220, 0, 'coton'],
        ['piquebio', 'Piqué coton bio', '100 % coton biologique', 220, 5, 'coton'],
        ['tech', 'Piqué technique', '100 % polyester recyclé', 160, 0, 'poly']
      ],
      colors: ['blanc', 'ecru', 'sable', 'gris', 'bordeaux', 'marine', 'foret', 'noir'],
      techs: ['broderie', 'serigraphie', 'dtf', 'sublimation'],
      genres: [['unisexe', 'Unisexe', 'unisexe'], ['femme', 'Femme', 'femme'], ['homme', 'Homme', 'homme']],
      zones: {
        coeur: ['Cœur', 222, 150, 50, 50, 'f', 10, 10, '20 cm sous la pointe d\'épaule gauche, 10 cm du milieu devant'],
        poitrine: ['Poitrine', 130, 210, 140, 120, 'f', 28, 24, '18 cm sous l\'encolure, centré milieu devant'],
        manche: ['Manche', 314, 118, 32, 32, 'f', 8, 8, 'Manche gauche, 8 cm sous la couture d\'épaule'],
        dos: ['Dos', 130, 120, 140, 190, 'b', 30, 40, '10 cm sous l\'encolure, centré milieu dos']
      },
      griffeY: 86,
      measures: function (o, g) {
        var f = g === 'femme' ? -3 : 0, w = o.coupe === 'ajustee' ? -2 : 0;
        return [
          ['A', '1/2 tour de poitrine', 53 + f + w, 2.5, 1],
          ['C', '1/2 largeur bas', 53 + f + w, 2.5, 1],
          ['D', 'Longueur totale (point haut d\'épaule)', 72 + (g === 'femme' ? -4 : 0), 2, 1],
          ['F', 'Longueur épaule', 15.5, 0.6, 0.5],
          ['G', 'Longueur patte de boutonnage', o.patte === '3' ? 15 : 12, 0, 0.3],
          ['L', 'Hauteur col milieu dos', 7, 0, 0.3],
          ['M', 'Longueur de manche', o.manches === 'longues' ? 62 : 22, 1, 0.5],
          ['N', 'Profondeur d\'emmanchure', 23, 1, 0.5]
        ];
      },
      draw: function (o, v) {
        var long = o.manches === 'longues', d;
        if (v === 'f') {
          var end = o.patte === '3' ? 214 : 190;
          d = F('M128 58 L172 58 L200 122 L228 58 L272 58 L262 84 L214 128 L186 128 L138 84 Z', .16) + L('M128 58 L172 58 L200 122 L228 58 L272 58 L262 84 L214 128 L186 128 L138 84 Z', 1.2, .25)
            + L('M192 122 L192 ' + end + ' M208 122 L208 ' + end + ' M192 ' + end + ' L208 ' + end, 1.3, .25) + DOT(200, 146) + DOT(200, 170) + (o.patte === '3' ? DOT(200, 194) : '');
        } else d = F('M128 58 C150 88 250 88 272 58 L262 84 C240 100 160 100 138 84 Z', .16);
        return { body: long ? B.teeLong : B.teeShort, det: d + teeSides(long) };
      }
    },

    sweat: {
      label: 'Sweat', code: 'SWE', base: 115, family: 'Molleton',
      pitch: 'Col rond en molleton gratté ou French terry, bord-côte au choix.',
      icon: 'M40 18 28 22 10 36l10 16 10-6v58h60V46l10 6 10-16-18-14-12-4c-4 8-12 12-20 12s-16-4-20-12zM30 96h60M30 46l-6 40M90 46l6 40',
      options: [
        { key: 'coupe', label: 'Coupe', choices: [['regular', 'Regular', 0], ['oversize', 'Oversize', 5], ['crop', 'Court', 0]] },
        { key: 'bas', label: 'Finition bas', choices: [['cotes', 'Bord-côte', 0], ['ourlet', 'Ourlet droit', 0]] }
      ],
      materials: [
        ['molleton300', 'Molleton gratté', '80 % coton, 20 % polyester', 300, 0, 'molleton'],
        ['terry280', 'French terry', '100 % coton bio', 280, 6, 'molleton'],
        ['heavy400', 'Heavy fleece', '100 % coton', 400, 18, 'molleton']
      ],
      colors: ['blanc', 'ecru', 'sable', 'gris', 'terracotta', 'bordeaux', 'marine', 'foret', 'noir'],
      techs: ['serigraphie', 'broderie', 'dtf'],
      genres: [['unisexe', 'Unisexe', 'unisexe'], ['femme', 'Femme', 'femme'], ['homme', 'Homme', 'homme']],
      zones: {
        poitrine: ['Poitrine', 135, 150, 130, 160, 'f', 28, 34, '8 cm sous l\'encolure, centré milieu devant'],
        coeur: ['Cœur', 225, 150, 48, 48, 'f', 10, 10, '20 cm sous la pointe d\'épaule gauche, 10 cm du milieu devant'],
        manche: ['Manche', 318, 124, 30, 30, 'f', 8, 8, 'Manche gauche, 8 cm sous la couture d\'épaule'],
        dos: ['Dos', 130, 120, 140, 190, 'b', 30, 40, '10 cm sous l\'encolure, centré milieu dos']
      },
      griffeY: 88,
      measures: function (o, g) {
        var w = o.coupe === 'oversize' ? 5 : 0, f = g === 'femme' ? -3 : 0;
        return [
          ['A', '1/2 tour de poitrine', 56 + w + f, 2.5, 1],
          ['C', o.bas === 'cotes' ? '1/2 largeur bord-côte bas, relâché' : '1/2 largeur bas', (o.bas === 'cotes' ? 48 : 55) + w + f, 2.5, 1],
          ['D', 'Longueur totale (point haut d\'épaule)', (o.coupe === 'crop' ? 60 : 70) + (g === 'femme' ? -3 : 0), 2, 1],
          ['F', 'Longueur épaule', 15 + (w ? 5 : 0), 0.6, 0.5],
          ['M', 'Longueur de manche avec bord-côte', 62, 1, 0.5],
          ['N', 'Profondeur d\'emmanchure', 25 + (w ? 2 : 0), 1, 0.5],
          ['Q', 'Hauteur bord-côte poignet', 6, 0, 0.2]
        ];
      },
      draw: function (o, v) {
        var d = v === 'f' ? L('M118 62 C138 110 262 110 282 62', 12, .28) : L('M118 62 C150 84 250 84 282 62', 12, .28);
        d += L('M92 258 L104 246 M308 258 L296 246 M32 232 L92 250 M368 232 L308 250', 1.5, .2);
        if (o.bas === 'cotes') d += L('M92 432 L308 432');
        return { body: B.sweat, det: d };
      }
    },

    hoodie: {
      label: 'Hoodie', code: 'HOO', base: 150, family: 'Molleton',
      pitch: 'Enfilable ou zippé, capuche doublée, poche kangourou.',
      icon: 'M42 22c0-14 36-14 36 0l18 8 16 32-13 6-9-16v54H30V52l-9 16-13-6 16-32zM50 24c2 10 18 10 20 0M44 80h32l4 18H40z',
      options: [
        { key: 'fermeture', label: 'Fermeture', choices: [['enfilable', 'Enfilable', 0], ['zip', 'Zippé', 24]] },
        { key: 'poche', label: 'Poche', choices: [['kangourou', 'Kangourou', 0], ['aucune', 'Sans poche', -3]] },
        { key: 'cordon', label: 'Cordon', choices: [['plat', 'Plat coton', 0], ['rond', 'Rond, embouts métal', 3], ['sans', 'Sans cordon', -1]] },
        { key: 'coupe', label: 'Coupe', choices: [['regular', 'Regular', 0], ['oversize', 'Oversize', 6]] }
      ],
      materials: [
        ['molleton350', 'Molleton gratté', '80 % coton, 20 % polyester', 350, 0, 'molleton'],
        ['terry320', 'French terry', '100 % coton bio', 320, 8, 'molleton'],
        ['heavy450', 'Heavy fleece', '100 % coton', 450, 20, 'molleton']
      ],
      colors: ['blanc', 'ecru', 'sable', 'gris', 'terracotta', 'bordeaux', 'marine', 'foret', 'noir'],
      techs: ['serigraphie', 'broderie', 'dtf'],
      genres: [['unisexe', 'Unisexe', 'unisexe'], ['femme', 'Femme', 'femme'], ['homme', 'Homme', 'homme']],
      zones: {
        poitrine: ['Poitrine', 135, 160, 130, 150, 'f', 28, 30, '12 cm sous l\'encolure, centré milieu devant'],
        coeur: ['Cœur', 225, 160, 48, 48, 'f', 10, 10, '22 cm sous la pointe d\'épaule gauche, 10 cm du milieu devant'],
        manche: ['Manche', 318, 130, 30, 30, 'f', 8, 8, 'Manche gauche, 8 cm sous la couture d\'épaule'],
        dos: ['Dos', 130, 145, 140, 180, 'b', 30, 38, '6 cm sous la couture de capuche, centré milieu dos']
      },
      griffeY: 124,
      measures: function (o, g) {
        var w = o.coupe === 'oversize' ? 6 : 0, f = g === 'femme' ? -3 : 0;
        var r = [
          ['A', '1/2 tour de poitrine', 58 + w + f, 2.5, 1],
          ['C', '1/2 largeur bord-côte bas, relâché', 50 + w + f, 2.5, 1],
          ['D', 'Longueur totale (point haut d\'épaule)', 72 + (g === 'femme' ? -3 : 0), 2, 1],
          ['F', 'Longueur épaule', 15 + (w ? 5 : 0), 0.6, 0.5],
          ['M', 'Longueur de manche avec bord-côte', 63, 1, 0.5],
          ['N', 'Profondeur d\'emmanchure', 26, 1, 0.5],
          ['S', 'Hauteur capuche', 35, 0.5, 0.5],
          ['T', 'Largeur capuche à plat', 25, 0.5, 0.5]
        ];
        if (o.poche !== 'aucune') r.push(['U', 'Largeur poche kangourou', 32, 1, 0.5]);
        return r;
      },
      draw: function (o, v) {
        var d;
        if (v === 'f') {
          d = F('M142 92 C150 56 250 56 258 92 C246 122 222 134 200 134 C178 134 154 122 142 92 Z', .32) + L('M108 92 C130 128 270 128 292 92', 1.4, .22);
          if (o.cordon !== 'sans') d += L('M184 130 L180 296 M216 130 L220 296', o.cordon === 'rond' ? 3.5 : 4.5, .28) + (o.cordon === 'rond' ? DOT(180, 300, 3.5) + DOT(220, 300, 3.5) : '');
          if (o.fermeture === 'zip') d += L('M200 134 L200 448', 2.5, .35) + '<path d="M200 140 L200 446" stroke="rgba(255,255,255,.25)" stroke-width="1" stroke-dasharray="2 2"/>';
          if (o.poche !== 'aucune') d += o.fermeture === 'zip' ? L('M118 335 L194 335 L194 425 L110 425 Z M206 335 L282 335 L290 425 L206 425 Z') : L('M118 335 L282 335 L290 425 L110 425 Z');
          d += L('M92 258 L104 246 M308 258 L296 246 M92 435 L308 435');
        } else {
          d = L('M200 26 L200 118', 1.4, .22) + F('M108 92 C140 128 260 128 292 92 L292 100 C260 136 140 136 108 100Z', .12) + L('M92 258 L104 246 M308 258 L296 246 M92 435 L308 435');
        }
        return { body: B.hoodie, det: d };
      }
    },

    casquette: {
      label: 'Casquette', code: 'CAS', base: 48, family: 'Accessoire',
      pitch: '6 ou 5 panneaux, dad cap ou trucker, broderie en relief.',
      icon: 'M24 78c0-30 16-44 36-44s36 14 36 44zM24 78h72c8 0 16 4 18 10H24zM60 34v44',
      options: [
        { key: 'modele', label: 'Modèle', choices: [['6p', '6 panneaux structurée', 0], ['5p', '5 panneaux', 0], ['dad', 'Dad cap non structurée', 0], ['trucker', 'Trucker filet', 3]] },
        { key: 'visiere', label: 'Visière', choices: [['courbe', 'Courbée', 0], ['plate', 'Plate', 0]] },
        { key: 'fermeture', label: 'Fermeture', choices: [['scratch', 'Scratch', 0], ['metal', 'Boucle métal', 3], ['snap', 'Snapback', 2]] }
      ],
      materials: [
        ['twill', 'Twill coton', '100 % coton', 280, 0, 'cap'],
        ['brosse', 'Sergé brossé', '100 % coton brossé', 300, 3, 'cap'],
        ['velours', 'Velours côtelé', '100 % coton', 320, 6, 'cap']
      ],
      colors: ['blanc', 'ecru', 'sable', 'terracotta', 'bordeaux', 'marine', 'foret', 'noir'],
      techs: ['broderie', 'dtf'],
      genres: [['unique', 'Taille unique', 'unique']],
      zones: {
        devant: ['Devant', 148, 122, 104, 84, 'f', 11, 6, 'Panneau avant, centré, 1,5 cm au-dessus de la visière'],
        cote: ['Côté', 246, 150, 58, 54, 'f', 5, 4, 'Panneau latéral gauche, centré'],
        arriere: ['Arrière', 150, 110, 100, 70, 'b', 7, 3.5, 'Au-dessus de l\'ouverture de réglage']
      },
      measures: function (o) {
        return [
          ['A', 'Tour de tête (réglable 56 – 60)', 58, 0, 1],
          ['B', 'Hauteur couronne avant', o.modele === 'dad' ? 10 : 11.5, 0, 0.3],
          ['C', 'Profondeur visière', 7, 0, 0.3],
          ['D', 'Largeur visière', 18, 0, 0.3]
        ];
      },
      draw: function (o, v) {
        var brim = o.visiere === 'plate'
          ? 'M54 240 L346 240 C356 252 350 292 320 296 L80 296 C50 292 44 252 54 240 Z'
          : 'M60 242 C120 222 280 222 340 242 C362 250 350 312 300 312 C240 286 160 286 100 312 C50 312 38 250 60 242 Z';
        var seams = o.modele === '5p' ? 'M140 86 C150 150 156 200 160 240 M260 86 C250 150 244 200 240 240' : 'M200 70 L200 240 M140 86 C150 150 156 200 160 240 M260 86 C250 150 244 200 240 240';
        var mesh = o.modele === 'trucker' ? '<path d="M200 70 C270 70 320 120 320 240 L240 240 C244 200 250 150 260 86 Z M200 70 C130 70 80 120 80 240 L160 240 C156 200 150 150 140 86 Z" fill="rgba(255,255,255,.12)" stroke="rgba(0,0,0,.12)" stroke-dasharray="2 3"/>' : '';
        var d = v === 'f'
          ? mesh + F(brim, .22) + L(brim, 1.2, .2) + L(seams) + DOT(200, 68, 6)
          : mesh + F('M60 242 C120 262 280 262 340 242 L340 256 C280 276 120 276 60 256 Z', .22) + L(seams) + F('M170 190 L230 190 L230 240 L170 240 Z', .35) + (o.fermeture === 'metal' ? '<rect x="186" y="214" width="28" height="10" rx="2" fill="rgba(200,200,200,.8)"/>' : '');
        return { body: B.cap, det: d };
      }
    },

    tote: {
      label: 'Tote bag', code: 'TOT', base: 28, family: 'Accessoire',
      pitch: 'Toile de coton épaisse, anses longues ou courtes, soufflet en option.',
      icon: 'M28 46h64l6 62H22zM44 46c0-26 32-26 32 0',
      options: [
        { key: 'format', label: 'Format', choices: [['standard', 'Plat 38 × 42 cm', 0], ['cabas', 'Cabas à soufflet', 6]] },
        { key: 'anses', label: 'Anses', choices: [['longues', 'Longues (épaule)', 0], ['courtes', 'Courtes (main)', 0]] },
        { key: 'poche', label: 'Poche', choices: [['aucune', 'Sans poche', 0], ['interieure', 'Poche intérieure', 4]] }
      ],
      materials: [
        ['toile280', 'Toile de coton', '100 % coton', 280, 0, 'toile'],
        ['toile340', 'Toile épaisse', '100 % coton', 340, 5, 'toile'],
        ['recyclee', 'Toile recyclée', '70 % coton recyclé, 30 % polyester recyclé', 300, 3, 'toile']
      ],
      colors: ['naturel', 'ecru', 'sable', 'terracotta', 'marine', 'foret', 'noir'],
      techs: ['serigraphie', 'dtf', 'broderie'],
      genres: [['unique', 'Taille unique', 'unique']],
      zones: {
        face: ['Face', 120, 236, 160, 190, 'f', 30, 35, 'Centré, 6 cm sous l\'ourlet d\'ouverture'],
        dos: ['Dos', 120, 236, 160, 190, 'b', 30, 35, 'Centré, 6 cm sous l\'ourlet d\'ouverture']
      },
      measures: function (o) {
        var c = o.format === 'cabas';
        return [
          ['A', 'Largeur', c ? 40 : 38, 0, 1],
          ['B', 'Hauteur', c ? 36 : 42, 0, 1],
          ['C', 'Soufflet', c ? 10 : 0, 0, 0.5],
          ['D', 'Longueur d\'anse', o.anses === 'courtes' ? 35 : 65, 0, 1],
          ['E', 'Largeur d\'anse', 2.5, 0, 0.2]
        ];
      },
      draw: function (o, v, color) {
        var top = o.anses === 'courtes' ? 118 : 50;
        var h = '<path d="M140 200 C140 ' + top + ' 260 ' + top + ' 260 200" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="16" stroke-linecap="round"/><path d="M140 200 C140 ' + top + ' 260 ' + top + ' 260 200" fill="none" stroke="' + color + '" stroke-width="8" stroke-linecap="round"/>';
        return { body: B.tote, det: L('M90 200 L310 200 M96 214 L304 214') + (o.format === 'cabas' ? L('M90 200 L72 446 M310 200 L328 446', 1, .14) : ''), under: h };
      }
    }
  };

  function isDark(hex) {
    var r = parseInt(hex.substr(1, 2), 16), g = parseInt(hex.substr(3, 2), 16), b = parseInt(hex.substr(5, 2), 16);
    return (r * 0.299 + g * 0.587 + b * 0.114) < 140;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  function defaults(key) {
    var o = {};
    SUPPORTS[key].options.forEach(function (g) { o[g.key] = g.choices[0][0]; });
    return o;
  }
  function optionActive(g, o) {
    if (!g.when) return true;
    return Object.keys(g.when).every(function (k) { return o[k] === g.when[k]; });
  }

  /* Dessin d'un support. p = {color, opts, view, overlay, brand, griffe, id} */
  function draw(key, p) {
    var s = SUPPORTS[key], o = p.opts || defaults(key), v = p.view || 'f', c = p.color || '#F3F1EA';
    var sh = s.draw(o, v, c), id = p.id || ('g' + Math.random().toString(36).slice(2, 8)), dark = isDark(c);
    var out = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 400 480" role="img" aria-label="' + esc(s.label) + (v === 'b' ? ' vue dos' : ' vue devant') + '">' +
      '<defs><clipPath id="' + id + 'c"><path d="' + sh.body + '"/></clipPath>' +
      '<linearGradient id="' + id + 'h" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".2"/><stop offset=".18" stop-color="#000" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity="' + (dark ? '.05' : '.14') + '"/><stop offset=".82" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>' +
      '<linearGradient id="' + id + 'v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>' +
      '<filter id="' + id + 'd" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceAlpha" stdDeviation="8"/><feOffset dy="10"/><feComponentTransfer><feFuncA type="linear" slope=".25"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' +
      (sh.under || '') +
      '<g filter="url(#' + id + 'd)"><path d="' + sh.body + '" fill="' + c + '"/></g>' +
      '<g clip-path="url(#' + id + 'c)"><rect width="400" height="480" fill="url(#' + id + 'h)"/><rect width="400" height="480" fill="url(#' + id + 'v)"/>' + sh.det + '</g>' +
      '<path d="' + sh.body + '" fill="none" stroke="rgba(0,0,0,.22)" stroke-width="1.5"/>';
    if (v === 'b' && s.griffeY && p.griffe !== false) {
      var lbl = esc((p.brand || 'VOTRE MARQUE').toUpperCase()), y = s.griffeY, fs = lbl.length > 10 ? 6 : 8;
      if (p.griffe === 'transfert') out += '<text x="200" y="' + (y + 14) + '" text-anchor="middle" font-family="Jost,sans-serif" font-size="' + fs + '" letter-spacing=".8" fill="' + (dark ? 'rgba(255,255,255,.75)' : 'rgba(0,0,0,.6)') + '">' + lbl + '</text><text x="200" y="' + (y + 24) + '" text-anchor="middle" font-family="Jost,sans-serif" font-size="5" fill="' + (dark ? 'rgba(255,255,255,.6)' : 'rgba(0,0,0,.45)') + '">M · 100 % COTON</text>';
      else out += '<rect x="176" y="' + y + '" width="48" height="22" fill="' + (p.griffe === 'imprimee' ? '#FFFFFF' : '#F3F1EA') + '" stroke="rgba(0,0,0,.25)" stroke-width=".8"/><text x="200" y="' + (y + 14) + '" text-anchor="middle" font-family="Cormorant Garamond,serif" font-size="' + fs + '" letter-spacing=".8" fill="#23241F">' + lbl + '</text>';
    }
    return out + (p.overlay || '') + '</svg>';
  }

  /* Tableau de mesures gradué : valeurs autour de la taille de référence (milieu de gamme) */
  function measures(key, opts, genre) {
    var s = SUPPORTS[key], g = s.genres.filter(function (x) { return x[0] === genre; })[0] || s.genres[0];
    var sizes = SIZES[g[2]], ref = Math.floor((sizes.length - 1) / 2);
    return {
      sizes: sizes, ref: sizes[ref],
      rows: s.measures(opts, g[0]).map(function (r) {
        return { idx: r[0], label: r[1], tol: r[4], values: sizes.map(function (_, i) { return Math.round((r[2] + (i - ref) * r[3]) * 10) / 10; }) };
      })
    };
  }

  window.CATALOG = {
    COLORS: COLORS, CARE: CARE, TECHS: TECHS, SIZES: SIZES, SUPPORTS: SUPPORTS,
    draw: draw, defaults: defaults, optionActive: optionActive, measures: measures, isDark: isDark, esc: esc
  };
})();
