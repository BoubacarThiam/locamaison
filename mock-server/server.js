const express = require('express');
const cors    = require('cors');
const multer  = require('multer');
const { createClient } = require('@supabase/supabase-js');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const app = express();
app.use(cors());
app.use(express.json());

// ── Supabase ────────────────────────────────────────────────────
const sb = createClient(
  process.env.SUPABASE_URL        || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

// ── Données statiques (référentiel géographique) ─────────────────
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

// ── Helpers ─────────────────────────────────────────────────────
function makeToken(user) {
  return Buffer.from(JSON.stringify({
    id: user.id, email: user.email, role: user.role,
    nom: user.nom, prenom: user.prenom,
    exp: Date.now() + 7 * 24 * 3600 * 1000,
  })).toString('base64');
}
function getUser(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return null;
  try {
    const p = JSON.parse(Buffer.from(auth.slice(7), 'base64').toString());
    if (p.exp < Date.now()) return null;
    return p;
  } catch { return null; }
}
function ok(res, data, msg = '', code = 200) { res.status(code).json({ success: true, data, message: msg }); }
function err(res, msg, code = 400)           { res.status(code).json({ success: false, data: null, message: msg }); }
function safe(u) { if (!u) return null; const { password, ...rest } = u; return rest; }

// ═══════════════════════════════════════════════
// RÉFÉRENTIEL GÉOGRAPHIQUE
// ═══════════════════════════════════════════════
app.get('/api/regions', (req, res) => ok(res, regions));
app.get('/api/villes',  (req, res) => {
  const rid = req.query.region_id;
  ok(res, rid ? villes.filter(v => v.region_id == rid) : villes);
});
app.get('/api/quartiers', (req, res) => {
  const vid = req.query.ville_id;
  ok(res, vid ? quartiers.filter(q => q.ville_id == vid) : quartiers);
});

// ═══════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════
// Connexion / inscription via Google OAuth
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential, role = 'locataire' } = req.body;
    if (!credential) return err(res, 'Token Google manquant');

    // Vérifie le token auprès de Google
    const gRes  = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    const gData = await gRes.json();
    if (!gRes.ok || gData.error || !gData.email) return err(res, 'Token Google invalide', 401);

    // Cherche si l'utilisateur existe déjà
    const { data: existing } = await sb.from('users').select('*').eq('email', gData.email).maybeSingle();

    if (existing) {
      if (!existing.is_active) return err(res, 'Compte désactivé', 403);
      // forceRole = mise à jour du rôle lors du premier choix
      if (req.body.forceRole && validRole !== existing.role) {
        const { data: updated } = await sb.from('users').update({ role: validRole }).eq('id', existing.id).select().single();
        return ok(res, { token: makeToken(updated || existing), user: safe(updated || existing), is_new: false });
      }
      return ok(res, { token: makeToken(existing), user: safe(existing), is_new: false });
    }

    // Crée un nouveau compte avec le rôle choisi
    const validRole = ['locataire', 'proprietaire'].includes(role) ? role : 'locataire';
    const { data: newUser, error: createErr } = await sb.from('users').insert({
      nom:         gData.family_name || gData.email.split('@')[0],
      prenom:      gData.given_name  || '',
      email:       gData.email,
      password:    `google_${gData.sub}`,
      role:        validRole,
      is_verified: true,
      is_active:   true,
      avatar:      gData.picture || null,
    }).select().single();

    if (createErr) return err(res, 'Erreur lors de la création du compte', 500);
    ok(res, { token: makeToken(newUser), user: safe(newUser), is_new: true }, 'Compte créé', 201);
  } catch { err(res, 'Erreur serveur', 500); }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { nom, prenom, email, password, role, telephone } = req.body;
    if (!nom || !prenom || !email || !password || !role) return err(res, 'Tous les champs sont requis');
    if (!['locataire','proprietaire'].includes(role))    return err(res, 'Rôle invalide');
    if (password.length < 6)                            return err(res, 'Mot de passe trop court (min. 6 caractères)');

    const { data: existing } = await sb.from('users').select('id').eq('email', email).maybeSingle();
    if (existing) return err(res, 'Cet email est déjà utilisé', 409);

    const { data: user, error } = await sb.from('users')
      .insert({ nom, prenom, email, password, role, telephone: telephone || null })
      .select().single();
    if (error) return err(res, 'Erreur lors de la création du compte', 500);
    ok(res, { token: makeToken(user), user: safe(user) }, 'Inscription réussie', 201);
  } catch { err(res, 'Erreur serveur', 500); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return err(res, 'Email et mot de passe requis');
    const { data: user, error } = await sb.from('users').select('*')
      .eq('email', email).eq('password', password).eq('is_active', true).maybeSingle();
    if (error) return err(res, 'Erreur base de données: ' + error.message, 500);
    if (!user) return err(res, 'Email ou mot de passe incorrect', 401);
    ok(res, { token: makeToken(user), user: safe(user) });
  } catch (e) { err(res, 'Erreur serveur: ' + e.message, 500); }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const u = getUser(req);
    if (!u) return err(res, 'Non authentifié', 401);
    const { data: user } = await sb.from('users').select('*').eq('id', u.id).maybeSingle();
    ok(res, safe(user || u));
  } catch { err(res, 'Erreur serveur', 500); }
});

