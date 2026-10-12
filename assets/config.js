/* =========================================================
   Configuration du site — à adapter avant mise en ligne.
   Le nom de marque est volontairement neutre : il suffit de
   changer `name` (et `tagline`) pour rebrander tout le site.
   ========================================================= */
window.SITE = {
  name: 'Atelier',
  tagline: 'Confection textile · marque blanche',
  email: 'contact@votre-domaine.ma',
  phone: '+212 6 00 00 00 00',
  address: 'Adresse de l\'atelier, Maroc',
  legal: 'Raison sociale',
  /* URL d'un service de formulaire (Formspree, Getform, backend maison…).
     Vide : les demandes s'ouvrent dans le client email du visiteur. */
  formEndpoint: '',

  /* Paramètres atelier (bloc 11 de la fiche) — valeurs indicatives à fixer */
  moq: 500,            // pièces minimum par modèle
  moqColor: 100,       // pièces minimum par coloris
  delays: {
    quote: '48 h',
    sample: '10 à 15 jours',
    series: '4 à 6 semaines'
  },
  tiers: [500, 1000, 2500, 5000],
  tierFactor: { 500: 1, 1000: 0.93, 2500: 0.86, 5000: 0.8 },
  colorSurcharge: 0.02, // par coloris supplémentaire
  sampleFee: 900,       // MAD HT, déduit de la commande
  currency: 'MAD'
};
