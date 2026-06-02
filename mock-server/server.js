const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors());
app.use(express.json());

// ── Données en mémoire ──────────────────────────────────────────
let users = [
  { id:1, nom:'Admin',    prenom:'LocaMaison', email:'admin@locamaison.sn',      password:'password', role:'admin',        is_verified:true,  is_active:true, telephone:'+221771234560', avatar:null, created_at:'2024-01-01' },
  { id:2, nom:'Diallo',   prenom:'Oumar',      email:'oumar.diallo@test.sn',      password:'password', role:'proprietaire', is_verified:true,  is_active:true, telephone:'+221771234561', avatar:null, created_at:'2024-01-02' },
  { id:3, nom:'Ndiaye',   prenom:'Fatou',      email:'fatou.ndiaye@test.sn',      password:'password', role:'proprietaire', is_verified:true,  is_active:true, telephone:'+221771234562', avatar:null, created_at:'2024-01-03' },
  { id:4, nom:'Sow',      prenom:'Ibrahima',   email:'ibrahima.sow@test.sn',      password:'password', role:'locataire',    is_verified:false, is_active:true, telephone:'+221771234563', avatar:null, created_at:'2024-01-04' },
  { id:5, nom:'Ba',       prenom:'Aminata',    email:'aminata.ba@test.sn',        password:'password', role:'locataire',    is_verified:false, is_active:true, telephone:'+221771234564', avatar:null, created_at:'2024-01-05' },
  { id:6, nom:'Fall',     prenom:'Mamadou',    email:'mamadou.fall@test.sn',      password:'password', role:'locataire',    is_verified:false, is_active:true, telephone:'+221771234565', avatar:null, created_at:'2024-01-06' },
];
let nextUserId = 7;

const regions = [
  {id:1,nom:'Dakar'},{id:2,nom:'Thiès'},{id:3,nom:'Saint-Louis'},{id:4,nom:'Ziguinchor'},
  {id:5,nom:'Kaolack'},{id:6,nom:'Diourbel'},{id:7,nom:'Louga'},{id:8,nom:'Fatick'},
  {id:9,nom:'Kolda'},{id:10,nom:'Matam'},{id:11,nom:'Tambacounda'},{id:12,nom:'Kaffrine'},
  {id:13,nom:'Sédhiou'},{id:14,nom:'Kédougou'},
];

const villes = [
  {id:1,region_id:1,nom:'Dakar'},{id:2,region_id:1,nom:'Pikine'},{id:3,region_id:1,nom:'Guédiawaye'},{id:4,region_id:1,nom:'Rufisque'},{id:5,region_id:1,nom:'Bargny'},
  {id:6,region_id:2,nom:'Thiès'},{id:7,region_id:2,nom:'Mbour'},{id:8,region_id:2,nom:'Tivaouane'},{id:9,region_id:2,nom:'Joal-Fadiouth'},{id:10,region_id:2,nom:'Khombole'},
  {id:11,region_id:3,nom:'Saint-Louis'},{id:12,region_id:3,nom:'Richard-Toll'},{id:13,region_id:3,nom:'Podor'},{id:14,region_id:3,nom:'Dagana'},{id:15,region_id:3,nom:'Ndioum'},
  {id:16,region_id:4,nom:'Ziguinchor'},{id:17,region_id:4,nom:'Bignona'},{id:18,region_id:4,nom:'Oussouye'},{id:19,region_id:4,nom:'Kafountine'},{id:20,region_id:4,nom:'Cap Skirring'},
  {id:21,region_id:5,nom:'Kaolack'},{id:22,region_id:5,nom:'Nioro du Rip'},{id:23,region_id:5,nom:'Guinguinéo'},{id:24,region_id:5,nom:'Koungheul'},{id:25,region_id:5,nom:'Ndoffane'},
  {id:26,region_id:6,nom:'Diourbel'},{id:27,region_id:6,nom:'Mbacké'},{id:28,region_id:6,nom:'Touba'},{id:29,region_id:6,nom:'Bambey'},{id:30,region_id:6,nom:'Gossas'},
  {id:31,region_id:7,nom:'Louga'},{id:32,region_id:7,nom:'Linguère'},{id:33,region_id:7,nom:'Kébémer'},{id:34,region_id:7,nom:'Dahra'},{id:35,region_id:7,nom:'Coki'},
  {id:36,region_id:8,nom:'Fatick'},{id:37,region_id:8,nom:'Foundiougne'},{id:38,region_id:8,nom:'Gossas-Fatick'},{id:39,region_id:8,nom:'Passy'},{id:40,region_id:8,nom:'Sokone'},
  {id:41,region_id:9,nom:'Kolda'},{id:42,region_id:9,nom:'Vélingara'},{id:43,region_id:9,nom:'Médina Yoro Foulah'},{id:44,region_id:9,nom:'Dabo'},{id:45,region_id:9,nom:'Pata'},
  {id:46,region_id:10,nom:'Matam'},{id:47,region_id:10,nom:'Kanel'},{id:48,region_id:10,nom:'Ourossogui'},{id:49,region_id:10,nom:'Ranérou'},{id:50,region_id:10,nom:'Thilogne'},
  {id:51,region_id:11,nom:'Tambacounda'},{id:52,region_id:11,nom:'Bakel'},{id:53,region_id:11,nom:'Goudiry'},{id:54,region_id:11,nom:'Kidira'},{id:55,region_id:11,nom:'Koumpentoum'},
  {id:56,region_id:12,nom:'Kaffrine'},{id:57,region_id:12,nom:'Birkelane'},{id:58,region_id:12,nom:'Koungheul-Kaffrine'},{id:59,region_id:12,nom:'Malem-Hodar'},{id:60,region_id:12,nom:'Nganda'},
  {id:61,region_id:13,nom:'Sédhiou'},{id:62,region_id:13,nom:'Bounkiling'},{id:63,region_id:13,nom:'Goudomp'},{id:64,region_id:13,nom:'Marsassoum'},{id:65,region_id:13,nom:'Samine'},
  {id:66,region_id:14,nom:'Kédougou'},{id:67,region_id:14,nom:'Saraya'},{id:68,region_id:14,nom:'Salémata'},{id:69,region_id:14,nom:'Fongolimbi'},{id:70,region_id:14,nom:'Tomboronkoto'},
];

