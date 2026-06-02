<?php
// ── Serveur mock LocaMaison — aperçu sans base de données ────────
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = preg_replace('#^/api#', '', $uri);
$uri = trim($uri, '/');

$REGIONS = [
  ['id'=>1,'nom'=>'Dakar'],['id'=>2,'nom'=>'Thiès'],['id'=>3,'nom'=>'Saint-Louis'],
  ['id'=>4,'nom'=>'Ziguinchor'],['id'=>5,'nom'=>'Kaolack'],['id'=>6,'nom'=>'Diourbel'],
  ['id'=>7,'nom'=>'Louga'],['id'=>8,'nom'=>'Fatick'],['id'=>9,'nom'=>'Kolda'],
  ['id'=>10,'nom'=>'Matam'],['id'=>11,'nom'=>'Tambacounda'],['id'=>12,'nom'=>'Kaffrine'],
  ['id'=>13,'nom'=>'Sédhiou'],['id'=>14,'nom'=>'Kédougou'],
];

$VILLES = [
  ['id'=>1,'region_id'=>1,'nom'=>'Dakar'],['id'=>2,'region_id'=>1,'nom'=>'Pikine'],
  ['id'=>3,'region_id'=>1,'nom'=>'Guédiawaye'],['id'=>4,'region_id'=>1,'nom'=>'Rufisque'],
  ['id'=>5,'region_id'=>1,'nom'=>'Bargny'],
  ['id'=>6,'region_id'=>2,'nom'=>'Thiès'],['id'=>7,'region_id'=>2,'nom'=>'Mbour'],
  ['id'=>8,'region_id'=>2,'nom'=>'Tivaouane'],['id'=>9,'region_id'=>2,'nom'=>'Joal-Fadiouth'],
  ['id'=>10,'region_id'=>3,'nom'=>'Saint-Louis'],['id'=>11,'region_id'=>3,'nom'=>'Richard-Toll'],
  ['id'=>12,'region_id'=>4,'nom'=>'Ziguinchor'],['id'=>13,'region_id'=>4,'nom'=>'Cap Skirring'],
  ['id'=>14,'region_id'=>5,'nom'=>'Kaolack'],
];

$QUARTIERS = [
  ['id'=>1,'ville_id'=>1,'nom'=>'Plateau'],['id'=>2,'ville_id'=>1,'nom'=>'Médina'],
  ['id'=>3,'ville_id'=>1,'nom'=>'Les Almadies'],['id'=>4,'ville_id'=>1,'nom'=>'Mermoz'],
  ['id'=>5,'ville_id'=>1,'nom'=>'Sacré-Cœur'],['id'=>6,'ville_id'=>1,'nom'=>'Yoff'],
  ['id'=>7,'ville_id'=>1,'nom'=>'Ouakam'],['id'=>8,'ville_id'=>1,'nom'=>'Parcelles Assainies'],
  ['id'=>9,'ville_id'=>6,'nom'=>'Centre-ville'],['id'=>10,'ville_id'=>6,'nom'=>'Thialy'],
  ['id'=>11,'ville_id'=>7,'nom'=>'Saly Portudal'],['id'=>12,'ville_id'=>7,'nom'=>'Centre'],
];

$PHOTOS = [
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1565372374105-1e96f6e671a3?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop',
];

