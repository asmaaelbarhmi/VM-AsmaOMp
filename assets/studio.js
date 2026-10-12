/* Studio de configuration : support → modèle → matière → coloris → marquage
   → étiquetage → quantités, avec estimation par palier et fiche technique. */
(function () {
  var C = window.CATALOG, SITE = window.SITE, esc = C.esc;
  var $ = function (id) { return document.getElementById(id); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var GRIFFES = [['tissee', 'Tissée', 2.5], ['imprimee', 'Imprimée satin', 1.5], ['transfert', 'Transfert sans étiquette', 1.8]];
  var BAGS = [['recycle', 'Polybag recyclé', 0.8], ['kraft', 'Pochette kraft', 1.4]];
  var COST = { compo: 0.6, hangtag: 1.6, ean: 0.3 };
  var SPLITS = { 1: [100], 5: [10, 25, 30, 25, 10], 6: [5, 20, 30, 25, 15, 5] };
  var REF = {};

  var S = {
    sup: 'tshirt', opts: null, mat: null, genre: null, cols: [], marks: {}, active: null, view: 'f',
    qty: SITE.moq, sizes: null, brand: '', griffe: 'tissee', bag: 'recycle', hangtag: true, ean: true
  };

  /* ---------- accès aux données ---------- */
  function sup() { return C.SUPPORTS[S.sup]; }
  function mat() { return sup().materials.filter(function (m) { return m[0] === S.mat; })[0]; }
  function hex(k) { return C.COLORS[k][1]; }
  function choice(g) { return g.choices.filter(function (c) { return c[0] === S.opts[g.key]; })[0]; }
  function activeGroups() { return sup().options.filter(function (g) { return C.optionActive(g, S.opts); }); }
  function genre() { var s = sup(); return s.genres.filter(function (g) { return g[0] === S.genre; })[0] || s.genres[0]; }
  function sizeList() { return C.SIZES[genre()[2]]; }
  function zr(z) {
    var d = sup().zones[z];
    return { x: d[1], y: d[2], w: d[3], h: d[4], view: d[5], cmW: d[6], cmH: d[7], pos: d[8], label: d[0], when: d[9] };
  }
  function zoneOK(z) {
    var d = sup().zones[z]; if (!d) return false;
    return !d[9] || Object.keys(d[9]).every(function (k) { return S.opts[k] === d[9][k]; });
  }
  function zoneKeys() { return Object.keys(sup().zones).filter(zoneOK); }
  function markKeys() { return Object.keys(S.marks); }
  function techBlock(t) {
    var T = C.TECHS[t];
    if (T.needsPoly && mat()[5] !== 'poly') return 'Matière polyester requise';
    if (T.needsLight && S.cols.some(function (c) { return C.isDark(hex(c)); })) return 'Coloris clairs uniquement';
    return '';
  }
  function firstTech() { return sup().techs.filter(function (t) { return !techBlock(t); })[0]; }
  function newMark() { return { tech: firstTech(), colors: 1, motif: null, scale: 80, rot: 0, flip: false, dx: 0, dy: 0 }; }
  function tierFactor(q) {
    var f = 1; SITE.tiers.forEach(function (t) { if (q >= t) f = SITE.tierFactor[t]; }); return f;
  }
  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function fmt1(n) { return (Math.round(n * 10) / 10).toString().replace('.', ','); }

  /* Normalise l'état après tout changement de support, d'option ou de coloris */
  function normalize() {
    var s = sup();
    Object.keys(S.marks).forEach(function (z) { if (!zoneOK(z)) delete S.marks[z]; });
    Object.keys(S.marks).forEach(function (z) {
      var m = S.marks[z];
      if (s.techs.indexOf(m.tech) < 0 || techBlock(m.tech)) m.tech = firstTech();
    });
    if (!S.marks[S.active]) S.active = markKeys()[0] || null;
    if (S.sizes && S.sizes.length !== sizeList().length) S.sizes = null;
  }
  function setSupport(k) {
    if (!C.SUPPORTS[k]) return;
    var old = S.marks, s = C.SUPPORTS[k];
    S.sup = k; S.opts = C.defaults(k); S.mat = s.materials[0][0]; S.genre = s.genres[0][0]; S.sizes = null;
    S.cols = S.cols.filter(function (c) { return s.colors.indexOf(c) > -1; });
    if (!S.cols.length) S.cols = [s.colors[0]];
    S.marks = {};
    Object.keys(old).forEach(function (z) { if (zoneOK(z)) S.marks[z] = old[z]; });
    if (!markKeys().length) { var z0 = zoneKeys()[0]; S.marks[z0] = newMark(); }
    normalize();
    S.active = markKeys()[0];
    S.view = zr(S.active).view;
  }

  /* ---------- géométrie du marquage ---------- */
  function box(z) {
    var r = zr(z), m = S.marks[z], ar = m.motif ? m.motif.ar : 1, sc = m.scale / 100, w, h;
    if (ar >= r.w / r.h) { w = r.w * sc; h = w / ar; } else { h = r.h * sc; w = h * ar; }
    var cw = w / r.w * r.cmW, ch = h / r.h * r.cmH, max = C.TECHS[m.tech].maxCm;
    if (max && Math.max(cw, ch) > max) { var f = max / Math.max(cw, ch); w *= f; h *= f; cw *= f; ch *= f; }
    return { x: r.x + (r.w - w) / 2, y: r.y + (r.h - h) / 2, w: w, h: h, cw: cw, ch: ch };
  }
  function motifMarkup(m, b) {
    var sty = m.tech === 'broderie' ? ' style="filter:drop-shadow(0 .6px 0 rgba(0,0,0,.35)) drop-shadow(0 -.6px 0 rgba(255,255,255,.3))"' : '';
    var op = m.tech === 'sublimation' ? ' opacity=".92"' : '';
    if (m.motif.kind === 'text') {
      return '<text x="' + (b.x + b.w / 2) + '" y="' + (b.y + b.h * 0.8) + '" text-anchor="middle" font-family="\'' + esc(m.motif.font) + '\',sans-serif" font-size="' + (b.h * 0.95) + '" font-weight="700" fill="' + m.motif.color + '" textLength="' + b.w + '" lengthAdjust="spacingAndGlyphs"' + op + sty + '>' + esc(m.motif.text) + '</text>';
    }
    return '<image x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.h + '" href="' + m.motif.url + '" xlink:href="' + m.motif.url + '" preserveAspectRatio="xMidYMid meet"' + op + sty + '/>';
  }
  /* mode : 'edit' (aperçu interactif), 'export' (image propre), 'fiche' (croquis coté) */
  function overlay(view, mode, pfx, color) {
    var out = '', dark = C.isDark(color || hex(S.cols[0]));
    var ink = dark ? 'rgba(255,255,255,.75)' : 'rgba(0,0,0,.55)';
    markKeys().forEach(function (z, i) {
      var r = zr(z); if (r.view !== view) return;
      var m = S.marks[z], b = box(z), act = mode === 'edit' && z === S.active, id = pfx + 'z' + z;
      out += '<defs><clipPath id="' + id + '"><rect x="' + (r.x - 6) + '" y="' + (r.y - 6) + '" width="' + (r.w + 12) + '" height="' + (r.h + 12) + '"/></clipPath></defs>';
      if (mode === 'edit') out += '<rect x="' + r.x + '" y="' + r.y + '" width="' + r.w + '" height="' + r.h + '" fill="none" stroke="#8A6F45" stroke-width="' + (act ? 1.5 : 1) + '" stroke-dasharray="4 4" opacity="' + (act ? .8 : .35) + '"/>';
      if (m.motif) {
        var cx = b.x + b.w / 2, cy = b.y + b.h / 2;
        var tf = 'rotate(' + m.rot + ' ' + cx + ' ' + cy + ')' + (m.flip ? ' translate(' + (2 * cx) + ' 0) scale(-1 1)' : '');
        out += '<g clip-path="url(#' + id + ')"><g class="mv" transform="translate(' + m.dx + ' ' + m.dy + ')"><g transform="' + tf + '">' + motifMarkup(m, b) + '</g>' +
          (act ? '<rect class="drag" x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.h + '" fill="transparent"/>' : '') + '</g></g>';
      } else if (mode !== 'export') {
        if (mode === 'fiche') out += '<rect x="' + (b.x + m.dx) + '" y="' + (b.y + m.dy) + '" width="' + b.w + '" height="' + b.h + '" fill="none" stroke="' + ink + '" stroke-dasharray="3 3"/>';
        out += '<text x="' + (r.x + r.w / 2) + '" y="' + (r.y + r.h / 2 + 4) + '" text-anchor="middle" font-family="Jost,sans-serif" font-size="' + (r.w < 60 ? 7 : 11) + '" fill="' + ink + '">' + (r.w < 60 ? 'Motif' : 'Votre motif ici') + '</text>';
      }
      if (mode === 'fiche') {
        var bx = r.x - 4, by = r.y - 4;
        out += '<circle cx="' + bx + '" cy="' + by + '" r="9" fill="#8A6F45"/><text x="' + bx + '" y="' + (by + 4) + '" text-anchor="middle" font-family="Jost,sans-serif" font-size="11" font-weight="600" fill="#fff">' + (i + 1) + '</text>';
      }
    });
    return out;
  }
  function garment(view, mode, pfx, colorKey) {
    var c = hex(colorKey || S.cols[0]);
    return C.draw(S.sup, { color: c, opts: S.opts, view: view, overlay: overlay(view, mode, pfx, c), brand: S.brand, griffe: S.griffe, id: pfx });
  }

  /* ---------- estimation (bloc 11) ---------- */
  function estimate(q) {
    var s = sup(), conf = s.base + mat()[4];
    activeGroups().forEach(function (g) { conf += choice(g)[2]; });
    conf *= 1 + SITE.colorSurcharge * (S.cols.length - 1);
    var mk = 0, setup = 0;
    markKeys().forEach(function (z) {
      var m = S.marks[z], t = C.TECHS[m.tech], b = box(z);
      mk += t.base + (t.perColor ? t.perColor * m.colors : 0) + t.perCm2 * b.cw * b.ch;
      setup += t.setupPerColor ? t.setupPerColor * m.colors : (t.setup || 0);
    });
    var lab = COST.compo + (s.griffeY ? GRIFFES.filter(function (g) { return g[0] === S.griffe; })[0][2] : 0) +
      (S.hangtag ? COST.hangtag : 0) + (S.ean ? COST.ean : 0) + BAGS.filter(function (g) { return g[0] === S.bag; })[0][2];
    var tf = tierFactor(q), unit = (conf + mk) * tf + lab + setup / q;
    return { conf: conf * tf, mk: mk * tf, lab: lab, setup: setup, setupPer: setup / q, unit: unit, total: Math.round(unit) * q };
  }
  function sizePieces() {
    if (S.sizes) return S.sizes.slice();
    var n = sizeList().length, sp = SPLITS[n] || sizeList().map(function () { return 100 / n; });
    var out = sp.map(function (p) { return Math.round(S.qty * p / 100); });
    out[Math.floor((n - 1) / 2)] += S.qty - out.reduce(function (a, b) { return a + b; }, 0);
    return out;
  }

  /* ---------- construction des contrôles ---------- */
  function pressed(b) { return ' aria-pressed="' + (!!b) + '"'; }
  function delta(p) { return p ? '<small>' + (p > 0 ? '+' : '−') + Math.abs(p) + '</small>' : ''; }
  function chips(el, items, cur, onPick) {
    el.innerHTML = items.map(function (it) { return '<button type="button" data-k="' + it[0] + '"' + pressed(it[0] === cur) + (it[3] ? ' disabled title="' + esc(it[3]) + '"' : '') + '>' + esc(it[1]) + (it[2] !== undefined ? delta(it[2]) : '') + '</button>'; }).join('');
    $$('button', el).forEach(function (b) { b.onclick = function () { onPick(b.dataset.k); }; });
  }

  function build() {
    var s = sup();
    /* 1. support */
    $('sup').innerHTML = Object.keys(C.SUPPORTS).map(function (k) {
      return '<button type="button" data-k="' + k + '"' + pressed(S.sup === k) + '><svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round" aria-hidden="true"><path d="' + C.SUPPORTS[k].icon + '"/></svg>' + C.SUPPORTS[k].label + '</button>';
    }).join('');
    $$('#sup button').forEach(function (b) { b.onclick = function () { setSupport(b.dataset.k); history.replaceState(null, '', '#' + b.dataset.k); update(); }; });
    $('supPitch').textContent = s.pitch;

    /* 2. modèle */
    $('opts').innerHTML = activeGroups().map(function (g) { return '<div class="grp"><span>' + g.label + '</span><div class="chips" data-g="' + g.key + '"></div></div>'; }).join('');
    activeGroups().forEach(function (g) {
      chips($('opts').querySelector('[data-g="' + g.key + '"]'), g.choices, S.opts[g.key], function (k) { S.opts[g.key] = k; normalize(); update(); });
    });

    /* 3. matière */
    $('mats').innerHTML = s.materials.map(function (m) {
      return '<button type="button" data-k="' + m[0] + '"' + pressed(S.mat === m[0]) + '>' + m[1] + ' · ' + m[3] + ' g/m²<small>' + m[2] + '</small><em>' + (m[4] ? '+' + m[4] + ' ' + SITE.currency : 'Inclus') + '</em></button>';
    }).join('');
    $$('#mats button').forEach(function (b) { b.onclick = function () { S.mat = b.dataset.k; normalize(); update(); }; });
    $('care').textContent = 'Entretien : ' + C.CARE[mat()[5]];

    /* 4. coloris */
    $('sw').innerHTML = s.colors.map(function (k) { return '<button type="button" data-k="' + k + '"' + pressed(S.cols.indexOf(k) > -1) + ' aria-label="' + C.COLORS[k][0] + '" title="' + C.COLORS[k][0] + '" style="background:' + hex(k) + '"></button>'; }).join('');
    $$('#sw button').forEach(function (b) {
      b.onclick = function () {
        var k = b.dataset.k, i = S.cols.indexOf(k);
        if (i > -1) { if (S.cols.length > 1) S.cols.splice(i, 1); } else S.cols.push(k);
        normalize(); update();
      };
    });

    /* 5. marquage */
    $('zones').innerHTML = zoneKeys().map(function (z) {
      var on = !!S.marks[z];
      return '<button type="button" data-k="' + z + '" class="' + (on ? 'on' : '') + (S.active === z ? ' act' : '') + '"' + pressed(on) + '><span class="ck" aria-hidden="true">' + (on ? '✓' : '') + '</span>' + zr(z).label + '<small class="muted">' + (zr(z).view === 'b' ? 'dos' : '') + '</small></button>';
    }).join('');
    $$('#zones button').forEach(function (b) {
      b.onclick = function () {
        var z = b.dataset.k;
        if (!S.marks[z]) S.marks[z] = newMark();
        S.active = z; S.view = zr(z).view; update();
      };
    });
    buildMark();

    /* 6. étiquetage */
    $('griffeWrap').hidden = !s.griffeY;
    chips($('griffe'), GRIFFES.map(function (g) { return [g[0], g[1]]; }), S.griffe, function (k) { S.griffe = k; update(); });
    chips($('polybag'), BAGS.map(function (g) { return [g[0], g[1]]; }), S.bag, function (k) { S.bag = k; update(); });

    /* 7. quantités */
    $('qty').innerHTML = SITE.tiers.map(function (t, i) { return '<button type="button" data-k="' + t + '"' + pressed(S.qty === t) + '>' + fmt(t) + (i === SITE.tiers.length - 1 ? '+' : '') + '</button>'; }).join('') +
      '<label style="grid-column:1/-1;display:flex;align-items:center;gap:10px;font-size:13.5px;font-weight:400">Autre quantité <input class="in" style="flex:1;min-height:38px;padding:6px 10px" type="number" inputmode="numeric" min="' + SITE.moq + '" step="50" id="qtyIn" value="' + S.qty + '"></label>';
    $$('#qty button').forEach(function (b) { b.onclick = function () { S.qty = +b.dataset.k; S.sizes = null; update(); }; });
    $('qtyIn').onchange = function () { var v = parseInt(this.value, 10); S.qty = Math.max(SITE.moq, isNaN(v) ? SITE.moq : v); S.sizes = null; update(); };
    $('genreWrap').hidden = s.genres.length < 2;
    chips($('genre'), s.genres.map(function (g) { return [g[0], g[1] + ' ' + C.SIZES[g[2]][0] + '–' + C.SIZES[g[2]].slice(-1)[0]]; }), S.genre, function (k) { S.genre = k; S.sizes = null; update(); });
    var pcs = sizePieces(), tot = pcs.reduce(function (a, b) { return a + b; }, 0), list = sizeList();
    $('sizes').style.gridTemplateColumns = 'repeat(' + Math.min(list.length, 6) + ',minmax(0,1fr))';
    $('sizes').innerHTML = list.length < 2 ? '<span class="tot">Taille unique : ' + fmt(S.qty) + ' pièces</span>' :
      list.map(function (z, i) { return '<label>' + z + '<input type="text" inputmode="numeric" data-i="' + i + '" value="' + pcs[i] + '" aria-label="Pièces en taille ' + z + '"></label>'; }).join('') +
      '<span class="tot' + (tot !== S.qty ? ' bad' : '') + '">' + fmt(tot) + ' / ' + fmt(S.qty) + ' pièces réparties' + (tot !== S.qty ? ' — ajustez la répartition' : '') + '</span>';
    $$('#sizes input').forEach(function (inp) {
      inp.onchange = function () { if (!S.sizes) S.sizes = sizePieces(); S.sizes[+inp.dataset.i] = Math.max(0, parseInt(inp.value, 10) || 0); update(); };
    });
  }

  function buildMark() {
    var z = S.active, box_ = $('mk');
    box_.hidden = !z;
    if (!z) return;
    var m = S.marks[z], r = zr(z), b = box(z), t = C.TECHS[m.tech];
    $('mkTitle').textContent = r.label + ' — ' + fmt1(b.cw) + ' × ' + fmt1(b.ch) + ' cm';
    $('mkPos').textContent = 'Zone max. ' + r.cmW + ' × ' + r.cmH + ' cm · ' + r.pos;
    $('techs').innerHTML = sup().techs.map(function (k) {
      var why = techBlock(k);
      return '<button type="button" data-k="' + k + '"' + pressed(m.tech === k) + (why ? ' disabled title="' + why + '"' : '') + '>' + C.TECHS[k].label + '<small>' + (why || C.TECHS[k].short) + '</small></button>';
    }).join('');
    $$('#techs button').forEach(function (bt) { bt.onclick = function () { m.tech = bt.dataset.k; if (m.tech !== 'serigraphie') m.colors = 1; update(); }; });
    var clamp = t.maxCm && (Math.max(r.cmW, r.cmH) > t.maxCm) && m.scale > 0;
    $('mkRule').innerHTML = '<b style="font-weight:500">Fichier :</b> ' + t.file + '. <b style="font-weight:500">Règle :</b> ' + t.rules + '.' + (clamp ? ' Taille limitée à ' + t.maxCm + ' cm.' : '');
    $('mkColorsWrap').hidden = m.tech !== 'serigraphie';
    chips($('mkColors'), [['1', '1'], ['2', '2'], ['3', '3'], ['4', '4']], String(m.colors), function (k) { m.colors = +k; update(); });
    $('scale').value = m.scale; $('scalev').textContent = m.scale + ' %';
    $('rot').value = m.rot; $('rotv').textContent = m.rot + '°';
    $('flip').checked = m.flip;
    if (document.activeElement !== $('txt')) $('txt').value = m.motif && m.motif.kind === 'text' ? m.motif.text : '';
    $('clearMotif').disabled = !m.motif;
  }

  /* ---------- aperçu ---------- */
  function drawStage() {
    $('mock').innerHTML = garment(S.view, 'edit', 'st');
    $$('.views button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.v === S.view)); });
    $('tSup').textContent = sup().label + ' · ' + (S.view === 'b' ? 'Dos' : 'Devant');
    $('tCol').textContent = S.cols.map(function (c) { return C.COLORS[c][0]; }).join(', ');
    bindDrag();
    drawThumbs();
  }
  function drawThumbs() {
    $('thumbs').innerHTML = S.cols.length < 2 ? '' : S.cols.map(function (c, i) {
      return '<button type="button" data-i="' + i + '"' + pressed(i === 0) + ' aria-label="Afficher le coloris ' + C.COLORS[c][0] + '">' + garment(S.view, 'export', 'th' + i, c) + '</button>';
    }).join('');
    $$('#thumbs button').forEach(function (b) { b.onclick = function () { var i = +b.dataset.i, c = S.cols.splice(i, 1)[0]; S.cols.unshift(c); update(); }; });
  }
  function bindDrag() {
    var svg = $('mock').querySelector('svg'), el = $('mock').querySelector('rect.drag');
    if (!svg || !el) return;
    var m = S.marks[S.active], r = zr(S.active), mv = el.parentNode, start = null, pt = svg.createSVGPoint();
    var lim = Math.max(r.w, r.h) * 0.6;
    function pos(e) { pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); }
    el.addEventListener('pointerdown', function (e) { e.preventDefault(); var p = pos(e); start = { x: p.x - m.dx, y: p.y - m.dy }; el.setPointerCapture(e.pointerId); el.style.cursor = 'grabbing'; });
    el.addEventListener('pointermove', function (e) {
      if (!start) return;
      var p = pos(e);
      m.dx = Math.max(-lim, Math.min(lim, p.x - start.x)); m.dy = Math.max(-lim, Math.min(lim, p.y - start.y));
      mv.setAttribute('transform', 'translate(' + m.dx + ' ' + m.dy + ')');
    });
    var end = function () { if (!start) return; start = null; el.style.cursor = 'grab'; drawThumbs(); $('brief').value = brief(); };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  }

  /* ---------- récapitulatif ---------- */
  function summary() {
    var s = sup(), e = estimate(S.qty), mk = markKeys();
    var model = activeGroups().map(function (g) { return choice(g)[1]; }).join(', ');
    var rows = [
      ['Support', s.label], ['Modèle', model], ['Matière', mat()[1] + ', ' + mat()[3] + ' g/m²'],
      ['Coloris', S.cols.map(function (c) { return C.COLORS[c][0]; }).join(', ')],
      ['Marquage', mk.length ? mk.map(function (z) { return zr(z).label + ' (' + C.TECHS[S.marks[z].tech].label.toLowerCase() + ')'; }).join(', ') : 'Pièce unie'],
      ['Étiquetage', (s.griffeY ? GRIFFES.filter(function (g) { return g[0] === S.griffe; })[0][1] : 'Étiquette composition') + (S.hangtag ? ', hang-tag' : '')],
      ['Quantité', fmt(S.qty) + ' pièces'], ['Marque', S.brand || '—']
    ];
    $('recap').innerHTML = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('');
    $('pUnit').textContent = '≈ ' + fmt(e.unit) + ' ' + SITE.currency;
    $('pTot').textContent = 'HT / pièce · ≈ ' + fmt(e.total) + ' ' + SITE.currency + ' la série';
    $('brk').innerHTML = '<tr><th>Poste</th><th>/ pièce</th></tr>' + [
      ['Confection et matière', e.conf], ['Marquage', e.mk], ['Étiquetage et packaging', e.lab], ['Frais de lancement amortis', e.setupPer]
    ].map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + fmt1(r[1]) + '</td></tr>'; }).join('');
    $('tiers').innerHTML = '<tr><th>Palier</th><th>Prix / pièce</th></tr>' + SITE.tiers.map(function (t) {
      return '<tr' + (tierFactor(S.qty) === SITE.tierFactor[t] ? ' class="cur"' : '') + '><td>' + fmt(t) + ' pièces</td><td>≈ ' + fmt(estimate(t).unit) + ' ' + SITE.currency + '</td></tr>';
    }).join('');
    var w = [], tot = sizePieces().reduce(function (a, b) { return a + b; }, 0);
    if (tot !== S.qty) w.push('La répartition par taille (' + fmt(tot) + ') ne correspond pas à la quantité.');
    if (S.cols.length * SITE.moqColor > S.qty) w.push('Avec ' + S.cols.length + ' coloris, prévoyez au moins ' + fmt(S.cols.length * SITE.moqColor) + ' pièces.');
    var missing = mk.filter(function (z) { return !S.marks[z].motif; }).map(function (z) { return zr(z).label; });
    $('warn').innerHTML = w.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') +
      (missing.length ? '<span class="muted">Motif à fournir : ' + esc(missing.join(', ')) + '.</span>' : '');
    $('vSup').textContent = s.label;
    $('vCol').textContent = S.cols.length + ' sélectionné' + (S.cols.length > 1 ? 's' : '');
    $('vMk').textContent = mk.length ? mk.length + ' emplacement' + (mk.length > 1 ? 's' : '') : 'Pièce unie';
    $('vQty').textContent = fmt(S.qty) + ' pièces';
    $('brief').value = brief();
  }

  function brief() {
    var s = sup(), e = estimate(S.qty), pcs = sizePieces(), list = sizeList();
    var l = [
      'Marque : ' + (S.brand || '[à préciser]'),
      'Support : ' + s.label + ' — ' + activeGroups().map(function (g) { return g.label.toLowerCase() + ' ' + choice(g)[1].toLowerCase(); }).join(', '),
      'Matière : ' + mat()[1] + ' (' + mat()[2] + ', ' + mat()[3] + ' g/m²)',
      'Coloris : ' + S.cols.map(function (c) { return C.COLORS[c][0]; }).join(', ')
    ];
    var mk = markKeys();
    if (!mk.length) l.push('Marquage : aucun (pièce unie)');
    mk.forEach(function (z, i) {
      var m = S.marks[z], b = box(z);
      l.push('Marquage ' + (i + 1) + ' : ' + zr(z).label + ', ' + C.TECHS[m.tech].label + (m.tech === 'serigraphie' ? ' ' + m.colors + ' couleur' + (m.colors > 1 ? 's' : '') : '') + ', ' + fmt1(b.cw) + ' × ' + fmt1(b.ch) + ' cm, motif : ' + (m.motif ? m.motif.name : 'à fournir'));
    });
    l.push('Étiquetage : ' + (s.griffeY ? 'griffe ' + GRIFFES.filter(function (g) { return g[0] === S.griffe; })[0][1].toLowerCase() + ', ' : '') + 'étiquette composition' + (S.hangtag ? ', hang-tag' : '') + (S.ean ? ', EAN' : '') + ', ' + BAGS.filter(function (g) { return g[0] === S.bag; })[0][1].toLowerCase());
    l.push('Quantité : ' + fmt(S.qty) + ' pièces' + (list.length > 1 ? ' (' + list.map(function (z, i) { return z + ' ' + pcs[i]; }).join(', ') + ', gamme ' + genre()[1].toLowerCase() + ')' : ''));
    l.push('Estimation indicative : ≈ ' + fmt(e.unit) + ' ' + SITE.currency + ' HT / pièce');
    l.push('Dates, packaging, contraintes : ');
    return l.join('\n');
  }

  function update() { normalize(); build(); drawStage(); summary(); }

  /* ---------- fiche technique (blocs 1, 2, 3, 5, 7, 8, 11) ---------- */
  function trims() {
    var o = S.opts, k = S.sup, r = [];
    var btn = { resine: 'Boutons résine assortis 11 mm', corozo: 'Boutons corozo 11 mm', nacre: 'Boutons nacre 11 mm' };
    if (k === 'chemise') {
      r.push(['Thermocollant', 'Entoilage col, pied de col, ' + (o.manches === 'longues' ? 'poignets, ' : '') + 'patte', 'Polyester', '40']);
      r.push([btn[o.boutons], 'Patte de boutonnage' + (o.manches === 'longues' ? ', poignets' : '') + (o.col === 'boutonne' ? ', pointes de col' : '') + ' + 1 rappel', '—', '—']);
    }
    if (k === 'polo') { r.push([o.col === 'tisse' ? 'Col tissé' : 'Col en bord-côte', 'Col et bas de manches', 'Coton / élasthanne', '—']); r.push(['Boutons résine assortis 11 mm', 'Patte, ' + o.patte + ' boutons + 1 rappel', '—', '—']); }
    if (k === 'tshirt') r.push(['Bord-côte 1×1', 'Encolure', 'Coton / élasthanne', '220']);
    if (k === 'sweat' || k === 'hoodie') r.push(['Bord-côte 2×2', 'Poignets' + (k === 'hoodie' || S.opts.bas === 'cotes' ? ', bas' : ''), 'Coton / élasthanne', '320']);
    if (k === 'hoodie' && o.cordon !== 'sans') r.push(['Cordon ' + (o.cordon === 'rond' ? 'rond, embouts métal' : 'plat coton'), 'Capuche', 'Coton', '—']);
    if (k === 'hoodie' && o.fermeture === 'zip') r.push(['Fermeture à glissière séparable', 'Milieu devant', 'Métal ou résine', '—']);
    if (k === 'casquette') r.push(['Bandeau anti-transpiration', 'Intérieur', 'Coton', '—'], [{ scratch: 'Fermeture scratch', metal: 'Boucle métal', snap: 'Fermeture snapback' }[o.fermeture], 'Arrière', '—', '—']);
    r.push(['Fil à coudre', 'Assemblage', 'Polyester, assorti', '—']);
    return r;
  }
  function table(head, rows, cls) {
    return '<div class="scroll"><table' + (cls ? ' class="' + cls + '"' : '') + '><thead><tr>' + head.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }
  function kv(rows) { return '<div class="kv">' + rows.map(function (r) { return '<div><span>' + r[0] + '</span><b>' + esc(r[1]) + '</b></div>'; }).join('') + '</div>'; }

  function fiche() {
    var s = sup(), mt = mat(), g = genre(), ms = C.measures(S.sup, S.opts, S.genre), mk = markKeys();
    if (!REF[S.sup]) REF[S.sup] = 'MOD-' + s.code + '-' + String(1000 + Math.floor(Math.random() * 9000));
    var today = new Date().toLocaleDateString('fr-FR'), coupe = S.opts.coupe ? choice(s.options.filter(function (x) { return x.key === 'coupe'; })[0])[1] : '—';
    var name = s.label + (coupe !== '—' ? ' ' + coupe : '') + ' — ' + mt[1];
    var h = '<header><div><p class="eyebrow">Fiche technique · Brief client</p><h2>' + esc(name) + '</h2></div><p>Réf. <b>' + REF[S.sup] + '</b> · Version V1.0 · Statut Brouillon<br>' + today + ' · Origine : générée par le studio</p></header>';

    h += '<section><h4>1 · Identité du modèle</h4>' + kv([
      ['Référence modèle', REF[S.sup]], ['Nom du modèle', name], ['Client / marque', S.brand || 'À préciser'], ['Catégorie', s.label],
      ['Forme / coupe', coupe], ['Genre et gamme', g[1] + ' ' + ms.sizes[0] + (ms.sizes.length > 1 ? ' – ' + ms.sizes.slice(-1)[0] : '')],
      ['Taille du prototype', ms.ref], ['Version', 'V1.0'], ['Statut', 'Brouillon'], ['Date de création', today],
      ['Origine de la fiche', 'Générée (studio)'], ['Responsable atelier', 'À attribuer']
    ]) + '</section>';

    h += '<section><h4>2 · Croquis et emplacements</h4><div class="views2"><figure>' + garment('f', 'fiche', 'ff') + '<figcaption>Vue devant · ' + C.COLORS[S.cols[0]][0] + '</figcaption></figure><figure>' + garment('b', 'fiche', 'fb') + '<figcaption>Vue dos · ' + C.COLORS[S.cols[0]][0] + '</figcaption></figure></div>';
    if (S.cols.length > 1) h += '<div class="views2" style="grid-template-columns:repeat(' + Math.min(S.cols.length, 4) + ',1fr);margin-top:12px">' + S.cols.map(function (c, i) { return '<figure>' + garment('f', 'export', 'fc' + i, c) + '<figcaption>Coloris ' + C.COLORS[c][0] + '</figcaption></figure>'; }).join('') + '</div>';
    h += '<p class="note">Les numéros renvoient au tableau de marquage (bloc 7). Les vues définitives sont exportées en vectoriel pour le BAT.</p></section>';

    h += '<section><h4>Construction</h4>' + table(['Élément', 'Choix'], activeGroups().map(function (x) { return [x.label, choice(x)[1]]; })) + '</section>';

    h += '<section><h4>3 · Matières et coloris</h4>' + table(['Matière', 'Rôle', 'Composition', 'Grammage (g/m²)'],
      [[mt[1], 'Tissu principal', mt[2], mt[3]]].concat(trims())) +
      '<p class="note">Entretien : ' + C.CARE[mt[5]] + '. Toute matière sans échantillon physique validé bloque le passage au prototype.</p>' +
      '<div style="margin-top:12px">' + table(['Colorway', 'Tissu principal', 'Fil', 'Pantone / référence'], S.cols.map(function (c) {
        return ['<span class="sw-dot" style="background:' + hex(c) + '"></span>' + C.COLORS[c][0], mt[1] + ' ' + C.COLORS[c][0].toLowerCase(), 'Assorti', 'À définir'];
      })) + '</div></section>';

    h += '<section><h4>5 · Tableau de mesures (cm, produit fini)</h4><div class="scroll"><table><thead><tr><th>Indice</th><th>Point de mesure</th>' +
      ms.sizes.map(function (z) { return '<th class="n' + (z === ms.ref ? ' ref' : '') + '">' + z + '</th>'; }).join('') + '<th class="n">Tol. ±</th><th>Proto 1</th></tr></thead><tbody>' +
      ms.rows.map(function (r) { return '<tr><td>' + r.idx + '</td><td>' + r.label + '</td>' + r.values.map(function (v, i) { return '<td class="n' + (ms.sizes[i] === ms.ref ? ' ref' : '') + '">' + fmt1(v) + '</td>'; }).join('') + '<td class="n">' + fmt1(r.tol) + '</td><td></td></tr>'; }).join('') +
      '</tbody></table></div><p class="note">Modèle de base de l\'atelier, gradation indicative autour de la taille ' + ms.ref + ' ; elle est figée à l\'OK conformité. Un écart hors tolérance au prototype bloque la validation.</p></section>';

    h += '<section><h4>7 · Marquage et impression</h4>' + (mk.length ? table(['N°', 'Emplacement', 'Technique', 'Dimensions (l × h)', 'Position', 'Couleurs', 'Fichier', 'BAT'], mk.map(function (z, i) {
      var m = S.marks[z], b = box(z), t = C.TECHS[m.tech];
      var cols = m.tech === 'serigraphie' ? m.colors + ' Pantone à définir' : m.tech === 'broderie' ? 'Fils à référencer' : 'Quadri';
      if (m.motif && m.motif.kind === 'text') cols = m.motif.color.toUpperCase() + (m.tech === 'broderie' ? ' (fil)' : '');
      return [i + 1, zr(z).label, t.label, fmt1(b.cw) + ' × ' + fmt1(b.ch) + ' cm', zr(z).pos + (m.rot ? ', rotation ' + m.rot + '°' : ''), cols, m.motif ? esc(m.motif.name) : 'À fournir', 'À valider'];
    })) : '<p class="note">Pièce unie, sans marquage.</p>');
    var used = mk.map(function (z) { return S.marks[z].tech; }).filter(function (t, i, a) { return a.indexOf(t) === i; });
    if (used.length) h += '<div style="margin-top:12px">' + table(['Technique', 'Fichier attendu', 'Couleurs', 'Contraintes', 'Pré-presse'], used.map(function (k) { var t = C.TECHS[k]; return [t.label, t.file, t.colors, t.rules, t.prepress]; })) + '</div>';
    h += '<p class="note">Le BAT est une image du motif placé sur le croquis coloris, avec ses cotes. La série ne démarre pas sans BAT signé pour chaque emplacement.</p></section>';

    var brand = S.brand || 'votre marque', lab = [];
    if (s.griffeY) lab.push(['Étiquette de col (griffe)', 'Logo ' + esc(brand) + ' + taille', { tissee: 'Tissée, 4 × 2 cm, pliée', imprimee: 'Imprimée sur satin, 4 × 2 cm', transfert: 'Transfert thermocollé, sans étiquette' }[S.griffe], 'Milieu dos intérieur']);
    lab.push(['Étiquette composition et entretien', mt[2] + ', pictogrammes d\'entretien, pays de fabrication, taille', 'Imprimée satin, 3 × 6 cm', S.sup === 'tote' || S.sup === 'casquette' ? 'Couture intérieure' : 'Couture côté gauche, 10 cm au-dessus de l\'ourlet']);
    if (S.hangtag) lab.push(['Hang-tag', 'Nom du modèle, prix si demandé' + (S.ean ? ', code EAN' : ''), 'Carton 300 g, 5 × 9 cm, attache coton', S.sup === 'chemise' ? 'Boutonnière du col' : 'Étiquette de col']);
    if (S.ean) lab.push(['Code EAN', 'Un code par taille et coloris', 'Hang-tag et étiquette d\'emballage', '—']);
    lab.push(['Conditionnement', 'Pièce pliée, taille et coloris lisibles', BAGS.filter(function (b) { return b[0] === S.bag; })[0][1], '—']);
    lab.push(['Carton', 'Mono-référence ou assorti, 20 à 30 pièces, étiquette carton', 'Double cannelure', '—']);
    h += '<section><h4>8 · Étiquetage et packaging</h4>' + table(['Élément', 'Contenu', 'Format et matière', 'Position'], lab) + '<p class="note">Aucune mention de l\'atelier sur la pièce, les étiquettes, les colis ni les documents de livraison. Mentions obligatoires par pays de vente à confirmer par le client.</p></section>';

    var pcs = sizePieces(), list = sizeList();
    h += '<section><h4>Quantités</h4>' + table(['Taille'].concat(list).concat(['Total']), [['Pièces'].concat(pcs).concat([S.qty])]) + '<p class="note">' + S.cols.length + ' coloris, répartition par coloris à confirmer (' + SITE.moqColor + ' pièces minimum par coloris).</p></section>';

    h += '<section><h4>11 · Prix et délais</h4>' + table(['Palier', 'Prix indicatif / pièce HT', 'Total indicatif HT'], SITE.tiers.map(function (t) { var e = estimate(t); return [fmt(t) + ' pièces', '≈ ' + fmt(e.unit) + ' ' + SITE.currency, '≈ ' + fmt(e.total) + ' ' + SITE.currency]; })) +
      '<div style="margin-top:12px">' + kv([['Devis', SITE.delays.quote], ['Échantillon ou prototype', SITE.delays.sample + ' après réception des fichiers'], ['Série', SITE.delays.series + ' après OK prod et acompte'], ['Minimum de commande', SITE.moq + ' pièces, ' + SITE.moqColor + ' par coloris'], ['Échantillon', fmt(SITE.sampleFee) + ' ' + SITE.currency + ' HT, déduit de la commande']]) + '</div></section>';

    h += '<section><h4>9 · Jalons de validation</h4>' + table(['Jalon', 'Qui valide', 'Preuve', 'Date'], [
      ['OK proto', 'Client', 'Grille de finition signée, photos du prototype', ''],
      ['OK conformité', 'Client + atelier', 'Mesures du prototype dans les tolérances', ''],
      ['BAT marquage', 'Client', 'BAT signé par emplacement', ''],
      ['OK production', 'Client', 'Commande ferme, acompte, tailles et coloris figés', '']
    ]) + '<p class="note">Estimation indicative générée automatiquement à partir de vos choix ; le devis définitif est établi par l\'atelier.</p></section>';
    return h;
  }

  /* ---------- événements ---------- */
  $$('.views button').forEach(function (b) { b.onclick = function () { S.view = b.dataset.v; drawStage(); }; });
  $('scale').oninput = function () { var m = S.marks[S.active]; if (!m) return; m.scale = +this.value; update(); };
  $('rot').oninput = function () { var m = S.marks[S.active]; if (!m) return; m.rot = +this.value; update(); };
  $('flip').onchange = function () { var m = S.marks[S.active]; if (!m) return; m.flip = this.checked; update(); };
  $('center').onclick = function () { var m = S.marks[S.active]; if (!m) return; m.dx = m.dy = 0; update(); };
  $('clearMotif').onclick = function () { var m = S.marks[S.active]; if (!m) return; m.motif = null; $('txt').value = ''; update(); };
  $('rmZone').onclick = function () { if (!S.active) return; delete S.marks[S.active]; S.active = markKeys()[0] || null; if (S.active) S.view = zr(S.active).view; update(); };
  $('brand').oninput = function () { S.brand = this.value.trim(); drawStage(); summary(); };
  $('hangtag').onchange = function () { S.hangtag = this.checked; update(); };
  $('ean').onchange = function () { S.ean = this.checked; update(); };
  $$('.tabs button').forEach(function (b) {
    b.onclick = function () {
      $$('.tabs button').forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
      $$('.tabp').forEach(function (p) { p.classList.toggle('on', p.id === 'tab-' + b.dataset.tab); });
    };
  });

  /* Import : SVG nettoyé (scripts, handlers et liens externes retirés), images matricielles en data URL */
  function sanitize(svg) {
    var doc = new DOMParser().parseFromString(svg, 'image/svg+xml'), root = doc.documentElement;
    if (!root || root.nodeName !== 'svg') throw new Error('svg');
    $$('script,foreignObject,iframe,object,embed,animate,set', root).forEach(function (n) { n.remove(); });
    $$('*', root).forEach(function (n) {
      Array.prototype.slice.call(n.attributes).forEach(function (a) { if (/^on/i.test(a.name) || (/href/i.test(a.name) && !/^#/.test(a.value))) n.removeAttribute(a.name); });
    });
    if (!root.getAttribute('viewBox')) root.setAttribute('viewBox', '0 0 ' + (parseFloat(root.getAttribute('width')) || 400) + ' ' + (parseFloat(root.getAttribute('height')) || 400));
    root.removeAttribute('width'); root.removeAttribute('height');
    var vb = root.getAttribute('viewBox').split(/[\s,]+/).map(Number);
    return { svg: new XMLSerializer().serializeToString(root), ar: (vb[2] / vb[3]) || 1 };
  }
  function setMotif(mo) { var m = S.marks[S.active]; if (!m) return; m.motif = mo; m.dx = m.dy = 0; update(); }
  function readFile(f) {
    var st = $('st'); st.className = 'status'; st.textContent = '';
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) { st.className = 'status err'; st.textContent = 'Fichier trop lourd (8 Mo maximum pour l\'aperçu).'; return; }
    var r = new FileReader();
    if (f.type === 'image/svg+xml') {
      r.onload = function () {
        try { var o = sanitize(r.result); setMotif({ kind: 'img', name: f.name, url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(o.svg), ar: o.ar }); st.textContent = 'Fichier vectoriel importé : idéal pour la sérigraphie et la broderie.'; }
        catch (e) { st.className = 'status err'; st.textContent = 'Ce fichier SVG n\'a pas pu être lu.'; }
      };
      r.readAsText(f);
    } else if (/^image\//.test(f.type)) {
      r.onload = function () {
        var im = new Image();
        im.onload = function () {
          setMotif({ kind: 'img', name: f.name, url: r.result, ar: im.width / im.height });
          var m = S.marks[S.active], b = box(S.active), dpi = Math.round(im.width / (b.cw / 2.54));
          st.className = 'status' + (dpi < 300 ? ' err' : '');
          st.textContent = dpi < 300 ? 'Résolution ≈ ' + dpi + ' dpi à cette taille : prévoyez 300 dpi pour l\'impression.' : 'Résolution ≈ ' + dpi + ' dpi à cette taille.';
          if (m.tech === 'serigraphie') st.textContent += ' Pour la sérigraphie, un fichier vectoriel sera demandé.';
        };
        im.onerror = function () { st.className = 'status err'; st.textContent = 'Cette image n\'a pas pu être lue.'; };
        im.src = r.result;
      };
      r.readAsDataURL(f);
    } else { st.className = 'status err'; st.textContent = 'Format non pris en charge : SVG, PNG ou JPG.'; }
  }
  var drop = $('drop');
  $('file').onchange = function () { readFile(this.files[0]); this.value = ''; };
  ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); }); });
  ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('over'); }); });
  drop.addEventListener('drop', function (e) { readFile(e.dataTransfer.files[0]); });

  function textMotif() {
    var t = $('txt').value.trim(), m = S.marks[S.active]; if (!m) return;
    if (!t) { if (m.motif && m.motif.kind === 'text') { m.motif = null; update(); } return; }
    var keep = m.motif && m.motif.kind === 'text';
    m.motif = { kind: 'text', name: 'Texte « ' + t + ' »', text: t, font: $('font').value, color: $('txtc').value, ar: Math.max(1.2, Math.min(8, t.length * 0.55)) };
    if (!keep) { m.dx = m.dy = 0; }
    update();
  }
  $('txt').oninput = textMotif; $('font').onchange = textMotif; $('txtc').oninput = textMotif;

  /* Export PNG de l'aperçu */
  $('png').onclick = function () {
    var svg = garment(S.view, 'export', 'ex'), url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })), im = new Image();
    im.onload = function () {
      var c = document.createElement('canvas'); c.width = 1600; c.height = 1920;
      var x = c.getContext('2d'); x.fillStyle = '#E4E1DA'; x.fillRect(0, 0, 1600, 1920); x.drawImage(im, 0, 0, 1600, 1920); URL.revokeObjectURL(url);
      c.toBlob(function (b) {
        var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'apercu-' + S.sup + '-' + (S.view === 'b' ? 'dos' : 'devant') + '.png';
        document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
      }, 'image/png');
    };
    im.onerror = function () { URL.revokeObjectURL(url); };
    im.src = url;
  };

  /* Fiche technique */
  var dlg = $('fiche');
  $('openFiche').onclick = function () { $('fdoc').innerHTML = fiche(); if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); };
  $('closeFiche').onclick = function () { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); };
  dlg.addEventListener('click', function (e) { if (e.target === dlg && dlg.close) dlg.close(); });
  $('printFiche').onclick = function () { document.body.classList.add('print-fiche'); window.print(); };
  window.addEventListener('afterprint', function () { document.body.classList.remove('print-fiche'); });
  $('toDevis').onclick = function () { $('brief').value = brief(); };

  /* Démarrage : support depuis l'ancre (#chemise, #tshirt…) */
  function fromHash() { var k = location.hash.slice(1); if (C.SUPPORTS[k] && k !== S.sup) { setSupport(k); update(); } }
  window.addEventListener('hashchange', fromHash);
  var k0 = location.hash.slice(1);
  setSupport(C.SUPPORTS[k0] ? k0 : 'tshirt');
  update();
})();
