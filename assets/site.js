/* Comportements communs : marque, coordonnées, formulaires de contact. */
(function () {
  var S = window.SITE || {};
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* Marque et coordonnées depuis config.js */
  $$('[data-brand]').forEach(function (el) { el.textContent = S.name; });
  $$('[data-tagline]').forEach(function (el) { el.textContent = S.tagline; });
  $$('[data-legal]').forEach(function (el) { el.textContent = S.legal; });
  $$('[data-email]').forEach(function (el) { el.textContent = S.email; if (el.tagName === 'A') el.href = 'mailto:' + S.email; });
  $$('[data-phone]').forEach(function (el) { el.textContent = S.phone; if (el.tagName === 'A') el.href = 'tel:' + S.phone.replace(/\s/g, ''); });
  $$('[data-address]').forEach(function (el) { el.textContent = S.address; });
  $$('[data-moq]').forEach(function (el) { el.textContent = S.moq; });
  $$('[data-moq-color]').forEach(function (el) { el.textContent = S.moqColor; });
  $$('[data-delay]').forEach(function (el) { el.textContent = S.delays[el.getAttribute('data-delay')]; });
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  if (S.name) document.title = document.title.replace('{brand}', S.name);

  /* Formulaires de demande */
  $$('form[data-lead]').forEach(function (f) {
    var ok = f.querySelector('.ok'), err = f.querySelector('.err');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (err) err.textContent = '';
      if (!f.nom.value.trim()) { f.nom.focus(); if (err) err.textContent = 'Indiquez votre nom.'; return; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.value.trim())) { f.email.focus(); if (err) err.textContent = 'Indiquez une adresse email valide.'; return; }
      var btn = f.querySelector('button[type=submit]');
      var done = function () { if (ok) ok.style.display = 'block'; btn.disabled = true; };
      if (S.formEndpoint) {
        btn.disabled = true;
        fetch(S.formEndpoint, { method: 'POST', body: new FormData(f), headers: { Accept: 'application/json' } })
          .then(function (r) { if (!r.ok) throw new Error(r.status); done(); })
          .catch(function () { btn.disabled = false; if (err) err.textContent = 'L\'envoi a échoué. Écrivez-nous directement à ' + S.email + '.'; });
        return;
      }
      var lines = [];
      $$('input,select,textarea', f).forEach(function (i) {
        if (!i.name || i.type === 'file' || (i.type === 'radio' && !i.checked)) return;
        var lab = i.getAttribute('data-label') || i.name;
        if (i.value.trim()) lines.push(lab + ' : ' + i.value.trim());
      });
      var subject = 'Demande de devis — ' + (f.societe && f.societe.value.trim() || f.nom.value.trim());
      window.location.href = 'mailto:' + S.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
      done();
    });
  });
})();