const quartiers = [
  {id:1,ville_id:1,nom:'Plateau'},{id:2,ville_id:1,nom:'Médina'},{id:3,ville_id:1,nom:'Fann - Point E'},
  {id:4,ville_id:1,nom:'Mermoz'},{id:5,ville_id:1,nom:'Sacré-Cœur'},{id:6,ville_id:1,nom:'Les Almadies'},
  {id:7,ville_id:1,nom:'Ouakam'},{id:8,ville_id:1,nom:'Yoff'},{id:9,ville_id:1,nom:'Parcelles Assainies'},
  {id:10,ville_id:1,nom:'Ngor'},{id:11,ville_id:1,nom:'Liberté'},{id:12,ville_id:1,nom:'Sicap'},
  {id:13,ville_id:6,nom:'Centre-ville'},{id:14,ville_id:6,nom:'Nguinth'},{id:15,ville_id:6,nom:'Thialy'},
  {id:16,ville_id:6,nom:'Randoulène'},{id:17,ville_id:6,nom:'Tocky Gare'},{id:18,ville_id:6,nom:'Keur Issa'},
  {id:19,ville_id:7,nom:'Centre'},{id:20,ville_id:7,nom:'Saly Portudal'},{id:21,ville_id:7,nom:'Tefess'},
  {id:22,ville_id:11,nom:'Île de Saint-Louis'},{id:23,ville_id:11,nom:'Sor'},{id:24,ville_id:11,nom:'Langue de Barbarie'},
];