$LOGEMENTS = [
  ['id'=>1,'titre'=>'Bel appartement F3 aux Almadies','description'=>'Superbe appartement meublé avec vue mer, proche plage des Almadies. Idéal pour séjour courte ou longue durée. Accès WiFi très rapide, climatisation dans toutes les pièces.','type'=>'appartement','adresse'=>'Rue des Jasmins, Les Almadies','quartier_id'=>3,'quartier_nom'=>'Les Almadies','ville_id'=>1,'ville_nom'=>'Dakar','region_id'=>1,'region_nom'=>'Dakar','prix_par_nuit'=>35000,'prix_par_mois'=>450000,'nb_chambres'=>2,'nb_salles_bain'=>1,'superficie_m2'=>70,'meuble'=>1,'statut'=>'actif','latitude'=>14.7416,'longitude'=>-17.5048,'note_moyenne'=>4.8,'nb_avis'=>12,'is_verified'=>1,'photo_principale'=>'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&fit=crop','proprio_id'=>2,'proprio_nom'=>'Diallo','proprio_prenom'=>'Oumar','proprio_telephone'=>'+221771234561','equipements'=>['wifi','climatisation','eau_chaude','parking','securite']],

  ['id'=>2,'titre'=>'Chambre climatisée au Plateau','description'=>'Chambre bien équipée dans résidence sécurisée, quartier central. Transport facilement accessible, proche toutes commodités.','type'=>'chambre','adresse'=>'Avenue Roume, Plateau','quartier_id'=>1,'quartier_nom'=>'Plateau','ville_id'=>1,'ville_nom'=>'Dakar','region_id'=>1,'region_nom'=>'Dakar','prix_par_nuit'=>15000,'prix_par_mois'=>180000,'nb_chambres'=>1,'nb_salles_bain'=>1,'superficie_m2'=>20,'meuble'=>1,'statut'=>'actif','latitude'=>14.6918,'longitude'=>-17.4414,'note_moyenne'=>4.2,'nb_avis'=>5,'is_verified'=>1,'photo_principale'=>'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&auto=format&fit=crop','proprio_id'=>2,'proprio_nom'=>'Diallo','proprio_prenom'=>'Oumar','equipements'=>['wifi','climatisation','eau_chaude']],

  ['id'=>3,'titre'=>'Villa 4 chambres Mermoz','description'=>'Grande villa avec jardin et piscine, idéale pour famille ou groupe. Quartier résidentiel calme, gardien 24h/24.','type'=>'villa','adresse'=>'Cité Mermoz Extension','quartier_id'=>4,'quartier_nom'=>'Mermoz','ville_id'=>1,'ville_nom'=>'Dakar','region_id'=>1,'region_nom'=>'Dakar','prix_par_nuit'=>80000,'prix_par_mois'=>950000,'nb_chambres'=>4,'nb_salles_bain'=>3,'superficie_m2'=>250,'meuble'=>1,'statut'=>'actif','latitude'=>14.7244,'longitude'=>-17.4785,'note_moyenne'=>5.0,'nb_avis'=>8,'is_verified'=>1,'photo_principale'=>'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop','proprio_id'=>3,'proprio_nom'=>'Ndiaye','proprio_prenom'=>'Fatou','equipements'=>['wifi','climatisation','eau_chaude','parking','piscine','jardin','securite','gardien']],

  ['id'=>4,'titre'=>'Studio moderne centre Thiès','description'=>'Studio neuf tout équipé, proche transports et marchés.','type'=>'studio','adresse'=>'Avenue Léopold Sédar Senghor','quartier_id'=>9,'quartier_nom'=>'Centre-ville','ville_id'=>6,'ville_nom'=>'Thiès','region_id'=>2,'region_nom'=>'Thiès','prix_par_nuit'=>10000,'prix_par_mois'=>120000,'nb_chambres'=>1,'nb_salles_bain'=>1,'superficie_m2'=>25,'meuble'=>1,'statut'=>'actif','latitude'=>14.7912,'longitude'=>-16.9261,'note_moyenne'=>4.0,'nb_avis'=>3,'is_verified'=>0,'photo_principale'=>'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop','proprio_id'=>2,'proprio_nom'=>'Diallo','proprio_prenom'=>'Oumar','equipements'=>['wifi','climatisation','eau_chaude']],

  ['id'=>5,'titre'=>'Appartement F2 Thiès avec terrasse','description'=>'Appartement calme avec grande terrasse, lumineux et bien ventilé.','type'=>'appartement','adresse'=>'Quartier Thialy','quartier_id'=>10,'quartier_nom'=>'Thialy','ville_id'=>6,'ville_nom'=>'Thiès','region_id'=>2,'region_nom'=>'Thiès','prix_par_nuit'=>18000,'prix_par_mois'=>220000,'nb_chambres'=>2,'nb_salles_bain'=>1,'superficie_m2'=>55,'meuble'=>1,'statut'=>'actif','latitude'=>14.7894,'longitude'=>-16.9315,'note_moyenne'=>4.5,'nb_avis'=>6,'is_verified'=>1,'photo_principale'=>'https://images.unsplash.com/photo-1565372374105-1e96f6e671a3?w=600&auto=format&fit=crop','proprio_id'=>3,'proprio_nom'=>'Ndiaye','proprio_prenom'=>'Fatou','equipements'=>['wifi','ventilateur','eau_chaude','terrasse']],

  ['id'=>6,'titre'=>'Chambre coloniale île de Saint-Louis','description'=>'Charme historique dans le quartier classé UNESCO. Vue sur le fleuve Sénégal depuis la fenêtre.','type'=>'chambre','adresse'=>'Île de Saint-Louis','quartier_id'=>null,'quartier_nom'=>null,'ville_id'=>10,'ville_nom'=>'Saint-Louis','region_id'=>3,'region_nom'=>'Saint-Louis','prix_par_nuit'=>20000,'prix_par_mois'=>250000,'nb_chambres'=>1,'nb_salles_bain'=>1,'superficie_m2'=>30,'meuble'=>1,'statut'=>'actif','latitude'=>16.0293,'longitude'=>-16.4996,'note_moyenne'=>4.7,'nb_avis'=>15,'is_verified'=>1,'photo_principale'=>'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop','proprio_id'=>3,'proprio_nom'=>'Ndiaye','proprio_prenom'=>'Fatou','equipements'=>['wifi','climatisation','eau_chaude']],

  ['id'=>7,'titre'=>'Villa balnéaire Cap Skirring','description'=>'Villa pieds dans l\'eau, idéale vacances en famille. Accès direct plage privée.','type'=>'villa','adresse'=>'Route de la plage','quartier_id'=>null,'quartier_nom'=>null,'ville_id'=>13,'ville_nom'=>'Cap Skirring','region_id'=>4,'region_nom'=>'Ziguinchor','prix_par_nuit'=>60000,'prix_par_mois'=>720000,'nb_chambres'=>3,'nb_salles_bain'=>2,'superficie_m2'=>180,'meuble'=>1,'statut'=>'actif','latitude'=>12.395,'longitude'=>-16.746,'note_moyenne'=>5.0,'nb_avis'=>20,'is_verified'=>1,'photo_principale'=>'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600&auto=format&fit=crop','proprio_id'=>3,'proprio_nom'=>'Ndiaye','proprio_prenom'=>'Fatou','equipements'=>['wifi','climatisation','eau_chaude','parking','piscine','plage']],

  ['id'=>8,'titre'=>'Studio Saly bord de mer','description'=>'Studio climatisé à 200 mètres de la plage de Saly. Accès piscine de la résidence.','type'=>'studio','adresse'=>'Saly Portudal, résidence Le Baobab','quartier_id'=>11,'quartier_nom'=>'Saly Portudal','ville_id'=>7,'ville_nom'=>'Mbour','region_id'=>2,'region_nom'=>'Thiès','prix_par_nuit'=>20000,'prix_par_mois'=>240000,'nb_chambres'=>1,'nb_salles_bain'=>1,'superficie_m2'=>30,'meuble'=>1,'statut'=>'actif','latitude'=>14.4512,'longitude'=>-16.9724,'note_moyenne'=>4.6,'nb_avis'=>9,'is_verified'=>1,'photo_principale'=>'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop','proprio_id'=>2,'proprio_nom'=>'Diallo','proprio_prenom'=>'Oumar','equipements'=>['wifi','climatisation','eau_chaude','piscine','plage']],
];