app.put('/api/auth/profil', async (req, res) => {
  try {
    const u = getUser(req);
    if (!u) return err(res, 'Non authentifié', 401);
    const { nom, prenom, telephone } = req.body;
    const { data: user, error } = await sb.from('users')
      .update({ nom, prenom, telephone }).eq('id', u.id).select().single();
    if (error) return err(res, 'Erreur mise à jour', 500);
    ok(res, safe(user), 'Profil mis à jour');
  } catch { err(res, 'Erreur serveur', 500); }
});

// ═══════════════════════════════════════════════
// LOGEMENTS
// ═══════════════════════════════════════════════
app.get('/api/logements', async (req, res) => {
  try {
    const { region_id, ville_id, type, meuble, prix_min, prix_max, nb_chambres, type_sejour, sort } = req.query;
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);

    let q = sb.from('logements').select('*', { count: 'exact' }).eq('statut', 'actif');
    if (region_id)  q = q.eq('region_id', parseInt(region_id));
    if (ville_id)   q = q.eq('ville_id',  parseInt(ville_id));
    if (type)       q = q.eq('type',       type);
    if (meuble !== undefined && meuble !== '') q = q.eq('meuble', meuble === '1' || meuble === 'true');

    const priceKey = type_sejour === 'courte_duree' ? 'prix_par_nuit' : 'prix_par_mois';
    if (prix_min) q = q.gte(priceKey, parseInt(prix_min));
    if (prix_max) q = q.lte(priceKey, parseInt(prix_max));
    if (nb_chambres) {
      const n = parseInt(nb_chambres);
      q = n >= 4 ? q.gte('nb_chambres', 4) : q.eq('nb_chambres', n);
    }

    const sortMap = {
      prix_asc:  { col: priceKey,       asc: true  },
      prix_desc: { col: priceKey,       asc: false },
      note:      { col: 'note_moyenne', asc: false },
      recent:    { col: 'id',           asc: false },
    };
    const s = sortMap[sort] || sortMap.recent;
    q = q.order(s.col, { ascending: s.asc }).range((page-1)*limit, page*limit-1);

    const { data, count, error } = await q;
    if (error) return err(res, 'Erreur base de données: ' + error.message, 500);
    res.json({ success: true, data: data || [], pagination: { total: count||0, page, limit, pages: Math.ceil((count||0)/limit) } });
  } catch (e) { err(res, 'Erreur serveur: ' + e.message, 500); }
});

app.get('/api/logements/:id', async (req, res) => {
  try {
    const { data: l } = await sb.from('logements').select('*').eq('id', parseInt(req.params.id)).maybeSingle();
    if (!l) return err(res, 'Logement introuvable', 404);
    const { data: logAvis } = await sb.from('avis').select('*').eq('logement_id', l.id).order('created_at', { ascending: false });
    const { count: nbResPropr } = await sb.from('reservations')
      .select('*', { count: 'exact', head: true }).eq('proprietaire_id', l.proprietaire_id);
    // Email du propriétaire pour la prise de contact
    const { data: proprio } = await sb.from('users').select('email').eq('id', l.proprietaire_id).maybeSingle();

    // Construit la liste de photos depuis photos_urls (multi-photo) ou photo_principale (fallback)
    const photosList = (l.photos_urls && l.photos_urls.length > 0)
      ? l.photos_urls.map((url, i) => ({ id: i + 1, logement_id: l.id, url, is_principale: i === 0 }))
      : l.photo_principale
        ? [{ id: 1, logement_id: l.id, url: l.photo_principale, is_principale: true }]
        : [];

    ok(res, {
      ...l,
      proprio_email: proprio?.email || null,
      photos: photosList,
      avis:   logAvis || [],
      nb_reservations_proprio: nbResPropr || 0,
    });
  } catch { err(res, 'Erreur serveur', 500); }
});