let logements = [
  { id:1,  proprietaire_id:2, titre:'Bel appartement F3 aux Almadies', description:'Superbe appartement meublé avec vue mer, proche plage des Almadies.', type:'appartement', adresse:'Rue des Jasmins, Les Almadies', quartier_id:6, ville_id:1, region_id:1, prix_par_nuit:35000, prix_par_mois:450000, nb_chambres:2, nb_salles_bain:1, superficie_m2:70, meuble:true, statut:'actif', latitude:14.74160, longitude:-17.50480, equipements:['wifi','climatisation','eau_chaude','parking','securite'], note_moyenne:5.0, nb_avis:1, photo_principale:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop', proprio_nom:'Diallo', proprio_prenom:'Oumar', proprio_telephone:'+221771234561', ville_nom:'Dakar', region_nom:'Dakar', quartier_nom:'Les Almadies', is_verified:true },
  { id:2,  proprietaire_id:2, titre:'Chambre climatisée au Plateau', description:'Chambre bien équipée dans résidence sécurisée, quartier central.', type:'chambre', adresse:'Avenue Roume, Plateau', quartier_id:1, ville_id:1, region_id:1, prix_par_nuit:15000, prix_par_mois:180000, nb_chambres:1, nb_salles_bain:1, superficie_m2:20, meuble:true, statut:'actif', latitude:14.69185, longitude:-17.44148, equipements:['wifi','climatisation','eau_chaude'], note_moyenne:4.0, nb_avis:1, photo_principale:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop', proprio_nom:'Diallo', proprio_prenom:'Oumar', proprio_telephone:'+221771234561', ville_nom:'Dakar', region_nom:'Dakar', quartier_nom:'Plateau', is_verified:true },
  { id:3,  proprietaire_id:3, titre:'Villa 4 chambres Mermoz', description:'Grande villa avec jardin et piscine, idéale pour famille.', type:'villa', adresse:'Cité Mermoz Extension', quartier_id:4, ville_id:1, region_id:1, prix_par_nuit:80000, prix_par_mois:950000, nb_chambres:4, nb_salles_bain:3, superficie_m2:250, meuble:true, statut:'actif', latitude:14.72441, longitude:-17.47851, equipements:['wifi','climatisation','eau_chaude','parking','piscine','jardin','securite'], note_moyenne:5.0, nb_avis:1, photo_principale:'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop', proprio_nom:'Ndiaye', proprio_prenom:'Fatou', proprio_telephone:'+221771234562', ville_nom:'Dakar', region_nom:'Dakar', quartier_nom:'Mermoz', is_verified:true },
  { id:4,  proprietaire_id:2, titre:'Studio moderne centre Thiès', description:'Studio neuf tout équipé, proche transports et marchés.', type:'studio', adresse:'Avenue Léopold Sédar Senghor', quartier_id:13, ville_id:6, region_id:2, prix_par_nuit:10000, prix_par_mois:120000, nb_chambres:1, nb_salles_bain:1, superficie_m2:25, meuble:true, statut:'actif', latitude:14.79122, longitude:-16.92610, equipements:['wifi','climatisation','eau_chaude'], note_moyenne:4.0, nb_avis:1, photo_principale:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop', proprio_nom:'Diallo', proprio_prenom:'Oumar', proprio_telephone:'+221771234561', ville_nom:'Thiès', region_nom:'Thiès', quartier_nom:'Centre-ville', is_verified:false },
  { id:5,  proprietaire_id:3, titre:'Appartement F2 Thiès avec terrasse', description:'Appartement calme avec grande terrasse, lumineux.', type:'appartement', adresse:'Quartier Thialy', quartier_id:15, ville_id:6, region_id:2, prix_par_nuit:18000, prix_par_mois:220000, nb_chambres:2, nb_salles_bain:1, superficie_m2:55, meuble:true, statut:'actif', latitude:14.78945, longitude:-16.93150, equipements:['wifi','ventilateur','eau_chaude','terrasse'], note_moyenne:0, nb_avis:0, photo_principale:'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop', proprio_nom:'Ndiaye', proprio_prenom:'Fatou', proprio_telephone:'+221771234562', ville_nom:'Thiès', region_nom:'Thiès', quartier_nom:'Thialy', is_verified:false },
  { id:6,  proprietaire_id:2, titre:'Maison familiale 3 chambres Thiès', description:'Grande maison avec cour intérieure, idéale pour famille.', type:'maison', adresse:'Randoulène Nord', quartier_id:16, ville_id:6, region_id:2, prix_par_nuit:20000, prix_par_mois:280000, nb_chambres:3, nb_salles_bain:2, superficie_m2:100, meuble:false, statut:'actif', latitude:14.79500, longitude:-16.91800, equipements:['eau_chaude','parking','cour'], note_moyenne:0, nb_avis:0, photo_principale:'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&auto=format&fit=crop', proprio_nom:'Diallo', proprio_prenom:'Oumar', proprio_telephone:'+221771234561', ville_nom:'Thiès', region_nom:'Thiès', quartier_nom:'Randoulène', is_verified:false },
  { id:7,  proprietaire_id:3, titre:'Chambre coloniale île de Saint-Louis', description:'Charme historique dans le quartier classé UNESCO.', type:'chambre', adresse:'Île de Saint-Louis', quartier_id:22, ville_id:11, region_id:3, prix_par_nuit:20000, prix_par_mois:250000, nb_chambres:1, nb_salles_bain:1, superficie_m2:30, meuble:true, statut:'actif', latitude:16.02938, longitude:-16.49967, equipements:['wifi','climatisation','eau_chaude'], note_moyenne:0, nb_avis:0, photo_principale:'https://images.unsplash.com/photo-1582582621959-48d27397dc69?w=800&auto=format&fit=crop', proprio_nom:'Ndiaye', proprio_prenom:'Fatou', proprio_telephone:'+221771234562', ville_nom:'Saint-Louis', region_nom:'Saint-Louis', quartier_nom:'Île de Saint-Louis', is_verified:true },
  { id:8,  proprietaire_id:2, titre:'Appartement vue fleuve Saint-Louis', description:'Vue panoramique sur le fleuve Sénégal.', type:'appartement', adresse:'Sor, rue du Fleuve', quartier_id:23, ville_id:11, region_id:3, prix_par_nuit:25000, prix_par_mois:320000, nb_chambres:2, nb_salles_bain:1, superficie_m2:60, meuble:true, statut:'actif', latitude:16.03800, longitude:-16.50200, equipements:['wifi','climatisation','eau_chaude','parking'], note_moyenne:0, nb_avis:0, photo_principale:'https://images.unsplash.com/photo-1599427303058-f04cbcf4756f?w=800&auto=format&fit=crop', proprio_nom:'Diallo', proprio_prenom:'Oumar', proprio_telephone:'+221771234561', ville_nom:'Saint-Louis', region_nom:'Saint-Louis', quartier_nom:'Sor', is_verified:false },
  { id:9,  proprietaire_id:3, titre:'Bungalow Casamance Ziguinchor', description:'Bungalow typique entouré de verdure.', type:'maison', adresse:'Quartier Lyndiane', quartier_id:null, ville_id:16, region_id:4, prix_par_nuit:15000, prix_par_mois:180000, nb_chambres:2, nb_salles_bain:1, superficie_m2:60, meuble:false, statut:'actif', latitude:12.55870, longitude:-16.27275, equipements:['wifi','ventilateur','eau_chaude','jardin'], note_moyenne:0, nb_avis:0, photo_principale:'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop', proprio_nom:'Ndiaye', proprio_prenom:'Fatou', proprio_telephone:'+221771234562', ville_nom:'Ziguinchor', region_nom:'Ziguinchor', quartier_nom:null, is_verified:false },
  { id:10, proprietaire_id:3, titre:'Villa balnéaire Cap Skirring', description:'Villa pieds dans l\'eau, accès direct plage privée.', type:'villa', adresse:'Route de la plage', quartier_id:null, ville_id:20, region_id:4, prix_par_nuit:60000, prix_par_mois:720000, nb_chambres:3, nb_salles_bain:2, superficie_m2:180, meuble:true, statut:'actif', latitude:12.39500, longitude:-16.74600, equipements:['wifi','climatisation','eau_chaude','parking','piscine','plage'], note_moyenne:0, nb_avis:0, photo_principale:'https://images.unsplash.com/photo-1615880484746-a134be9a6ecf?w=800&auto=format&fit=crop', proprio_nom:'Ndiaye', proprio_prenom:'Fatou', proprio_telephone:'+221771234562', ville_nom:'Cap Skirring', region_nom:'Ziguinchor', quartier_nom:null, is_verified:true },
  { id:11, proprietaire_id:2, titre:'Studio Saly bord de mer', description:'Studio climatisé à 200m de la plage de Saly.', type:'studio', adresse:'Saly Portudal, résidence Le Baobab', quartier_id:20, ville_id:7, region_id:2, prix_par_nuit:20000, prix_par_mois:240000, nb_chambres:1, nb_salles_bain:1, superficie_m2:30, meuble:true, statut:'actif', latitude:14.45123, longitude:-16.97240, equipements:['wifi','climatisation','eau_chaude','piscine','plage'], note_moyenne:0, nb_avis:0, photo_principale:'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop', proprio_nom:'Diallo', proprio_prenom:'Oumar', proprio_telephone:'+221771234561', ville_nom:'Mbour', region_nom:'Thiès', quartier_nom:'Saly Portudal', is_verified:false },
];
let nextLogementId = 12;

let reservations = [
  { id:1, locataire_id:4, logement_id:1, date_debut:'2026-04-01', date_fin:'2026-04-30', type_sejour:'longue_duree', montant_total:450000, statut:'terminee', mode_paiement:'wave', ref_paiement:'WAVE-TEST-0001', logement_titre:'Bel appartement F3 aux Almadies', ville_nom:'Dakar', photo_logement:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400', proprietaire_id:2, locataire_nom:'Sow', locataire_prenom:'Ibrahima', locataire_tel:'+221771234563', a_laisse_avis:true, created_at:'2026-03-25' },
  { id:2, locataire_id:5, logement_id:2, date_debut:'2026-05-01', date_fin:'2026-05-31', type_sejour:'longue_duree', montant_total:180000, statut:'confirmee', mode_paiement:'orange_money', ref_paiement:'OM-TEST-0001', logement_titre:'Chambre climatisée au Plateau', ville_nom:'Dakar', photo_logement:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400', proprietaire_id:2, locataire_nom:'Ba', locataire_prenom:'Aminata', locataire_tel:'+221771234564', a_laisse_avis:false, created_at:'2026-04-20' },
  { id:3, locataire_id:6, logement_id:3, date_debut:'2026-06-10', date_fin:'2026-06-17', type_sejour:'courte_duree', montant_total:560000, statut:'confirmee', mode_paiement:'wave', ref_paiement:'WAVE-TEST-0002', logement_titre:'Villa 4 chambres Mermoz', ville_nom:'Dakar', photo_logement:'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400', proprietaire_id:3, locataire_nom:'Fall', locataire_prenom:'Mamadou', locataire_tel:'+221771234565', a_laisse_avis:false, created_at:'2026-06-01' },
];
let nextResId = 4;

let avis = [
  { id:1, locataire_id:4, logement_id:1, reservation_id:1, note:5, commentaire:'Excellent appartement, très bien situé aux Almadies !', nom:'Sow', prenom:'Ibrahima', logement_titre:'Bel appartement F3 aux Almadies', created_at:'2026-05-02' },
];
let nextAvisId = 2;

let messages = [
  { id:1, expediteur_id:4, destinataire_id:2, reservation_id:1, contenu:'Bonjour, est-ce que le logement est disponible en juillet ?', lu:true, nom:'Sow', prenom:'Ibrahima', created_at:'2026-05-10T10:00:00' },
  { id:2, expediteur_id:2, destinataire_id:4, reservation_id:1, contenu:'Oui bien sûr ! Je serais ravi de vous accueillir.', lu:true, nom:'Diallo', prenom:'Oumar', created_at:'2026-05-10T10:30:00' },
];
let nextMsgId = 3;

// ── Helpers ────────────────────────────────────────────────────
function makeToken(user) {
  return Buffer.from(JSON.stringify({ id: user.id, email: user.email, role: user.role, exp: Date.now() + 7*24*3600*1000 })).toString('base64');
}
function getUser(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return null;
  try {
    const payload = JSON.parse(Buffer.from(auth.slice(7), 'base64').toString());
    if (payload.exp < Date.now()) return null;
    return users.find(u => u.id === payload.id) || null;
  } catch { return null; }
}
function ok(res, data, message = '', code = 200) {
  res.status(code).json({ success: true, data, message });
}
function err(res, message, code = 400) {
  res.status(code).json({ success: false, data: null, message });
}
function paginate(res, items, page, limit) {
  const total = items.length;
  const slice = items.slice((page-1)*limit, page*limit);
  res.json({ success:true, data:slice, pagination:{ total, page, limit, pages: Math.ceil(total/limit) } });
}
function safe(u) {
  const { password, ...rest } = u;
  return rest;
}

// ═══════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════
app.post('/api/auth/register', (req, res) => {
  const { nom, prenom, email, password, role, telephone } = req.body;
  if (!nom || !prenom || !email || !password || !role) return err(res, 'Tous les champs sont requis');
  if (!['locataire','proprietaire'].includes(role)) return err(res, 'Rôle invalide');
  if (users.find(u => u.email === email)) return err(res, 'Cet email est déjà utilisé', 409);
  if (password.length < 6) return err(res, 'Mot de passe trop court (min. 6 caractères)');

  const user = { id: nextUserId++, nom, prenom, email, password, role, telephone: telephone||null, avatar:null, piece_identite_url:null, is_verified:false, is_active:true, created_at: new Date().toISOString() };
  users.push(user);
  ok(res, { token: makeToken(user), user: safe(user) }, 'Inscription réussie', 201);
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return err(res, 'Email et mot de passe requis');
  const user = users.find(u => u.email === email && u.password === password && u.is_active);
  if (!user) return err(res, 'Email ou mot de passe incorrect', 401);
  ok(res, { token: makeToken(user), user: safe(user) });
});

app.get('/api/auth/me', (req, res) => {
  const user = getUser(req);
  if (!user) return err(res, 'Non authentifié', 401);
  ok(res, safe(user));
});

app.put('/api/auth/me', (req, res) => {
  const user = getUser(req);
  if (!user) return err(res, 'Non authentifié', 401);
  const { nom, prenom, telephone } = req.body;
  if (nom) user.nom = nom;
  if (prenom) user.prenom = prenom;
  if (telephone) user.telephone = telephone;
  ok(res, safe(user), 'Profil mis à jour');
});

// ═══════════════════════════════════════════════
// GÉOGRAPHIE
// ═══════════════════════════════════════════════
app.get('/api/regions', (_, res) => ok(res, regions));

app.get('/api/villes', (req, res) => {
  const rid = parseInt(req.query.region_id);
  ok(res, rid ? villes.filter(v => v.region_id === rid) : villes);
});

app.get('/api/quartiers', (req, res) => {
  const vid = parseInt(req.query.ville_id);
  ok(res, vid ? quartiers.filter(q => q.ville_id === vid) : quartiers);
});

// ═══════════════════════════════════════════════
// LOGEMENTS
// ═══════════════════════════════════════════════
app.get('/api/logements', (req, res) => {
  let list = logements.filter(l => l.statut === 'actif');
  const { region_id, ville_id, quartier_id, type, meuble, nb_chambres, prix_min, prix_max, type_sejour, sort } = req.query;

  if (region_id)   list = list.filter(l => l.region_id   == region_id);
  if (ville_id)    list = list.filter(l => l.ville_id    == ville_id);
  if (quartier_id) list = list.filter(l => l.quartier_id == quartier_id);
  if (type)        list = list.filter(l => l.type        === type);
  if (meuble !== undefined && meuble !== '') list = list.filter(l => !!l.meuble === (meuble === '1'));
  if (nb_chambres) {
    const n = parseInt(nb_chambres);
    list = list.filter(l => n >= 4 ? l.nb_chambres >= 4 : l.nb_chambres === n);
  }
  const priceKey = type_sejour === 'courte_duree' ? 'prix_par_nuit' : 'prix_par_mois';
  if (prix_min) list = list.filter(l => (l[priceKey]||0) >= parseFloat(prix_min));
  if (prix_max) list = list.filter(l => (l[priceKey]||0) <= parseFloat(prix_max));

  const sortMap = {
    prix_asc:  (a,b) => (a[priceKey]||0) - (b[priceKey]||0),
    prix_desc: (a,b) => (b[priceKey]||0) - (a[priceKey]||0),
    note:      (a,b) => b.note_moyenne - a.note_moyenne,
    recent:    (a,b) => b.id - a.id,
  };
  list = [...list].sort(sortMap[sort] || sortMap.recent);

  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 10;
  paginate(res, list, page, limit);
});

app.get('/api/logements/:id', (req, res) => {
  const l = logements.find(l => l.id === parseInt(req.params.id));
  if (!l) return err(res, 'Logement introuvable', 404);
  const logAvis = avis.filter(a => a.logement_id === l.id);
  ok(res, {
    ...l,
    photos: [{ id:1, logement_id:l.id, url: l.photo_principale, is_principale:true }],
    avis:   logAvis,
    nb_reservations_proprio: reservations.filter(r => r.proprietaire_id === l.proprietaire_id).length,
  });
});

app.post('/api/logements', (req, res) => {
  const user = getUser(req);
  if (!user || user.role !== 'proprietaire') return err(res, 'Accès refusé', 403);
  const { titre, type, ville_id, region_id } = req.body;
  if (!titre || !type || !ville_id || !region_id) return err(res, 'Champs requis manquants');
  const ville = villes.find(v => v.id == ville_id);
  const region = regions.find(r => r.id == region_id);
  const newL = {
    id: nextLogementId++, proprietaire_id: user.id, statut: 'en_attente',
    note_moyenne: 0, nb_avis: 0,
    ville_nom: ville?.nom || '', region_nom: region?.nom || '',
    proprio_nom: user.nom, proprio_prenom: user.prenom, proprio_telephone: user.telephone,
    photo_principale: null,
    ...req.body,
    equipements: req.body.equipements || [],
    created_at: new Date().toISOString(),
  };
  logements.push(newL);
  ok(res, newL, 'Annonce créée — en attente de validation', 201);
});

app.put('/api/logements/:id', (req, res) => {
  const user = getUser(req);
  if (!user) return err(res, 'Non authentifié', 401);
  const idx = logements.findIndex(l => l.id === parseInt(req.params.id));
  if (idx < 0) return err(res, 'Logement introuvable', 404);
  if (logements[idx].proprietaire_id !== user.id && user.role !== 'admin') return err(res, 'Accès refusé', 403);
  logements[idx] = { ...logements[idx], ...req.body };
  ok(res, logements[idx], 'Annonce mise à jour');
});

app.delete('/api/logements/:id', (req, res) => {
  const user = getUser(req);
  if (!user) return err(res, 'Non authentifié', 401);
  const idx = logements.findIndex(l => l.id === parseInt(req.params.id));
  if (idx < 0) return err(res, 'Logement introuvable', 404);
  logements.splice(idx, 1);
  ok(res, null, 'Annonce supprimée');
});

app.post('/api/logements/:id/photos', (req, res) => {
  ok(res, [{ id: Date.now(), url: '/uploads/photo_mock.jpg', is_principale: true }], 'Photos téléchargées', 201);
});

// ═══════════════════════════════════════════════
// PROPRIÉTAIRE
// ═══════════════════════════════════════════════
app.get('/api/proprietaire/dashboard', (req, res) => {
  const user = getUser(req);
  if (!user) return err(res, 'Non authentifié', 401);
  const mes = logements.filter(l => l.proprietaire_id === user.id);
  const mesRes = reservations.filter(r => mes.some(l => l.id === r.logement_id));
  ok(res, {
    total_annonces: mes.length,
    annonces_actives: mes.filter(l => l.statut === 'actif').length,
    en_attente: mes.filter(l => l.statut === 'en_attente').length,
    reservations_actives: mesRes.filter(r => r.statut === 'confirmee').length,
    revenus_mois: mesRes.filter(r => r.statut === 'confirmee').reduce((s,r) => s + r.montant_total, 0),
    note_moyenne: mes.reduce((s,l) => s + (l.note_moyenne||0), 0) / (mes.length || 1),
  });
});

app.get('/api/proprietaire/annonces', (req, res) => {
  const user = getUser(req);
  if (!user) return err(res, 'Non authentifié', 401);
  ok(res, logements.filter(l => l.proprietaire_id === user.id));
});

app.get('/api/proprietaire/reservations', (req, res) => {
  const user = getUser(req);
  if (!user) return err(res, 'Non authentifié', 401);
  const mes = logements.filter(l => l.proprietaire_id === user.id).map(l => l.id);
  ok(res, reservations.filter(r => mes.includes(r.logement_id)));
});

app.get('/api/proprietaire/messages', (req, res) => {
  const user = getUser(req);
  if (!user) return err(res, 'Non authentifié', 401);
  const convMap = {};
  messages.filter(m => m.expediteur_id === user.id || m.destinataire_id === user.id).forEach(m => {
    const otherId = m.expediteur_id === user.id ? m.destinataire_id : m.expediteur_id;
    convMap[otherId] = m;
  });
  ok(res, Object.entries(convMap).map(([interlocuteur_id, m]) => {
    const other = users.find(u => u.id === parseInt(interlocuteur_id));
    return { interlocuteur_id: parseInt(interlocuteur_id), nom: other?.nom, prenom: other?.prenom, avatar: other?.avatar, dernier_message: m.contenu, created_at: m.created_at, non_lus: 0 };
  }));
});

// ═══════════════════════════════════════════════
// LOCATAIRE
// ═══════════════════════════════════════════════
app.get('/api/locataire/reservations', (req, res) => {
  const user = getUser(req);
  if (!user) return err(res, 'Non authentifié', 401);
  ok(res, reservations.filter(r => r.locataire_id === user.id));
});

app.get('/api/locataire/messages', (req, res) => {
  const user = getUser(req);
  if (!user) return err(res, 'Non authentifié', 401);
  ok(res, messages.filter(m => m.expediteur_id === user.id || m.destinataire_id === user.id));
});

// ═══════════════════════════════════════════════
// RÉSERVATIONS
// ═══════════════════════════════════════════════
app.post('/api/reservations', (req, res) => {
  const user = getUser(req);
  if (!user || user.role !== 'locataire') return err(res, 'Accès refusé', 403);
  const { logement_id, date_debut, date_fin, type_sejour, mode_paiement } = req.body;
  const log = logements.find(l => l.id == logement_id && l.statut === 'actif');
  if (!log) return err(res, 'Logement indisponible', 404);
  const jours = Math.max(1, Math.round((new Date(date_fin) - new Date(date_debut)) / 86400000));
  const montant = type_sejour === 'courte_duree' ? jours * log.prix_par_nuit : Math.ceil(jours/30) * log.prix_par_mois;
  const newR = { id: nextResId++, locataire_id: user.id, logement_id: parseInt(logement_id), date_debut, date_fin, type_sejour, montant_total: montant, statut: 'en_attente', mode_paiement, ref_paiement: null, logement_titre: log.titre, ville_nom: log.ville_nom, photo_logement: log.photo_principale, proprietaire_id: log.proprietaire_id, locataire_nom: user.nom, locataire_prenom: user.prenom, locataire_tel: user.telephone, a_laisse_avis: false, created_at: new Date().toISOString() };
  reservations.push(newR);
  ok(res, newR, 'Réservation créée', 201);
});

app.put('/api/reservations/:id/statut', (req, res) => {
  const user = getUser(req);
  if (!user) return err(res, 'Non authentifié', 401);
  const r = reservations.find(r => r.id === parseInt(req.params.id));
  if (!r) return err(res, 'Réservation introuvable', 404);
  r.statut = req.body.statut;
  ok(res, { statut: r.statut }, 'Statut mis à jour');
});

// ═══════════════════════════════════════════════
// MESSAGERIE
// ═══════════════════════════════════════════════
app.post('/api/messages', (req, res) => {
  const user = getUser(req);
  if (!user) return err(res, 'Non authentifié', 401);
  const msg = { id: nextMsgId++, expediteur_id: user.id, destinataire_id: parseInt(req.body.destinataire_id), reservation_id: req.body.reservation_id || null, contenu: req.body.contenu, lu: false, nom: user.nom, prenom: user.prenom, created_at: new Date().toISOString() };
  messages.push(msg);
  ok(res, { id: msg.id }, 'Message envoyé', 201);
});

app.get('/api/messages/:userId', (req, res) => {
  const user = getUser(req);
  if (!user) return err(res, 'Non authentifié', 401);
  const otherId = parseInt(req.params.userId);
  const conv = messages.filter(m => (m.expediteur_id === user.id && m.destinataire_id === otherId) || (m.expediteur_id === otherId && m.destinataire_id === user.id));
  ok(res, conv);
});

app.put('/api/messages/lu/:fromId', (req, res) => {
  const user = getUser(req);
  if (!user) return err(res, 'Non authentifié', 401);
  messages.filter(m => m.expediteur_id === parseInt(req.params.fromId) && m.destinataire_id === user.id).forEach(m => m.lu = true);
  ok(res, null, 'Messages lus');
});

// ═══════════════════════════════════════════════
// AVIS
// ═══════════════════════════════════════════════
app.post('/api/avis', (req, res) => {
  const user = getUser(req);
  if (!user || user.role !== 'locataire') return err(res, 'Accès refusé', 403);
  const { logement_id, reservation_id, note, commentaire } = req.body;
  const res_ = reservations.find(r => r.id == reservation_id && r.locataire_id === user.id && r.statut === 'terminee');
  if (!res_) return err(res, 'Réservation terminée introuvable', 404);
  if (avis.find(a => a.reservation_id == reservation_id)) return err(res, 'Avis déjà laissé', 409);
  const n = parseInt(note);
  if (n < 1 || n > 5) return err(res, 'Note entre 1 et 5');
  const newA = { id: nextAvisId++, locataire_id: user.id, logement_id: parseInt(logement_id), reservation_id: parseInt(reservation_id), note: n, commentaire, nom: user.nom, prenom: user.prenom, logement_titre: '', created_at: new Date().toISOString() };
  avis.push(newA);
  res_.a_laisse_avis = true;
  const log = logements.find(l => l.id === parseInt(logement_id));
  if (log) { const logAvis = avis.filter(a => a.logement_id === log.id); log.note_moyenne = logAvis.reduce((s,a) => s+a.note, 0) / logAvis.length; log.nb_avis = logAvis.length; }
  ok(res, { id: newA.id }, 'Avis publié', 201);
});

// ═══════════════════════════════════════════════
// PAIEMENTS
// ═══════════════════════════════════════════════
app.post('/api/paiements/initier', (req, res) => {
  const user = getUser(req);
  if (!user) return err(res, 'Non authentifié', 401);
  const { reservation_id, mode } = req.body;
  const r = reservations.find(r => r.id == reservation_id);
  if (!r) return err(res, 'Réservation introuvable', 404);
  const ref = 'LM-' + Math.random().toString(36).substring(2,10).toUpperCase();
  r.ref_paiement = ref;
  if (mode === 'especes') { ok(res, { ref, message: 'Réservation créée. Réglez en espèces.' }); return; }
  // Simule un checkout_url — redirige vers /reservation/succes directement
  ok(res, { ref, checkout_url: `http://localhost:3000/reservation/succes?ref=${ref}` });
});

app.post('/api/paiements/webhook', (req, res) => { res.json({ received: true }); });

app.get('/api/paiements/verifier/:ref', (req, res) => {
  const r = reservations.find(r => r.ref_paiement === req.params.ref);
  if (!r) return err(res, 'Référence introuvable', 404);
  if (r.statut === 'en_attente') r.statut = 'confirmee';
  ok(res, { statut: r.statut, paid: true, montant: r.montant_total, ref: req.params.ref });
});

// ═══════════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════════
function requireAdmin(req, res) {
  const user = getUser(req);
  if (!user || user.role !== 'admin') { err(res, 'Accès refusé', 403); return null; }
  return user;
}

app.get('/api/admin/stats', (req, res) => {
  if (!requireAdmin(req, res)) return;
  ok(res, {
    total_logements: logements.length,
    logements_actifs: logements.filter(l => l.statut === 'actif').length,
    logements_en_attente: logements.filter(l => l.statut === 'en_attente').length,
    logements_inactifs: logements.filter(l => l.statut === 'inactif').length,
    total_reservations: reservations.length,
    reservations_confirmees: reservations.filter(r => r.statut === 'confirmee').length,
    revenus_mois: reservations.filter(r => r.statut === 'confirmee').reduce((s,r) => s + r.montant_total, 0),
    nb_locataires: users.filter(u => u.role === 'locataire').length,
    nb_proprietaires: users.filter(u => u.role === 'proprietaire').length,
    logements_par_region: regions.map(r => ({ id: r.id, nom: r.nom, nb_annonces: logements.filter(l => l.region_id === r.id && l.statut === 'actif').length })).sort((a,b) => b.nb_annonces - a.nb_annonces),
  });
});

app.get('/api/admin/logements', (req, res) => {
  if (!requireAdmin(req, res)) return;
  const statut = req.query.statut || 'en_attente';
  const list   = logements.filter(l => l.statut === statut);
  const page   = parseInt(req.query.page)  || 1;
  const limit  = parseInt(req.query.limit) || 20;
  paginate(res, list, page, limit);
});

app.put('/api/admin/logements/:id/valider', (req, res) => {
  if (!requireAdmin(req, res)) return;
  const l = logements.find(l => l.id === parseInt(req.params.id));
  if (!l) return err(res, 'Logement introuvable', 404);
  l.statut = req.body.statut;
  if (req.body.motif_rejet) l.motif_rejet = req.body.motif_rejet;
  ok(res, null, l.statut === 'actif' ? 'Annonce validée' : 'Annonce rejetée');
});

app.get('/api/admin/users', (req, res) => {
  if (!requireAdmin(req, res)) return;
  const role = req.query.role;
  const list = role ? users.filter(u => u.role === role) : users;
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 20;
  paginate(res, list.map(safe), page, limit);
});

app.put('/api/admin/users/:id/statut', (req, res) => {
  if (!requireAdmin(req, res)) return;
  const u = users.find(u => u.id === parseInt(req.params.id));
  if (!u) return err(res, 'Utilisateur introuvable', 404);
  if (req.body.actif !== undefined) u.is_active = req.body.actif;
  if (req.body.is_verified !== undefined) u.is_verified = req.body.is_verified;
  ok(res, null, 'Utilisateur mis à jour');
});

app.get('/api/admin/avis', (req, res) => {
  if (!requireAdmin(req, res)) return;
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 20;
  paginate(res, avis, page, limit);
});

app.delete('/api/admin/avis/:id', (req, res) => {
  if (!requireAdmin(req, res)) return;
  const idx = avis.findIndex(a => a.id === parseInt(req.params.id));
  if (idx >= 0) avis.splice(idx, 1);
  ok(res, null, 'Avis supprimé');
});

app.get('/api/admin/stats-regions', (req, res) => {
  if (!requireAdmin(req, res)) return;
  ok(res, regions.map(r => ({
    region: r.nom,
    nb_annonces: logements.filter(l => l.region_id === r.id && l.statut === 'actif').length,
    nb_reservations: reservations.filter(res => logements.find(l => l.id === res.logement_id && l.region_id === r.id)).length,
    revenus_total: reservations.filter(res => logements.find(l => l.id === res.logement_id && l.region_id === r.id) && res.statut === 'confirmee').reduce((s,r) => s + r.montant_total, 0),
    prix_moyen: logements.filter(l => l.region_id === r.id && l.prix_par_mois).reduce((s,l,_,a) => s + l.prix_par_mois/a.length, 0),
  })));
});

// ── Démarrage ──────────────────────────────────────────────────
app.listen(8000, () => {
  console.log('✅ Mock API LocaMaison démarré sur http://localhost:8000');
  console.log('   Comptes test : admin@locamaison.sn / oumar.diallo@test.sn / ibrahima.sow@test.sn');
  console.log('   Mot de passe : password');
});