$AVIS = [
  ['id'=>1,'locataire_id'=>4,'logement_id'=>1,'note'=>5,'commentaire'=>'Excellent appartement, très bien situé aux Almadies. Vue mer magnifique. Je recommande !','nom'=>'Sow','prenom'=>'Ibrahima','created_at'=>'2026-04-15'],
  ['id'=>2,'locataire_id'=>6,'logement_id'=>1,'note'=>5,'commentaire'=>'Parfait pour un séjour professionnel. WiFi excellent, propriétaire très réactif.','nom'=>'Fall','prenom'=>'Mamadou','created_at'=>'2026-03-20'],
  ['id'=>3,'locataire_id'=>5,'logement_id'=>3,'note'=>5,'commentaire'=>'Villa magnifique, piscine superbe, quartier très calme. On reviendra !','nom'=>'Ba','prenom'=>'Aminata','created_at'=>'2026-05-01'],
];

function ok($data, $msg = '', $code = 200) {
  http_response_code($code);
  echo json_encode(['success'=>true,'data'=>$data,'message'=>$msg]);
  exit;
}
function paginated($items, $total, $page, $limit) {
  echo json_encode(['success'=>true,'data'=>$items,'pagination'=>['total'=>$total,'page'=>$page,'limit'=>$limit,'pages'=>ceil($total/max(1,$limit))]]);
  exit;
}

