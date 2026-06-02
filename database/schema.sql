-- ================================================================
-- LocaMaison — Schéma MySQL 8 complet + données de test
-- Plateforme immobilière Sénégal
-- ================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS locamaison
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE locamaison;

-- ─────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────
CREATE TABLE users (
    id               INT PRIMARY KEY AUTO_INCREMENT,
    nom              VARCHAR(100)  NOT NULL,
    prenom           VARCHAR(100)  NOT NULL,
    email            VARCHAR(150)  NOT NULL UNIQUE,
    password_hash    VARCHAR(255)  NOT NULL,
    telephone        VARCHAR(20),
    role             ENUM('locataire','proprietaire','admin') NOT NULL DEFAULT 'locataire',
    avatar           VARCHAR(255),
    piece_identite_url VARCHAR(255),
    is_verified      BOOLEAN DEFAULT FALSE,
    is_active        BOOLEAN DEFAULT TRUE,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- GÉOGRAPHIE
-- ─────────────────────────────────────────
CREATE TABLE regions (
    id  INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE villes (
    id        INT PRIMARY KEY AUTO_INCREMENT,
    region_id INT NOT NULL,
    nom       VARCHAR(100) NOT NULL,
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE CASCADE,
    INDEX idx_region (region_id)
) ENGINE=InnoDB;

CREATE TABLE quartiers (
    id       INT PRIMARY KEY AUTO_INCREMENT,
    ville_id INT NOT NULL,
    nom      VARCHAR(100) NOT NULL,
    FOREIGN KEY (ville_id) REFERENCES villes(id) ON DELETE CASCADE,
    INDEX idx_ville (ville_id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- LOGEMENTS
-- ─────────────────────────────────────────
CREATE TABLE logements (
    id               INT PRIMARY KEY AUTO_INCREMENT,
    proprietaire_id  INT NOT NULL,
    titre            VARCHAR(200) NOT NULL,
    description      TEXT,
    type             ENUM('appartement','maison','chambre','villa','studio') NOT NULL,
    adresse          VARCHAR(255),
    quartier_id      INT,
    ville_id         INT NOT NULL,
    region_id        INT NOT NULL,
    prix_par_nuit    DECIMAL(10,2),
    prix_par_mois    DECIMAL(10,2),
    nb_chambres      TINYINT DEFAULT 1,
    nb_salles_bain   TINYINT DEFAULT 1,
    superficie_m2    FLOAT,
    meuble           BOOLEAN DEFAULT FALSE,
    statut           ENUM('actif','inactif','en_attente') DEFAULT 'en_attente',
    latitude         DECIMAL(10,8),
    longitude        DECIMAL(11,8),
    equipements      JSON,
    motif_rejet      TEXT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proprietaire_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quartier_id)    REFERENCES quartiers(id) ON DELETE SET NULL,
    FOREIGN KEY (ville_id)       REFERENCES villes(id),
    FOREIGN KEY (region_id)      REFERENCES regions(id),
    INDEX idx_region  (region_id),
    INDEX idx_ville   (ville_id),
    INDEX idx_prix    (prix_par_mois),
    INDEX idx_statut  (statut),
    INDEX idx_proprio (proprietaire_id)
) ENGINE=InnoDB;

CREATE TABLE photos_logements (
    id           INT PRIMARY KEY AUTO_INCREMENT,
    logement_id  INT NOT NULL,
    url          VARCHAR(255) NOT NULL,
    is_principale BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (logement_id) REFERENCES logements(id) ON DELETE CASCADE,
    INDEX idx_logement (logement_id)
) ENGINE=InnoDB;

CREATE TABLE disponibilites (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    logement_id INT NOT NULL,
    date_debut  DATE NOT NULL,
    date_fin    DATE NOT NULL,
    disponible  BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (logement_id) REFERENCES logements(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- RÉSERVATIONS
-- ─────────────────────────────────────────
CREATE TABLE reservations (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    locataire_id    INT NOT NULL,
    logement_id     INT NOT NULL,
    date_debut      DATE NOT NULL,
    date_fin        DATE NOT NULL,
    type_sejour     ENUM('courte_duree','longue_duree') NOT NULL,
    montant_total   DECIMAL(12,2) NOT NULL,
    statut          ENUM('en_attente','confirmee','annulee','terminee') DEFAULT 'en_attente',
    mode_paiement   ENUM('wave','orange_money','especes'),
    ref_paiement    VARCHAR(100),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (locataire_id) REFERENCES users(id),
    FOREIGN KEY (logement_id)  REFERENCES logements(id),
    INDEX idx_locataire (locataire_id),
    INDEX idx_logement  (logement_id),
    INDEX idx_statut    (statut)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- MESSAGERIE
-- ─────────────────────────────────────────
CREATE TABLE messages (
    id               INT PRIMARY KEY AUTO_INCREMENT,
    expediteur_id    INT NOT NULL,
    destinataire_id  INT NOT NULL,
    reservation_id   INT,
    contenu          TEXT NOT NULL,
    lu               BOOLEAN DEFAULT FALSE,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (expediteur_id)   REFERENCES users(id),
    FOREIGN KEY (destinataire_id) REFERENCES users(id),
    FOREIGN KEY (reservation_id)  REFERENCES reservations(id) ON DELETE SET NULL,
    INDEX idx_expediteur    (expediteur_id),
    INDEX idx_destinataire  (destinataire_id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- AVIS
-- ─────────────────────────────────────────
CREATE TABLE avis (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    locataire_id    INT NOT NULL,
    logement_id     INT NOT NULL,
    reservation_id  INT NOT NULL UNIQUE,
    note            TINYINT NOT NULL CHECK (note BETWEEN 1 AND 5),
    commentaire     TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (locataire_id)   REFERENCES users(id),
    FOREIGN KEY (logement_id)    REFERENCES logements(id),
    FOREIGN KEY (reservation_id) REFERENCES reservations(id),
    INDEX idx_logement (logement_id)
) ENGINE=InnoDB;

-- ================================================================
-- SEED DATA
-- ================================================================

-- 14 régions officielles
INSERT INTO regions (nom) VALUES
('Dakar'),('Thiès'),('Saint-Louis'),('Ziguinchor'),
('Kaolack'),('Diourbel'),('Louga'),('Fatick'),
('Kolda'),('Matam'),('Tambacounda'),('Kaffrine'),
('Sédhiou'),('Kédougou');

-- Villes (5 par région)
INSERT INTO villes (region_id, nom) VALUES
(1,'Dakar'),(1,'Pikine'),(1,'Guédiawaye'),(1,'Rufisque'),(1,'Bargny'),
(2,'Thiès'),(2,'Mbour'),(2,'Tivaouane'),(2,'Joal-Fadiouth'),(2,'Khombole'),
(3,'Saint-Louis'),(3,'Richard-Toll'),(3,'Podor'),(3,'Dagana'),(3,'Ndioum'),
(4,'Ziguinchor'),(4,'Bignona'),(4,'Oussouye'),(4,'Kafountine'),(4,'Cap Skirring'),
(5,'Kaolack'),(5,'Nioro du Rip'),(5,'Guinguinéo'),(5,'Koungheul'),(5,'Ndoffane'),
(6,'Diourbel'),(6,'Mbacké'),(6,'Touba'),(6,'Bambey'),(6,'Gossas'),
(7,'Louga'),(7,'Linguère'),(7,'Kébémer'),(7,'Dahra'),(7,'Coki'),
(8,'Fatick'),(8,'Foundiougne'),(8,'Gossas-Fatick'),(8,'Passy'),(8,'Sokone'),
(9,'Kolda'),(9,'Vélingara'),(9,'Médina Yoro Foulah'),(9,'Dabo'),(9,'Pata'),
(10,'Matam'),(10,'Kanel'),(10,'Ourossogui'),(10,'Ranérou'),(10,'Thilogne'),
(11,'Tambacounda'),(11,'Bakel'),(11,'Goudiry'),(11,'Kidira'),(11,'Koumpentoum'),
(12,'Kaffrine'),(12,'Birkelane'),(12,'Koungheul-Kaffrine'),(12,'Malem-Hodar'),(12,'Nganda'),
(13,'Sédhiou'),(13,'Bounkiling'),(13,'Goudomp'),(13,'Marsassoum'),(13,'Samine'),
(14,'Kédougou'),(14,'Saraya'),(14,'Salémata'),(14,'Fongolimbi'),(14,'Tomboronkoto');

-- Quartiers Dakar (ville_id=1)
INSERT INTO quartiers (ville_id, nom) VALUES
(1,'Plateau'),(1,'Médina'),(1,'Fann - Point E'),(1,'Mermoz'),(1,'Sacré-Cœur'),
(1,'Les Almadies'),(1,'Ouakam'),(1,'Yoff'),(1,'Grand Dakar'),(1,'Bel-Air'),
(1,'Parcelles Assainies'),(1,'Ngor'),(1,'Liberté'),(1,'Sicap'),(1,'Gueule Tapée');

-- Quartiers Thiès (ville_id=6)
INSERT INTO quartiers (ville_id, nom) VALUES
(6,'Centre-ville'),(6,'Nguinth'),(6,'Médina Fall'),(6,'Thialy'),(6,'Randoulène'),
(6,'Tocky Gare'),(6,'Keur Issa'),(6,'Diakhao'),(6,'Fass'),(6,'Mbambara');

-- Quartiers Mbour (ville_id=7)
INSERT INTO quartiers (ville_id, nom) VALUES
(7,'Centre'),(7,'Saly Portudal'),(7,'Tefess'),(7,'Escale'),(7,'Pont');

-- Quartiers Saint-Louis (ville_id=11)
INSERT INTO quartiers (ville_id, nom) VALUES
(11,'Île de Saint-Louis'),(11,'Sor'),(11,'Langue de Barbarie'),(11,'Guet Ndar'),(11,'Pikine Saint-Louis');

-- ── Utilisateurs test (password = "password" pour tous) ──
-- Hash bcrypt de "password" : $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
INSERT INTO users (nom, prenom, email, password_hash, telephone, role, is_verified, is_active) VALUES
('Admin','LocaMaison','admin@locamaison.sn',
 '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 '+221771234560','admin',TRUE,TRUE),
('Diallo','Oumar','oumar.diallo@test.sn',
 '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 '+221771234561','proprietaire',TRUE,TRUE),
('Ndiaye','Fatou','fatou.ndiaye@test.sn',
 '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 '+221771234562','proprietaire',TRUE,TRUE),
('Sow','Ibrahima','ibrahima.sow@test.sn',
 '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 '+221771234563','locataire',FALSE,TRUE),
('Ba','Aminata','aminata.ba@test.sn',
 '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 '+221771234564','locataire',FALSE,TRUE),
('Fall','Mamadou','mamadou.fall@test.sn',
 '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 '+221771234565','locataire',FALSE,TRUE);

-- ── Logements test ──
INSERT INTO logements (proprietaire_id,titre,description,type,adresse,quartier_id,ville_id,region_id,
  prix_par_nuit,prix_par_mois,nb_chambres,nb_salles_bain,superficie_m2,meuble,statut,latitude,longitude,equipements) VALUES
(2,'Bel appartement F3 aux Almadies',
 'Superbe appartement meublé avec vue mer, proche plage des Almadies. Idéal pour séjour courte ou longue durée.',
 'appartement','Rue des Jasmins, Les Almadies',6,1,1,
 35000.00,450000.00,2,1,70.0,TRUE,'actif',14.74160,-17.50480,
 '["wifi","climatisation","eau_chaude","parking","securite"]'),

(2,'Chambre climatisée au Plateau',
 'Chambre bien équipée dans résidence sécurisée, quartier central. Transport facilement accessible.',
 'chambre','Avenue Roume, Plateau',1,1,1,
 15000.00,180000.00,1,1,20.0,TRUE,'actif',14.69185,-17.44148,
 '["wifi","climatisation","eau_chaude"]'),

(3,'Villa 4 chambres Mermoz',
 'Grande villa avec jardin et piscine, idéale pour famille ou groupe. Quartier résidentiel calme.',
 'villa','Cité Mermoz Extension',4,1,1,
 80000.00,950000.00,4,3,250.0,TRUE,'actif',14.72441,-17.47851,
 '["wifi","climatisation","eau_chaude","parking","piscine","jardin","securite","gardien"]'),

(2,'Studio moderne centre Thiès',
 'Studio neuf tout équipé, proche transports et marchés. Parfait pour professionnel.',
 'studio','Avenue Léopold Sédar Senghor',16,6,2,
 10000.00,120000.00,1,1,25.0,TRUE,'actif',14.79122,-16.92610,
 '["wifi","climatisation","eau_chaude"]'),

(3,'Appartement F2 Thiès avec terrasse',
 'Appartement calme avec grande terrasse, lumineux et bien ventilé.',
 'appartement','Quartier Thialy',19,6,2,
 18000.00,220000.00,2,1,55.0,TRUE,'actif',14.78945,-16.93150,
 '["wifi","ventilateur","eau_chaude","terrasse"]'),

(2,'Maison familiale 3 chambres Thiès',
 'Grande maison avec cour intérieure, idéale pour famille. Quartier calme et sécurisé.',
 'maison','Randoulène Nord',20,6,2,
 20000.00,280000.00,3,2,100.0,FALSE,'actif',14.79500,-16.91800,
 '["eau_chaude","parking","cour"]'),

(3,'Chambre coloniale île de Saint-Louis',
 'Chambre avec charme historique dans le quartier classé UNESCO. Ambiance unique.',
 'chambre','Île de Saint-Louis',31,11,3,
 20000.00,250000.00,1,1,30.0,TRUE,'actif',16.02938,-16.49967,
 '["wifi","climatisation","eau_chaude","patrimoine"]'),

(2,'Appartement vue fleuve Saint-Louis',
 'Magnifique appartement avec vue panoramique sur le fleuve Sénégal. Couchers de soleil exceptionnels.',
 'appartement','Sor, rue du Fleuve',32,11,3,
 25000.00,320000.00,2,1,60.0,TRUE,'actif',16.03800,-16.50200,
 '["wifi","climatisation","eau_chaude","parking","vue_fleuve"]'),

(3,'Villa résidentielle Saint-Louis',
 'Belle villa moderne dans quartier calme, toutes commodités.',
 'villa','Langue de Barbarie',33,11,3,
 45000.00,550000.00,3,2,150.0,TRUE,'actif',16.01500,-16.50400,
 '["wifi","climatisation","eau_chaude","parking","jardin"]'),

(2,'Bungalow Casamance Ziguinchor',
 'Bungalow typique entouré de verdure au cœur de la Casamance. Authenticité garantie.',
 'maison','Quartier Lyndiane',NULL,16,4,
 15000.00,180000.00,2,1,60.0,FALSE,'actif',12.55870,-16.27275,
 '["wifi","ventilateur","eau_chaude","jardin","terrasse"]'),

(3,'Villa balnéaire Cap Skirring',
 'Villa pieds dans l\'eau, idéale vacances en famille. Accès direct plage privée.',
 'villa','Route de la plage',NULL,20,4,
 60000.00,720000.00,3,2,180.0,TRUE,'actif',12.39500,-16.74600,
 '["wifi","climatisation","eau_chaude","parking","piscine","plage_privee"]'),

(2,'Studio Saly bord de mer',
 'Studio climatisé à 200 mètres de la plage de Saly. Accès piscine de la résidence.',
 'studio','Saly Portudal, résidence Le Baobab',22,7,2,
 20000.00,240000.00,1,1,30.0,TRUE,'actif',14.45123,-16.97240,
 '["wifi","climatisation","eau_chaude","piscine","plage"]');

-- Photos
INSERT INTO photos_logements (logement_id, url, is_principale) VALUES
(1,'/uploads/placeholder/apt-almadies-1.jpg',TRUE),
(1,'/uploads/placeholder/apt-almadies-2.jpg',FALSE),
(1,'/uploads/placeholder/apt-almadies-3.jpg',FALSE),
(2,'/uploads/placeholder/chambre-plateau-1.jpg',TRUE),
(2,'/uploads/placeholder/chambre-plateau-2.jpg',FALSE),
(3,'/uploads/placeholder/villa-mermoz-1.jpg',TRUE),
(3,'/uploads/placeholder/villa-mermoz-2.jpg',FALSE),
(3,'/uploads/placeholder/villa-mermoz-3.jpg',FALSE),
(4,'/uploads/placeholder/studio-thies-1.jpg',TRUE),
(4,'/uploads/placeholder/studio-thies-2.jpg',FALSE),
(5,'/uploads/placeholder/apt-thies-1.jpg',TRUE),
(5,'/uploads/placeholder/apt-thies-2.jpg',FALSE),
(6,'/uploads/placeholder/maison-thies-1.jpg',TRUE),
(6,'/uploads/placeholder/maison-thies-2.jpg',FALSE),
(7,'/uploads/placeholder/chambre-stlouis-1.jpg',TRUE),
(7,'/uploads/placeholder/chambre-stlouis-2.jpg',FALSE),
(8,'/uploads/placeholder/apt-stlouis-1.jpg',TRUE),
(8,'/uploads/placeholder/apt-stlouis-2.jpg',FALSE),
(9,'/uploads/placeholder/villa-stlouis-1.jpg',TRUE),
(9,'/uploads/placeholder/villa-stlouis-2.jpg',FALSE),
(10,'/uploads/placeholder/bungalow-zig-1.jpg',TRUE),
(10,'/uploads/placeholder/bungalow-zig-2.jpg',FALSE),
(11,'/uploads/placeholder/villa-cap-1.jpg',TRUE),
(11,'/uploads/placeholder/villa-cap-2.jpg',FALSE),
(12,'/uploads/placeholder/studio-saly-1.jpg',TRUE),
(12,'/uploads/placeholder/studio-saly-2.jpg',FALSE);

-- Réservations test
INSERT INTO reservations (locataire_id,logement_id,date_debut,date_fin,type_sejour,montant_total,statut,mode_paiement,ref_paiement) VALUES
(4,1,'2026-04-01','2026-04-30','longue_duree',450000.00,'terminee','wave','WAVE-TEST-0001'),
(5,2,'2026-05-01','2026-05-31','longue_duree',180000.00,'confirmee','orange_money','OM-TEST-0001'),
(6,3,'2026-06-10','2026-06-17','courte_duree',560000.00,'confirmee','wave','WAVE-TEST-0002'),
(4,4,'2026-06-01','2026-06-30','longue_duree',120000.00,'terminee','especes',NULL);

-- Avis test
INSERT INTO avis (locataire_id,logement_id,reservation_id,note,commentaire) VALUES
(4,1,1,5,'Excellent appartement, très bien situé aux Almadies. Propriétaire très accueillant. Vue mer magnifique. Je recommande vivement !'),
(6,3,3,5,'Villa magnifique, parfaite pour la famille. Piscine superbe, quartier très calme. On reviendra avec plaisir !'),
(4,4,4,4,'Studio propre et bien équipé. WiFi rapide, climatisation efficace. Très bon rapport qualité-prix à Thiès.');

SET FOREIGN_KEY_CHECKS = 1;