app.post('/api/logements', async (req, res) => {
  try {
    const u = getUser(req);
    if (!u || u.role !== 'proprietaire') return err(res, 'Accès refusé', 403);
    const { titre, type, ville_id, region_id } = req.body;
    if (!titre || !type || !ville_id || !region_id) return err(res, 'Champs requis manquants');

    const ville    = villes.find(v => v.id == ville_id);
    const region   = regions.find(r => r.id == region_id);
    const quartier = req.body.quartier_id ? quartiers.find(q => q.id == req.body.quartier_id) : null;

    // Convertit les chaînes vides en null pour les champs numériques.
    // Retire les espaces/points/virgules utilisés comme séparateurs de milliers
    // (ex: "125 000" ou "125.000") avant parseInt, sinon parseInt("125 000") = 125.
    const num = v => {
      if (v === '' || v == null) return null;
      const cleaned = String(v).replace(/[^\d]/g, '');
      return cleaned === '' ? null : parseInt(cleaned, 10);
    };
    const flt = v => (v !== '' && v != null) ? parseFloat(v) : null;

    const { data: newL, error } = await sb.from('logements').insert({
      titre:             titre,
      description:       req.body.description   || null,
      type:              type,
      adresse:           req.body.adresse        || null,
      region_id:         num(region_id),
      ville_id:          num(ville_id),
      quartier_id:       num(req.body.quartier_id),
      nb_chambres:       num(req.body.nb_chambres)    || 1,
      nb_salles_bain:    num(req.body.nb_salles_bain)  || 1,
      superficie_m2:     num(req.body.superficie_m2),
      prix_par_mois:     num(req.body.prix_par_mois),
      prix_par_nuit:     num(req.body.prix_par_nuit),
      latitude:          flt(req.body.latitude),
      longitude:         flt(req.body.longitude),
      meuble:            req.body.meuble === true || req.body.meuble === 'true',
      equipements:       Array.isArray(req.body.equipements) ? req.body.equipements : [],
      photo_principale:  req.body.photo_principale || null,
      proprietaire_id:   u.id,
      statut:            'actif',
      note_moyenne:      0,
      nb_avis:           0,
      ville_nom:         ville?.nom    || '',
      region_nom:        region?.nom   || '',
      quartier_nom:      quartier?.nom || null,
      proprio_nom:       u.nom,
      proprio_prenom:    u.prenom,
      proprio_telephone: u.telephone   || null,
    }).select().single();
    if (error) return err(res, 'Erreur création annonce : ' + error.message, 500);
    ok(res, newL, 'Annonce publiée et visible par tous les utilisateurs', 201);
  } catch { err(res, 'Erreur serveur', 500); }
});

app.put('/api/logements/:id', async (req, res) => {
  try {
    const u = getUser(req);
    if (!u) return err(res, 'Non authentifié', 401);
    const { data: existing } = await sb.from('logements').select('proprietaire_id').eq('id', parseInt(req.params.id)).maybeSingle();
    if (!existing) return err(res, 'Logement introuvable', 404);
    if (existing.proprietaire_id !== u.id && u.role !== 'admin') return err(res, 'Accès refusé', 403);

    const num = v => {
      if (v === '' || v == null) return null;
      const cleaned = String(v).replace(/[^\d]/g, '');
      return cleaned === '' ? null : parseInt(cleaned, 10);
    };
    const flt = v => (v !== '' && v != null) ? parseFloat(v) : null;

    const patch = {};
    if (req.body.titre         !== undefined) patch.titre          = req.body.titre;
    if (req.body.description   !== undefined) patch.description    = req.body.description   || null;
    if (req.body.type          !== undefined) patch.type           = req.body.type;
    if (req.body.adresse       !== undefined) patch.adresse        = req.body.adresse        || null;
    if (req.body.region_id     !== undefined) patch.region_id      = num(req.body.region_id);
    if (req.body.ville_id      !== undefined) patch.ville_id       = num(req.body.ville_id);
    if (req.body.quartier_id   !== undefined) patch.quartier_id    = num(req.body.quartier_id);
    if (req.body.nb_chambres   !== undefined) patch.nb_chambres    = num(req.body.nb_chambres)   || 1;
    if (req.body.nb_salles_bain!== undefined) patch.nb_salles_bain = num(req.body.nb_salles_bain) || 1;
    if (req.body.superficie_m2 !== undefined) patch.superficie_m2  = num(req.body.superficie_m2);
    if (req.body.prix_par_mois !== undefined) patch.prix_par_mois  = num(req.body.prix_par_mois);
    if (req.body.prix_par_nuit !== undefined) patch.prix_par_nuit  = num(req.body.prix_par_nuit);
    if (req.body.latitude      !== undefined) patch.latitude       = flt(req.body.latitude);
    if (req.body.longitude     !== undefined) patch.longitude      = flt(req.body.longitude);
    if (req.body.meuble        !== undefined) patch.meuble         = req.body.meuble === true || req.body.meuble === 'true';
    if (req.body.equipements   !== undefined) patch.equipements    = Array.isArray(req.body.equipements) ? req.body.equipements : [];
    if (req.body.statut        !== undefined) patch.statut         = req.body.statut;

    const { data: updated, error } = await sb.from('logements').update(patch).eq('id', parseInt(req.params.id)).select().single();
    if (error) return err(res, 'Erreur mise à jour : ' + error.message, 500);
    ok(res, updated, 'Annonce mise à jour');
  } catch { err(res, 'Erreur serveur', 500); }
});