// ── Routing ──────────────────────────────────────────────────────
$method = $_SERVER['REQUEST_METHOD'];
$parts  = explode('/', $uri);
$s0 = $parts[0] ?? '';
$s1 = $parts[1] ?? '';
$id = is_numeric($s1) ? (int)$s1 : null;

// Régions
if ($s0 === 'regions') { ok($GLOBALS['REGIONS']); }

// Villes
if ($s0 === 'villes') {
  $rid   = (int)($_GET['region_id'] ?? 0);
  $items = $rid ? array_values(array_filter($VILLES, fn($v) => $v['region_id'] === $rid)) : $VILLES;
  ok($items);
}

// Quartiers
if ($s0 === 'quartiers') {
  $vid   = (int)($_GET['ville_id'] ?? 0);
  $items = $vid ? array_values(array_filter($QUARTIERS, fn($q) => $q['ville_id'] === $vid)) : $QUARTIERS;
  ok($items);
}

// Auth
if ($s0 === 'auth') {
  if ($method === 'POST' && $s1 === 'login') {
    $body  = json_decode(file_get_contents('php://input'), true) ?? [];
    $email = $body['email'] ?? '';
    $roles = ['admin@locamaison.sn'=>'admin','oumar.diallo@test.sn'=>'proprietaire','fatou.ndiaye@test.sn'=>'proprietaire','ibrahima.sow@test.sn'=>'locataire','aminata.ba@test.sn'=>'locataire'];
    if (!isset($roles[$email]) || ($body['password'] ?? '') !== 'password') {
      http_response_code(401); echo json_encode(['success'=>false,'message'=>'Email ou mot de passe incorrect']); exit;
    }
    $names = ['admin@locamaison.sn'=>['Admin','LocaMaison'],'oumar.diallo@test.sn'=>['Oumar','Diallo'],'fatou.ndiaye@test.sn'=>['Fatou','Ndiaye'],'ibrahima.sow@test.sn'=>['Ibrahima','Sow'],'aminata.ba@test.sn'=>['Aminata','Ba']];
    $role  = $roles[$email];
    $user  = ['id'=>array_search($email,array_keys($roles))+1,'nom'=>$names[$email][1],'prenom'=>$names[$email][0],'email'=>$email,'role'=>$role,'telephone'=>'+221771234561','is_verified'=>true,'is_active'=>true];
    $token = base64_encode(json_encode(['id'=>$user['id'],'email'=>$email,'role'=>$role,'exp'=>time()+604800]));
    ok(['token'=>$token,'user'=>$user]);
  }
  if ($method === 'GET' && $s1 === 'me') {
    $auth  = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $token = str_replace('Bearer ', '', $auth);
    $data  = json_decode(base64_decode($token), true);
    ok($data ?? []);
  }
  if ($method === 'POST' && $s1 === 'register') {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $user = array_merge($body, ['id'=>99,'is_verified'=>false,'is_active'=>true]);
    $token = base64_encode(json_encode(['id'=>99,'email'=>$body['email']??'','role'=>$body['role']??'locataire','exp'=>time()+604800]));
    ok(['token'=>$token,'user'=>$user], 'Inscription réussie', 201);
  }
}

