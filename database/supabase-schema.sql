-- ================================================================
-- LocaMaison — Schéma PostgreSQL pour Supabase
-- Copiez-collez ce fichier dans l'éditeur SQL de votre projet Supabase
-- ================================================================

-- ── Tables ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  nom         VARCHAR(100)  NOT NULL,
  prenom      VARCHAR(100)  NOT NULL,
  email       VARCHAR(255)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,
  role        VARCHAR(20)   NOT NULL DEFAULT 'locataire' CHECK (role IN ('admin','proprietaire','locataire')),
  telephone   VARCHAR(30),
  avatar      TEXT,
  is_verified BOOLEAN       NOT NULL DEFAULT false,
  is_active   BOOLEAN       NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS logements (
  id                 SERIAL PRIMARY KEY,
  proprietaire_id    INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  titre              VARCHAR(255) NOT NULL,
  description        TEXT,
  type               VARCHAR(50)  NOT NULL,
  adresse            TEXT,
  quartier_id        INTEGER,
  quartier_nom       VARCHAR(100),
  ville_id           INTEGER,
  ville_nom          VARCHAR(100),
  region_id          INTEGER,
  region_nom         VARCHAR(100),
  prix_par_nuit      INTEGER,
  prix_par_mois      INTEGER,
  nb_chambres        INTEGER      NOT NULL DEFAULT 1,
  nb_salles_bain     INTEGER      NOT NULL DEFAULT 1,
  superficie_m2      INTEGER,
  meuble             BOOLEAN      NOT NULL DEFAULT false,
  statut             VARCHAR(20)  NOT NULL DEFAULT 'actif',
  latitude           DECIMAL(10,7),
  longitude          DECIMAL(10,7),
  equipements        TEXT[]       NOT NULL DEFAULT '{}',
  note_moyenne       DECIMAL(3,1) NOT NULL DEFAULT 0,
  nb_avis            INTEGER      NOT NULL DEFAULT 0,
  photo_principale   TEXT,
  is_verified        BOOLEAN      NOT NULL DEFAULT false,
  proprio_nom        VARCHAR(100),
  proprio_prenom     VARCHAR(100),
  proprio_telephone  VARCHAR(30),
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reservations (
  id               SERIAL PRIMARY KEY,
  locataire_id     INTEGER     NOT NULL REFERENCES users(id),
  logement_id      INTEGER     NOT NULL REFERENCES logements(id),
  proprietaire_id  INTEGER     NOT NULL REFERENCES users(id),
  date_debut       DATE        NOT NULL,
  date_fin         DATE        NOT NULL,
  type_sejour      VARCHAR(20) NOT NULL,
  montant_total    INTEGER     NOT NULL,
  statut           VARCHAR(20) NOT NULL DEFAULT 'en_attente',
  mode_paiement    VARCHAR(50),
  ref_paiement     VARCHAR(100),
  logement_titre   VARCHAR(255),
  ville_nom        VARCHAR(100),
  photo_logement   TEXT,
  locataire_nom    VARCHAR(100),
  locataire_prenom VARCHAR(100),
  locataire_tel    VARCHAR(30),
  a_laisse_avis    BOOLEAN     NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id              SERIAL PRIMARY KEY,
  expediteur_id   INTEGER     NOT NULL REFERENCES users(id),
  destinataire_id INTEGER     NOT NULL REFERENCES users(id),
  reservation_id  INTEGER     REFERENCES reservations(id),
  contenu         TEXT        NOT NULL,
  lu              BOOLEAN     NOT NULL DEFAULT false,
  nom             VARCHAR(100),
  prenom          VARCHAR(100),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS avis (
  id              SERIAL PRIMARY KEY,
  locataire_id    INTEGER     NOT NULL REFERENCES users(id),
  logement_id     INTEGER     NOT NULL REFERENCES logements(id),
  reservation_id  INTEGER     NOT NULL REFERENCES reservations(id),
  note            INTEGER     NOT NULL CHECK (note BETWEEN 1 AND 5),
  commentaire     TEXT,
  nom             VARCHAR(100),
  prenom          VARCHAR(100),
  logement_titre  VARCHAR(255),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id              SERIAL PRIMARY KEY,
  proprietaire_id INTEGER     NOT NULL REFERENCES users(id),
  type            VARCHAR(50) NOT NULL,
  data            JSONB       NOT NULL DEFAULT '{}',
  lu              BOOLEAN     NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Désactiver RLS (le serveur gère l'auth lui-même)
ALTER TABLE users          DISABLE ROW LEVEL SECURITY;
ALTER TABLE logements      DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservations   DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages       DISABLE ROW LEVEL SECURITY;
ALTER TABLE avis           DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications  DISABLE ROW LEVEL SECURITY;

-- ── Données de démo ──────────────────────────────────────────────

INSERT INTO users (id,nom,prenom,email,password,role,telephone,is_verified,is_active) VALUES
(1,'Admin','LocaMaison','admin@locamaison.sn','password','admin','+221771234560',true,true),
(2,'Diallo','Oumar','oumar.diallo@test.sn','password','proprietaire','+221771234561',true,true),
(3,'Ndiaye','Fatou','fatou.ndiaye@test.sn','password','proprietaire','+221771234562',true,true),
(4,'Sow','Ibrahima','ibrahima.sow@test.sn','password','locataire','+221771234563',false,true),
(5,'Ba','Aminata','aminata.ba@test.sn','password','locataire','+221771234564',false,true),
(6,'Fall','Mamadou','mamadou.fall@test.sn','password','locataire','+221771234565',false,true)
ON CONFLICT (id) DO NOTHING;
SELECT setval('users_id_seq', 7);

INSERT INTO logements (id,proprietaire_id,titre,description,type,adresse,quartier_id,quartier_nom,ville_id,ville_nom,region_id,region_nom,prix_par_nuit,prix_par_mois,nb_chambres,nb_salles_bain,superficie_m2,meuble,statut,latitude,longitude,equipements,note_moyenne,nb_avis,photo_principale,is_verified,proprio_nom,proprio_prenom,proprio_telephone) VALUES
(1,2,'Bel appartement F3 aux Almadies','Superbe appartement meublé avec vue mer, proche plage des Almadies.','appartement','Rue des Jasmins, Les Almadies',6,'Les Almadies',1,'Dakar',1,'Dakar',35000,450000,2,1,70,true,'actif',14.7416000,-17.5048000,ARRAY['wifi','climatisation','eau_chaude','parking','securite'],5.0,1,'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop',true,'Diallo','Oumar','+221771234561'),
(2,2,'Chambre climatisée au Plateau','Chambre bien équipée dans résidence sécurisée, quartier central.','chambre','Avenue Roume, Plateau',1,'Plateau',1,'Dakar',1,'Dakar',15000,180000,1,1,20,true,'actif',14.6918500,-17.4414800,ARRAY['wifi','climatisation','eau_chaude'],4.0,1,'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop',true,'Diallo','Oumar','+221771234561'),
(3,3,'Villa 4 chambres Mermoz','Grande villa avec jardin et piscine, idéale pour famille.','villa','Cité Mermoz Extension',4,'Mermoz',1,'Dakar',1,'Dakar',80000,950000,4,3,250,true,'actif',14.7244100,-17.4785100,ARRAY['wifi','climatisation','eau_chaude','parking','piscine','jardin','securite'],5.0,1,'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop',true,'Ndiaye','Fatou','+221771234562'),
(4,2,'Studio moderne centre Thiès','Studio neuf tout équipé, proche transports et marchés.','studio','Avenue Léopold Sédar Senghor',13,'Centre-ville',6,'Thiès',2,'Thiès',10000,120000,1,1,25,true,'actif',14.7912200,-16.9261000,ARRAY['wifi','climatisation','eau_chaude'],4.0,1,'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop',false,'Diallo','Oumar','+221771234561'),
(5,3,'Appartement F2 Thiès avec terrasse','Appartement calme avec grande terrasse, lumineux.','appartement','Quartier Thialy',15,'Thialy',6,'Thiès',2,'Thiès',18000,220000,2,1,55,true,'actif',14.7894500,-16.9315000,ARRAY['wifi','ventilateur','eau_chaude','terrasse'],0.0,0,'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop',false,'Ndiaye','Fatou','+221771234562'),
(6,2,'Maison familiale 3 chambres Thiès','Grande maison avec cour intérieure, idéale pour famille.','maison','Randoulène Nord',16,'Randoulène',6,'Thiès',2,'Thiès',20000,280000,3,2,100,false,'actif',14.7950000,-16.9180000,ARRAY['eau_chaude','parking','cour'],0.0,0,'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&auto=format&fit=crop',false,'Diallo','Oumar','+221771234561'),
(7,3,'Chambre coloniale île de Saint-Louis','Charme historique dans le quartier classé UNESCO.','chambre','Île de Saint-Louis',22,'Île de Saint-Louis',11,'Saint-Louis',3,'Saint-Louis',20000,250000,1,1,30,true,'actif',16.0293800,-16.4996700,ARRAY['wifi','climatisation','eau_chaude'],0.0,0,'https://images.unsplash.com/photo-1582582621959-48d27397dc69?w=800&auto=format&fit=crop',true,'Ndiaye','Fatou','+221771234562'),
(8,2,'Appartement vue fleuve Saint-Louis','Vue panoramique sur le fleuve Sénégal.','appartement','Sor, rue du Fleuve',23,'Sor',11,'Saint-Louis',3,'Saint-Louis',25000,320000,2,1,60,true,'actif',16.0380000,-16.5020000,ARRAY['wifi','climatisation','eau_chaude','parking'],0.0,0,'https://images.unsplash.com/photo-1599427303058-f04cbcf4756f?w=800&auto=format&fit=crop',false,'Diallo','Oumar','+221771234561'),
(9,3,'Bungalow Casamance Ziguinchor','Bungalow typique entouré de verdure.','maison','Quartier Lyndiane',NULL,NULL,16,'Ziguinchor',4,'Ziguinchor',15000,180000,2,1,60,false,'actif',12.5587000,-16.2727500,ARRAY['wifi','ventilateur','eau_chaude','jardin'],0.0,0,'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop',false,'Ndiaye','Fatou','+221771234562'),
(10,3,'Villa balnéaire Cap Skirring','Villa pieds dans l''eau, accès direct plage privée.','villa','Route de la plage',NULL,NULL,20,'Cap Skirring',4,'Ziguinchor',60000,720000,3,2,180,true,'actif',12.3950000,-16.7460000,ARRAY['wifi','climatisation','eau_chaude','parking','piscine','plage'],0.0,0,'https://images.unsplash.com/photo-1615880484746-a134be9a6ecf?w=800&auto=format&fit=crop',true,'Ndiaye','Fatou','+221771234562'),
(11,2,'Studio Saly bord de mer','Studio climatisé à 200m de la plage de Saly.','studio','Saly Portudal, résidence Le Baobab',20,'Saly Portudal',7,'Mbour',2,'Thiès',20000,240000,1,1,30,true,'actif',14.4512300,-16.9724000,ARRAY['wifi','climatisation','eau_chaude','piscine','plage'],0.0,0,'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop',false,'Diallo','Oumar','+221771234561')
ON CONFLICT (id) DO NOTHING;
SELECT setval('logements_id_seq', 12);

INSERT INTO reservations (id,locataire_id,logement_id,proprietaire_id,date_debut,date_fin,type_sejour,montant_total,statut,mode_paiement,ref_paiement,logement_titre,ville_nom,photo_logement,locataire_nom,locataire_prenom,locataire_tel,a_laisse_avis) VALUES
(1,4,1,2,'2026-04-01','2026-04-30','longue_duree',450000,'terminee','wave','WAVE-TEST-0001','Bel appartement F3 aux Almadies','Dakar','https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400','Sow','Ibrahima','+221771234563',true),
(2,5,2,2,'2026-05-01','2026-05-31','longue_duree',180000,'confirmee','orange_money','OM-TEST-0001','Chambre climatisée au Plateau','Dakar','https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400','Ba','Aminata','+221771234564',false),
(3,6,3,3,'2026-06-10','2026-06-17','courte_duree',560000,'confirmee','wave','WAVE-TEST-0002','Villa 4 chambres Mermoz','Dakar','https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400','Fall','Mamadou','+221771234565',false)
ON CONFLICT (id) DO NOTHING;
SELECT setval('reservations_id_seq', 4);

INSERT INTO messages (id,expediteur_id,destinataire_id,reservation_id,contenu,lu,nom,prenom) VALUES
(1,4,2,1,'Bonjour, est-ce que le logement est disponible en juillet ?',true,'Sow','Ibrahima'),
(2,2,4,1,'Oui bien sûr ! Je serais ravi de vous accueillir.',true,'Diallo','Oumar')
ON CONFLICT (id) DO NOTHING;
SELECT setval('messages_id_seq', 3);

INSERT INTO avis (id,locataire_id,logement_id,reservation_id,note,commentaire,nom,prenom,logement_titre) VALUES
(1,4,1,1,5,'Excellent appartement, très bien situé aux Almadies !','Sow','Ibrahima','Bel appartement F3 aux Almadies')
ON CONFLICT (id) DO NOTHING;
SELECT setval('avis_id_seq', 2);