app.delete('/api/logements/:id', async (req, res) => {
  try {
    const u = getUser(req);
    if (!u) return err(res, 'Non authentifié', 401);
    const { data: existing } = await sb.from('logements').select('proprietaire_id').eq('id', parseInt(req.params.id)).maybeSingle();
    if (!existing) return err(res, 'Logement introuvable', 404);
    if (existing.proprietaire_id !== u.id && u.role !== 'admin') return err(res, 'Accès refusé', 403);
    await sb.from('logements').delete().eq('id', parseInt(req.params.id));
    ok(res, null, 'Annonce supprimée');
  } catch { err(res, 'Erreur serveur', 500); }
});

app.post('/api/logements/:id/photos', upload.array('photos[]', 10), async (req, res) => {
  try {
    const u = getUser(req);
    if (!u) return err(res, 'Non authentifié', 401);

    const logId = parseInt(req.params.id);
    const files  = req.files || [];
    if (!files.length) return err(res, 'Aucune photo reçue', 400);

    // Crée le bucket Supabase Storage s'il n'existe pas
    const { data: buckets } = await sb.storage.listBuckets();
    if (!(buckets || []).some(b => b.name === 'Photos')) {
      await sb.storage.createBucket('Photos', { public: true, fileSizeLimit: 5242880 });
    }

    const urls = [];
    for (const file of files) {
      const ext  = (file.originalname.split('.').pop() || 'jpg').toLowerCase();
      const path = `logement-${logId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await sb.storage.from('Photos').upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });
      if (upErr) continue;
      const { data: pub } = sb.storage.from('Photos').getPublicUrl(path);
      if (pub?.publicUrl) urls.push(pub.publicUrl);
    }

    if (!urls.length) return err(res, 'Erreur lors de l\'upload des photos', 500);

    // Récupère les photos existantes et concatène les nouvelles
    const { data: existing } = await sb.from('logements').select('photos_urls,photo_principale').eq('id', logId).maybeSingle();
    const prevUrls = existing?.photos_urls || (existing?.photo_principale ? [existing.photo_principale] : []);
    const allUrls  = [...prevUrls.filter(u => !u.includes('unsplash')), ...urls]; // remplace les placeholders

    // Tente la mise à jour avec photos_urls ; si la colonne n'existe pas encore → fallback
    const { error: updateErr } = await sb.from('logements').update({
      photo_principale: allUrls[0],
      photos_urls:      allUrls,
    }).eq('id', logId);

    if (updateErr) {
      // Colonne photos_urls absente : stocke seulement la photo principale
      await sb.from('logements').update({ photo_principale: allUrls[0] }).eq('id', logId);
    }

    ok(res, urls.map((url, i) => ({ id: i + 1, url, is_principale: i === 0 })), 'Photos enregistrées', 201);
  } catch (e) { err(res, 'Erreur serveur', 500); }
});

// Demande rapide de location (alerte directe au propriétaire)
app.post('/api/logements/:id/demande', async (req, res) => {
  try {
    const u = getUser(req);
    if (!u) return err(res, 'Connectez-vous pour envoyer une demande', 401);
    const { data: log } = await sb.from('logements').select('*').eq('id', parseInt(req.params.id)).eq('statut', 'actif').maybeSingle();
    if (!log) return err(res, 'Logement introuvable', 404);
    if (log.proprietaire_id === u.id) return err(res, 'Vous ne pouvez pas louer votre propre bien', 400);
    await sb.from('notifications').insert({
      proprietaire_id: log.proprietaire_id,
      type: 'demande_location',
      data: {
        logement_id: log.id, logement_titre: log.titre,
        locataire_nom: u.nom, locataire_prenom: u.prenom,
        locataire_email: u.email, locataire_tel: u.telephone || '',
        message: req.body.message || 'Je suis intéressé par ce logement.',
      },
      lu: false,
    });
    ok(res, null, 'Votre demande a été envoyée au propriétaire', 201);
  } catch { err(res, 'Erreur serveur', 500); }
});

// ═══════════════════════════════════════════════
// PROPRIÉTAIRE
// ═══════════════════════════════════════════════
app.get('/api/proprietaire/dashboard', async (req, res) => {
  try {
    const u = getUser(req);
    if (!u) return err(res, 'Non authentifié', 401);
    const { data: mes } = await sb.from('logements').select('id,statut,note_moyenne').eq('proprietaire_id', u.id);
    const mesIds = (mes||[]).map(l => l.id);
    const { data: mesRes } = mesIds.length
      ? await sb.from('reservations').select('statut,montant_total').in('logement_id', mesIds)
      : { data: [] };
    const noteAvg = (mes||[]).length ? (mes.reduce((s,l) => s + (l.note_moyenne||0), 0) / mes.length) : 0;
    ok(res, {
      total_annonces:       mes?.length || 0,
      annonces_actives:     mes?.filter(l => l.statut === 'actif').length || 0,
      en_attente:           mes?.filter(l => l.statut === 'en_attente').length || 0,
      reservations_actives: mesRes?.filter(r => r.statut === 'confirmee').length || 0,
      revenus_mois:         mesRes?.filter(r => r.statut === 'confirmee').reduce((s,r) => s+r.montant_total, 0) || 0,
      note_moyenne:         Math.round(noteAvg * 10) / 10,
    });
  } catch { err(res, 'Erreur serveur', 500); }
});

app.get('/api/proprietaire/annonces', async (req, res) => {
  try {
    const u = getUser(req);
    if (!u) return err(res, 'Non authentifié', 401);
    const { data } = await sb.from('logements').select('*').eq('proprietaire_id', u.id).order('created_at', { ascending: false });
    ok(res, data || []);
  } catch { err(res, 'Erreur serveur', 500); }
});

app.get('/api/proprietaire/reservations', async (req, res) => {
  try {
    const u = getUser(req);
    if (!u) return err(res, 'Non authentifié', 401);
    const { data } = await sb.from('reservations').select('*').eq('proprietaire_id', u.id).order('created_at', { ascending: false });
    ok(res, data || []);
  } catch { err(res, 'Erreur serveur', 500); }
});

app.get('/api/proprietaire/messages', async (req, res) => {
  try {
    const u = getUser(req);
    if (!u) return err(res, 'Non authentifié', 401);
    const { data: msgs } = await sb.from('messages').select('*')
      .or(`expediteur_id.eq.${u.id},destinataire_id.eq.${u.id}`)
      .order('created_at', { ascending: false });
    const convMap = {};
    (msgs||[]).forEach(m => {
      const otherId = m.expediteur_id === u.id ? m.destinataire_id : m.expediteur_id;
      if (!convMap[otherId]) convMap[otherId] = { interlocuteur_id: otherId, nom: m.nom, prenom: m.prenom, dernier_message: m.contenu, created_at: m.created_at, non_lus: 0 };
      if (!m.lu && m.destinataire_id === u.id) convMap[otherId].non_lus++;
    });
    ok(res, Object.values(convMap));
  } catch { err(res, 'Erreur serveur', 500); }
});

app.get('/api/proprietaire/notifications', async (req, res) => {
  try {
    const u = getUser(req);
    if (!u) return err(res, 'Non authentifié', 401);
    const { data } = await sb.from('notifications').select('*').eq('proprietaire_id', u.id).order('created_at', { ascending: false });
    ok(res, data || []);
  } catch { err(res, 'Erreur serveur', 500); }
});

app.put('/api/proprietaire/notifications/read', async (req, res) => {
  try {
    const u = getUser(req);
    if (!u) return err(res, 'Non authentifié', 401);
    await sb.from('notifications').update({ lu: true }).eq('proprietaire_id', u.id).eq('lu', false);
    ok(res, null, 'Notifications marquées comme lues');
  } catch { err(res, 'Erreur serveur', 500); }
});

// ═══════════════════════════════════════════════
// LOCATAIRE
// ═══════════════════════════════════════════════
app.get('/api/locataire/reservations', async (req, res) => {
  try {
    const u = getUser(req);
    if (!u) return err(res, 'Non authentifié', 401);
    const { data } = await sb.from('reservations').select('*').eq('locataire_id', u.id).order('created_at', { ascending: false });
    ok(res, data || []);
  } catch { err(res, 'Erreur serveur', 500); }
});

app.get('/api/locataire/messages', async (req, res) => {
  try {
    const u = getUser(req);
    if (!u) return err(res, 'Non authentifié', 401);
    const { data } = await sb.from('messages').select('*')
      .or(`expediteur_id.eq.${u.id},destinataire_id.eq.${u.id}`)
      .order('created_at');
    ok(res, data || []);
  } catch { err(res, 'Erreur serveur', 500); }
});

// ═══════════════════════════════════════════════
// RÉSERVATIONS
// ═══════════════════════════════════════════════
app.post('/api/reservations', async (req, res) => {
  try {
    const u = getUser(req);
    if (!u || u.role !== 'locataire') return err(res, 'Accès refusé', 403);
    const { logement_id, date_debut, date_fin, type_sejour, mode_paiement } = req.body;
    const { data: log } = await sb.from('logements').select('*').eq('id', parseInt(logement_id)).eq('statut', 'actif').maybeSingle();
    if (!log) return err(res, 'Logement indisponible', 404);
    const jours = Math.max(1, Math.round((new Date(date_fin) - new Date(date_debut)) / 86400000));
    const montant = type_sejour === 'courte_duree' ? jours * log.prix_par_nuit : Math.ceil(jours/30) * log.prix_par_mois;
    const { data: newR, error } = await sb.from('reservations').insert({
      locataire_id: u.id, logement_id: parseInt(logement_id), proprietaire_id: log.proprietaire_id,
      date_debut, date_fin, type_sejour, montant_total: montant, statut: 'en_attente', mode_paiement,
      logement_titre: log.titre, ville_nom: log.ville_nom, photo_logement: log.photo_principale,
      locataire_nom: u.nom, locataire_prenom: u.prenom, locataire_tel: u.telephone || '',
      a_laisse_avis: false,
    }).select().single();
    if (error) return err(res, 'Erreur création réservation', 500);
    // Alerte au propriétaire
    await sb.from('notifications').insert({
      proprietaire_id: log.proprietaire_id,
      type: 'nouvelle_reservation',
      data: {
        reservation_id: newR.id, logement_titre: log.titre,
        locataire_nom: u.nom, locataire_prenom: u.prenom, locataire_tel: u.telephone || '',
        montant_total: montant, date_debut, date_fin, type_sejour,
      },
      lu: false,
    });
    ok(res, newR, 'Réservation créée', 201);
  } catch { err(res, 'Erreur serveur', 500); }
});

app.put('/api/reservations/:id/statut', async (req, res) => {
  try {
    const u = getUser(req);
    if (!u) return err(res, 'Non authentifié', 401);
    const { data: updated, error } = await sb.from('reservations')
      .update({ statut: req.body.statut }).eq('id', parseInt(req.params.id)).select().single();
    if (error) return err(res, 'Erreur mise à jour', 500);
    ok(res, { statut: updated.statut }, 'Statut mis à jour');
  } catch { err(res, 'Erreur serveur', 500); }
});

// ═══════════════════════════════════════════════
// MESSAGERIE
// ═══════════════════════════════════════════════
app.post('/api/messages', async (req, res) => {
  try {
    const u = getUser(req);
    if (!u) return err(res, 'Non authentifié', 401);
    const { data, error } = await sb.from('messages').insert({
      expediteur_id: u.id, destinataire_id: parseInt(req.body.destinataire_id),
      reservation_id: req.body.reservation_id || null, contenu: req.body.contenu,
      lu: false, nom: u.nom, prenom: u.prenom,
    }).select().single();
    if (error) return err(res, 'Erreur envoi message', 500);
    ok(res, { id: data.id }, 'Message envoyé', 201);
  } catch { err(res, 'Erreur serveur', 500); }
});

app.get('/api/messages/:userId', async (req, res) => {
  try {
    const u = getUser(req);
    if (!u) return err(res, 'Non authentifié', 401);
    const otherId = parseInt(req.params.userId);
    const { data } = await sb.from('messages').select('*')
      .or(`and(expediteur_id.eq.${u.id},destinataire_id.eq.${otherId}),and(expediteur_id.eq.${otherId},destinataire_id.eq.${u.id})`)
      .order('created_at');
    ok(res, data || []);
  } catch { err(res, 'Erreur serveur', 500); }
});

app.put('/api/messages/lu/:fromId', async (req, res) => {
  try {
    const u = getUser(req);
    if (!u) return err(res, 'Non authentifié', 401);
    await sb.from('messages').update({ lu: true })
      .eq('expediteur_id', parseInt(req.params.fromId)).eq('destinataire_id', u.id);
    ok(res, null, 'Messages lus');
  } catch { err(res, 'Erreur serveur', 500); }
});

// ═══════════════════════════════════════════════
// AVIS
// ═══════════════════════════════════════════════
app.post('/api/avis', async (req, res) => {
  try {
    const u = getUser(req);
    if (!u || u.role !== 'locataire') return err(res, 'Accès refusé', 403);
    const { logement_id, reservation_id, note, commentaire } = req.body;
    const { data: resv } = await sb.from('reservations').select('*')
      .eq('id', parseInt(reservation_id)).eq('locataire_id', u.id).eq('statut', 'terminee').maybeSingle();
    if (!resv) return err(res, 'Réservation terminée introuvable', 404);
    const { data: existing } = await sb.from('avis').select('id').eq('reservation_id', parseInt(reservation_id)).maybeSingle();
    if (existing) return err(res, 'Avis déjà laissé', 409);
    const n = parseInt(note);
    if (n < 1 || n > 5) return err(res, 'Note entre 1 et 5');
    const { data: newA, error } = await sb.from('avis').insert({
      locataire_id: u.id, logement_id: parseInt(logement_id),
      reservation_id: parseInt(reservation_id), note: n, commentaire,
      nom: u.nom, prenom: u.prenom, logement_titre: resv.logement_titre || '',
    }).select().single();
    if (error) return err(res, 'Erreur création avis', 500);
    // Recalcule la note moyenne
    const { data: allAvis } = await sb.from('avis').select('note').eq('logement_id', parseInt(logement_id));
    const avg = allAvis.reduce((s,a) => s + a.note, 0) / allAvis.length;
    await sb.from('logements').update({ note_moyenne: Math.round(avg * 10) / 10, nb_avis: allAvis.length }).eq('id', parseInt(logement_id));
    await sb.from('reservations').update({ a_laisse_avis: true }).eq('id', parseInt(reservation_id));
    ok(res, { id: newA.id }, 'Avis publié', 201);
  } catch { err(res, 'Erreur serveur', 500); }
});

// ═══════════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════════
app.get('/api/admin/stats', async (req, res) => {
  try {
    const u = getUser(req);
    if (!u || u.role !== 'admin') return err(res, 'Accès refusé', 403);
    const [{ count: tL }, { count: tR }, { count: tU }, { count: tLoc }] = await Promise.all([
      sb.from('logements').select('*', { count: 'exact', head: true }),
      sb.from('reservations').select('*', { count: 'exact', head: true }),
      sb.from('users').select('*', { count: 'exact', head: true }),
      sb.from('users').select('*', { count: 'exact', head: true }).eq('role', 'locataire'),
    ]);
    const { data: resCfm } = await sb.from('reservations').select('montant_total').eq('statut', 'confirmee');
    const { count: lActifs } = await sb.from('logements').select('*', { count: 'exact', head: true }).eq('statut', 'actif');
    const { count: lAttente } = await sb.from('logements').select('*', { count: 'exact', head: true }).eq('statut', 'en_attente');
    ok(res, {
      total_logements: tL || 0, logements_actifs: lActifs || 0,
      logements_en_attente: lAttente || 0, logements_inactifs: 0,
      total_reservations: tR || 0, reservations_confirmees: 0,
      revenus_mois: (resCfm||[]).reduce((s,r) => s + r.montant_total, 0),
      nb_locataires: tLoc || 0, nb_proprietaires: 0,
    });
  } catch { err(res, 'Erreur serveur', 500); }
});

app.get('/api/admin/logements', async (req, res) => {
  try {
    const u = getUser(req);
    if (!u || u.role !== 'admin') return err(res, 'Accès refusé', 403);
    const page = parseInt(req.query.page) || 1, limit = 20;
    const { data, count } = await sb.from('logements').select('*', { count: 'exact' })
      .order('created_at', { ascending: false }).range((page-1)*limit, page*limit-1);
    res.json({ success:true, data: data||[], pagination:{ total: count||0, page, limit, pages: Math.ceil((count||0)/limit) } });
  } catch { err(res, 'Erreur serveur', 500); }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const u = getUser(req);
    if (!u || u.role !== 'admin') return err(res, 'Accès refusé', 403);
    const page = parseInt(req.query.page) || 1, limit = 20;
    const { data, count } = await sb.from('users')
      .select('id,nom,prenom,email,role,is_verified,is_active,created_at', { count: 'exact' })
      .order('created_at', { ascending: false }).range((page-1)*limit, page*limit-1);
    res.json({ success:true, data: data||[], pagination:{ total: count||0, page, limit, pages: Math.ceil((count||0)/limit) } });
  } catch { err(res, 'Erreur serveur', 500); }
});

app.get('/api/admin/avis', async (req, res) => {
  try {
    const u = getUser(req);
    if (!u || u.role !== 'admin') return err(res, 'Accès refusé', 403);
    const page = parseInt(req.query.page) || 1, limit = 20;
    const { data, count } = await sb.from('avis').select('*', { count: 'exact' })
      .order('created_at', { ascending: false }).range((page-1)*limit, page*limit-1);
    res.json({ success:true, data: data||[], pagination:{ total: count||0, page, limit, pages: Math.ceil((count||0)/limit) } });
  } catch { err(res, 'Erreur serveur', 500); }
});

app.put('/api/admin/logements/:id/statut', async (req, res) => {
  try {
    const u = getUser(req);
    if (!u || u.role !== 'admin') return err(res, 'Accès refusé', 403);
    await sb.from('logements').update({ statut: req.body.statut }).eq('id', parseInt(req.params.id));
    ok(res, null, 'Statut mis à jour');
  } catch { err(res, 'Erreur serveur', 500); }
});

app.put('/api/admin/users/:id', async (req, res) => {
  try {
    const u = getUser(req);
    if (!u || u.role !== 'admin') return err(res, 'Accès refusé', 403);
    await sb.from('users').update(req.body).eq('id', parseInt(req.params.id));
    ok(res, null, 'Utilisateur mis à jour');
  } catch { err(res, 'Erreur serveur', 500); }
});

app.get('/api/admin/stats-regions', async (req, res) => {
  try {
    const u = getUser(req);
    if (!u || u.role !== 'admin') return err(res, 'Accès refusé', 403);
    const { data: logs } = await sb.from('logements').select('id,region_id,region_nom,statut,prix_par_mois');
    const { data: resv } = await sb.from('reservations').select('logement_id,statut,montant_total');
    const result = regions.map(r => {
      const rLogs   = (logs||[]).filter(l => l.region_id === r.id);
      const rLogIds = rLogs.map(l => l.id);
      const rRes    = (resv||[]).filter(rv => rLogIds.includes(rv.logement_id));
      const prices  = rLogs.filter(l => l.prix_par_mois).map(l => l.prix_par_mois);
      return {
        region: r.nom,
        nb_annonces:    rLogs.filter(l => l.statut === 'actif').length,
        nb_reservations: rRes.length,
        revenus_total:  rRes.filter(rv => rv.statut === 'confirmee').reduce((s,rv) => s + rv.montant_total, 0),
        prix_moyen:     prices.length ? Math.round(prices.reduce((s,p) => s+p,0) / prices.length) : 0,
      };
    });
    ok(res, result);
  } catch { err(res, 'Erreur serveur', 500); }
});

// Paiements (simulation)
app.post('/api/paiements/initier',  (req, res) => ok(res, { checkout_url: '#', ref: `LM-${Date.now()}` }));
app.get('/api/paiements/verifier',  (req, res) => ok(res, { paid: true, statut: 'confirmee' }));
app.post('/api/paiements/confirmer',(req, res) => ok(res, { paid: true, statut: 'confirmee' }));

// ── Démarrage ──────────────────────────────────────────────────
module.exports = app;

if (require.main === module) {
  app.listen(8000, () => {
    console.log('✅ LocaMaison API démarré sur http://localhost:8000');
    console.log('   Nécessite SUPABASE_URL et SUPABASE_SERVICE_KEY dans .env');
  });
}