// Logements
if ($s0 === 'logements') {
  if ($method === 'GET' && !$id) {
    $items  = $LOGEMENTS;
    $rid    = $_GET['region_id'] ?? null;
    $vid    = $_GET['ville_id']  ?? null;
    $type   = $_GET['type']      ?? null;
    $meuble = $_GET['meuble']    ?? null;
    $sort   = $_GET['sort']      ?? 'recent';
    $page   = max(1,(int)($_GET['page']??1));
    $limit  = min(50,(int)($_GET['limit']??10));

    if ($rid)    $items = array_values(array_filter($items, fn($l) => $l['region_id'] == $rid));
    if ($vid)    $items = array_values(array_filter($items, fn($l) => $l['ville_id']  == $vid));
    if ($type)   $items = array_values(array_filter($items, fn($l) => $l['type']      === $type));
    if ($meuble !== null && $meuble !== '') $items = array_values(array_filter($items, fn($l) => $l['meuble'] == (int)$meuble));

    usort($items, function($a, $b) use ($sort) {
      return match($sort) {
        'prix_asc'  => $a['prix_par_mois'] <=> $b['prix_par_mois'],
        'prix_desc' => $b['prix_par_mois'] <=> $a['prix_par_mois'],
        'note'      => $b['note_moyenne']  <=> $a['note_moyenne'],
        default     => $b['id'] <=> $a['id'],
      };
    });
    $total  = count($items);
    $paged  = array_slice($items, ($page-1)*$limit, $limit);
    paginated($paged, $total, $page, $limit);
  }
  if ($method === 'GET' && $id) {
    $log = array_values(array_filter($LOGEMENTS, fn($l) => $l['id'] === $id));
    if (!$log) { http_response_code(404); echo json_encode(['success'=>false,'message'=>'Introuvable']); exit; }
    $l = $log[0];
    $l['photos'] = [
      ['id'=>1,'url'=>$l['photo_principale'],'is_principale'=>1],
      ['id'=>2,'url'=>'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&auto=format&fit=crop','is_principale'=>0],
      ['id'=>3,'url'=>'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&auto=format&fit=crop','is_principale'=>0],
    ];
    $l['avis']       = array_values(array_filter($AVIS, fn($a) => $a['logement_id'] === $id));
    $l['nb_reservations_proprio'] = 12;
    ok($l);
  }
  if ($method === 'POST') {
    ok(['id'=>100,'statut'=>'en_attente'], 'Annonce créée — en attente de validation', 201);
  }
}

// Dashboard propriétaire
if ($s0 === 'proprietaire') {
  if ($s1 === 'dashboard') ok(['revenus_mois'=>1450000,'reservations_actives'=>3,'annonces_actives'=>3,'en_attente'=>1,'note_moyenne'=>4.7]);
  if ($s1 === 'annonces')  ok($LOGEMENTS);
  if ($s1 === 'reservations') ok([
    ['id'=>1,'logement_titre'=>'Bel appartement F3 aux Almadies','ville_nom'=>'Dakar','date_debut'=>'2026-06-01','date_fin'=>'2026-06-30','montant_total'=>450000,'statut'=>'confirmee','locataire_nom'=>'Sow','locataire_prenom'=>'Ibrahima','locataire_tel'=>'+221771234563'],
    ['id'=>2,'logement_titre'=>'Villa 4 chambres Mermoz','ville_nom'=>'Dakar','date_debut'=>'2026-06-10','date_fin'=>'2026-06-17','montant_total'=>560000,'statut'=>'en_attente','locataire_nom'=>'Ba','locataire_prenom'=>'Aminata','locataire_tel'=>'+221771234564'],
  ]);
  if ($s1 === 'messages') ok([]);
}

