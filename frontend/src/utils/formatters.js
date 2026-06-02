// Formate en FCFA avec séparateur milliers
export function formatFCFA(amount) {
  if (!amount && amount !== 0) return '—';
  return new Intl.NumberFormat('fr-SN', {
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
}

// Formate une date en français
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(dateStr));
}

// Calcule le montant total d'une réservation
export function calcMontant(logement, dateDebut, dateFin, typeSejour) {
  if (!dateDebut || !dateFin || !logement) return 0;
  const debut  = new Date(dateDebut);
  const fin    = new Date(dateFin);
  const jours  = Math.max(1, Math.round((fin - debut) / (1000 * 60 * 60 * 24)));

  if (typeSejour === 'courte_duree') {
    return jours * (logement.prix_par_nuit || 0);
  }
  const mois = Math.max(1, Math.round(jours / 30 * 10) / 10);
  return mois * (logement.prix_par_mois || 0);
}

// Badge statut réservation
export function statutBadge(statut) {
  const map = {
    en_attente: { label: 'En attente',  cls: 'badge-attente' },
    confirmee:  { label: 'Confirmée',   cls: 'badge-confirme' },
    annulee:    { label: 'Annulée',     cls: 'badge-annule' },
    terminee:   { label: 'Terminée',    cls: 'badge-termine' },
  };
  return map[statut] ?? { label: statut, cls: 'badge-attente' };
}

// Étoiles
export function renderStars(note, max = 5) {
  const n = Math.round(parseFloat(note) * 2) / 2;
  return Array.from({ length: max }, (_, i) => {
    if (i + 1 <= n)        return 'full';
    if (i + 0.5 === n)     return 'half';
    return 'empty';
  });
}

// Label type logement
export function typeLabel(type) {
  const map = {
    appartement: 'Appartement', maison: 'Maison', chambre: 'Chambre',
    villa: 'Villa', studio: 'Studio',
  };
  return map[type] ?? type;
}

export function equipementLabel(eq) {
  const map = {
    wifi: 'WiFi', climatisation: 'Climatisation', eau_chaude: 'Eau chaude',
    parking: 'Parking', piscine: 'Piscine', jardin: 'Jardin',
    securite: 'Sécurité', gardien: 'Gardien', plage: 'Accès plage',
    plage_privee: 'Plage privée', ventilateur: 'Ventilateur',
    terrasse: 'Terrasse', cour: 'Cour intérieure', vue_fleuve: 'Vue fleuve',
    patrimoine: 'Patrimoine UNESCO',
  };
  return map[eq] ?? eq;
}