// Dashboard locataire
if ($s0 === 'locataire') {
  if ($s1 === 'reservations') ok([
    ['id'=>1,'logement_id'=>1,'logement_titre'=>'Bel appartement F3 aux Almadies','ville_nom'=>'Dakar','date_debut'=>'2026-04-01','date_fin'=>'2026-04-30','montant_total'=>450000,'statut'=>'terminee','photo_logement'=>'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&auto=format&fit=crop','a_laisse_avis'=>0],
    ['id'=>2,'logement_id'=>4,'logement_titre'=>'Studio moderne centre Thiès','ville_nom'=>'Thiès','date_debut'=>'2026-06-01','date_fin'=>'2026-06-30','montant_total'=>120000,'statut'=>'confirmee','photo_logement'=>'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&auto=format&fit=crop','a_laisse_avis'=>0],
  ]);
  if ($s1 === 'messages') ok([]);
}

// Réservations
if ($s0 === 'reservations' && $method === 'POST') {
  ok(['id'=>50,'statut'=>'en_attente','montant_total'=>450000], 'Réservation créée', 201);
}

// Paiements
if ($s0 === 'paiements') {
  if ($s1 === 'initier')  ok(['checkout_url'=>'#','ref'=>'LM-DEMO-'.rand(1000,9999)]);
  if ($s1 === 'verifier') ok(['paid'=>true,'statut'=>'confirmee']);
}

// Avis
if ($s0 === 'avis' && $method === 'POST') ok(['id'=>99], 'Avis publié', 201);

// Admin stats
if ($s0 === 'admin') {
  if ($s1 === 'stats') ok(['total_logements'=>8,'logements_actifs'=>7,'logements_en_attente'=>1,'logements_inactifs'=>0,'total_reservations'=>24,'reservations_confirmees'=>18,'revenus_mois'=>3850000,'nb_locataires'=>142,'nb_proprietaires'=>38,'logements_par_region'=>array_map(fn($r)=>array_merge($r,['nb_annonces'=>rand(0,50)]),$GLOBALS['REGIONS'])]);
  if ($s1 === 'logements') paginated([['id'=>9,'titre'=>'Maison à valider — Kaolack','proprio_prenom'=>'Seydou','proprio_nom'=>'Thiaw','proprio_email'=>'s.thiaw@mail.sn','ville_nom'=>'Kaolack','region_nom'=>'Kaolack','type'=>'maison','prix_par_mois'=>200000,'created_at'=>'2026-06-01','photo_principale'=>null]], 1, 1, 20);
  if ($s1 === 'users') paginated([
    ['id'=>4,'nom'=>'Sow','prenom'=>'Ibrahima','email'=>'ibrahima.sow@test.sn','role'=>'locataire','is_verified'=>0,'is_active'=>1,'created_at'=>'2026-01-15'],
    ['id'=>5,'nom'=>'Ba','prenom'=>'Aminata','email'=>'aminata.ba@test.sn','role'=>'locataire','is_verified'=>0,'is_active'=>1,'created_at'=>'2026-02-20'],
    ['id'=>2,'nom'=>'Diallo','prenom'=>'Oumar','email'=>'oumar.diallo@test.sn','role'=>'proprietaire','is_verified'=>1,'is_active'=>1,'created_at'=>'2025-12-01'],
  ], 3, 1, 20);
  if ($s1 === 'avis') paginated($GLOBALS['AVIS'], count($GLOBALS['AVIS']), 1, 20);
  if ($s1 === 'stats-regions') ok(array_map(fn($r)=>['region'=>$r['nom'],'nb_annonces'=>rand(2,50),'nb_reservations'=>rand(5,80),'revenus_total'=>rand(500000,5000000),'prix_moyen'=>rand(120000,400000)],$GLOBALS['REGIONS']));
}

// Messages
if ($s0 === 'messages') {
  if ($method === 'POST') ok(['id'=>1],'Message envoyé',201);
  ok([]);
}

http_response_code(404);
echo json_encode(['success'=>false,'message'=>"Route '$uri' introuvable"]);
