<?php
class Logement {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function search(array $filters, int $page, int $limit, string $sort): array {
        $where  = ['l.statut = "actif"'];
        $params = [];

        if (!empty($filters['region_id'])) {
            $where[] = 'l.region_id = :region_id';
            $params[':region_id'] = (int)$filters['region_id'];
        }
        if (!empty($filters['ville_id'])) {
            $where[] = 'l.ville_id = :ville_id';
            $params[':ville_id'] = (int)$filters['ville_id'];
        }
        if (!empty($filters['quartier_id'])) {
            $where[] = 'l.quartier_id = :quartier_id';
            $params[':quartier_id'] = (int)$filters['quartier_id'];
        }
        if (!empty($filters['type'])) {
            $where[] = 'l.type = :type';
            $params[':type'] = $filters['type'];
        }
        if (!empty($filters['meuble'])) {
            $where[] = 'l.meuble = :meuble';
            $params[':meuble'] = $filters['meuble'] === '1' ? 1 : 0;
        }
        if (!empty($filters['nb_chambres'])) {
            $nb = (int)$filters['nb_chambres'];
            if ($nb >= 4) {
                $where[] = 'l.nb_chambres >= 4';
            } else {
                $where[] = 'l.nb_chambres = :nb_chambres';
                $params[':nb_chambres'] = $nb;
            }
        }

        // Prix selon type de séjour
        $priceCol = (!empty($filters['type_sejour']) && $filters['type_sejour'] === 'courte_duree')
                    ? 'l.prix_par_nuit' : 'l.prix_par_mois';

        if (!empty($filters['prix_min'])) {
            $where[] = "$priceCol >= :prix_min";
            $params[':prix_min'] = (float)$filters['prix_min'];
        }
        if (!empty($filters['prix_max'])) {
            $where[] = "$priceCol <= :prix_max";
            $params[':prix_max'] = (float)$filters['prix_max'];
        }

        $whereSQL = 'WHERE ' . implode(' AND ', $where);

        $orderMap = [
            'prix_asc'  => "$priceCol ASC",
            'prix_desc' => "$priceCol DESC",
            'note'      => 'note_moyenne DESC',
            'recent'    => 'l.created_at DESC',
        ];
        $orderSQL = 'ORDER BY ' . ($orderMap[$sort] ?? 'l.created_at DESC');

        // Count
        $countSQL = "SELECT COUNT(*) FROM logements l $whereSQL";
        $stCount  = $this->db->prepare($countSQL);
        $stCount->execute($params);
        $total = (int)$stCount->fetchColumn();

        // Data
        $offset  = ($page - 1) * $limit;
        $dataSQL = "
            SELECT l.*,
                   v.nom AS ville_nom, r.nom AS region_nom,
                   q.nom AS quartier_nom,
                   u.nom AS proprio_nom, u.prenom AS proprio_prenom, u.avatar AS proprio_avatar,
                   COALESCE(AVG(a.note), 0) AS note_moyenne,
                   COUNT(DISTINCT a.id)     AS nb_avis,
                   ph.url AS photo_principale
            FROM logements l
            JOIN villes v     ON v.id = l.ville_id
            JOIN regions r    ON r.id = l.region_id
            LEFT JOIN quartiers q ON q.id = l.quartier_id
            JOIN users u      ON u.id = l.proprietaire_id
            LEFT JOIN avis a  ON a.logement_id = l.id
            LEFT JOIN photos_logements ph ON ph.logement_id = l.id AND ph.is_principale = 1
            $whereSQL
            GROUP BY l.id, v.nom, r.nom, q.nom, u.nom, u.prenom, u.avatar, ph.url
            $orderSQL
            LIMIT $limit OFFSET $offset";

        $stData = $this->db->prepare($dataSQL);
        $stData->execute($params);
        return ['items' => $stData->fetchAll(), 'total' => $total];
    }

    public function findById(int $id): ?array {
        $s = $this->db->prepare("
            SELECT l.*,
                   v.nom AS ville_nom, r.nom AS region_nom,
                   q.nom AS quartier_nom,
                   u.id AS proprio_id, u.nom AS proprio_nom, u.prenom AS proprio_prenom,
                   u.avatar AS proprio_avatar, u.telephone AS proprio_telephone,
                   COALESCE(AVG(a.note), 0) AS note_moyenne,
                   COUNT(DISTINCT a.id) AS nb_avis,
                   COUNT(DISTINCT res.id) AS nb_reservations_proprio
            FROM logements l
            JOIN villes v    ON v.id = l.ville_id
            JOIN regions r   ON r.id = l.region_id
            LEFT JOIN quartiers q ON q.id = l.quartier_id
            JOIN users u     ON u.id = l.proprietaire_id
            LEFT JOIN avis a ON a.logement_id = l.id
            LEFT JOIN reservations res ON res.logement_id = l.id
            WHERE l.id = ?
            GROUP BY l.id, v.nom, r.nom, q.nom,
                     u.id, u.nom, u.prenom, u.avatar, u.telephone
        ");
        $s->execute([$id]);
        $row = $s->fetch();
        if (!$row) return null;

        $row['photos']      = $this->getPhotos($id);
        $row['avis']        = $this->getAvis($id);
        $row['equipements'] = json_decode($row['equipements'] ?? '[]', true);

        return $row;
    }

    public function create(int $proprietaireId, array $data): int {
        $s = $this->db->prepare("
            INSERT INTO logements
              (proprietaire_id,titre,description,type,adresse,quartier_id,ville_id,region_id,
               prix_par_nuit,prix_par_mois,nb_chambres,nb_salles_bain,superficie_m2,meuble,
               latitude,longitude,equipements,statut)
            VALUES
              (:proprietaire_id,:titre,:description,:type,:adresse,:quartier_id,:ville_id,:region_id,
               :prix_par_nuit,:prix_par_mois,:nb_chambres,:nb_salles_bain,:superficie_m2,:meuble,
               :latitude,:longitude,:equipements,'en_attente')
        ");
        $s->execute([
            ':proprietaire_id' => $proprietaireId,
            ':titre'           => $data['titre'],
            ':description'     => $data['description'] ?? null,
            ':type'            => $data['type'],
            ':adresse'         => $data['adresse'] ?? null,
            ':quartier_id'     => $data['quartier_id'] ? (int)$data['quartier_id'] : null,
            ':ville_id'        => (int)$data['ville_id'],
            ':region_id'       => (int)$data['region_id'],
            ':prix_par_nuit'   => $data['prix_par_nuit'] ? (float)$data['prix_par_nuit'] : null,
            ':prix_par_mois'   => $data['prix_par_mois'] ? (float)$data['prix_par_mois'] : null,
            ':nb_chambres'     => (int)($data['nb_chambres'] ?? 1),
            ':nb_salles_bain'  => (int)($data['nb_salles_bain'] ?? 1),
            ':superficie_m2'   => $data['superficie_m2'] ? (float)$data['superficie_m2'] : null,
            ':meuble'          => isset($data['meuble']) ? (int)$data['meuble'] : 0,
            ':latitude'        => $data['latitude'] ? (float)$data['latitude'] : null,
            ':longitude'       => $data['longitude'] ? (float)$data['longitude'] : null,
            ':equipements'     => json_encode($data['equipements'] ?? []),
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function update(int $id, array $data): void {
        $allowed = ['titre','description','type','adresse','quartier_id','ville_id','region_id',
                    'prix_par_nuit','prix_par_mois','nb_chambres','nb_salles_bain','superficie_m2',
                    'meuble','latitude','longitude','equipements'];
        $sets   = [];
        $params = [':id' => $id];
        foreach ($allowed as $col) {
            if (array_key_exists($col, $data)) {
                $sets[] = "$col = :$col";
                $val    = $data[$col];
                if ($col === 'equipements' && is_array($val)) $val = json_encode($val);
                $params[":$col"] = $val;
            }
        }
        if (!$sets) return;
        $this->db->prepare('UPDATE logements SET ' . implode(',', $sets) . ' WHERE id = :id')
                 ->execute($params);
    }

    public function delete(int $id): void {
        $this->db->prepare('DELETE FROM logements WHERE id = ?')->execute([$id]);
    }

    public function getProprietaireId(int $logementId): ?int {
        $s = $this->db->prepare('SELECT proprietaire_id FROM logements WHERE id = ?');
        $s->execute([$logementId]);
        $r = $s->fetchColumn();
        return $r !== false ? (int)$r : null;
    }

    public function addPhoto(int $logementId, string $url, bool $principale = false): int {
        if ($principale) {
            $this->db->prepare('UPDATE photos_logements SET is_principale=0 WHERE logement_id=?')
                     ->execute([$logementId]);
        }
        $s = $this->db->prepare(
            'INSERT INTO photos_logements (logement_id,url,is_principale) VALUES (?,?,?)'
        );
        $s->execute([$logementId, $url, (int)$principale]);
        return (int)$this->db->lastInsertId();
    }

    public function deletePhoto(int $photoId): ?string {
        $s = $this->db->prepare('SELECT url FROM photos_logements WHERE id = ?');
        $s->execute([$photoId]);
        $url = $s->fetchColumn();
        if (!$url) return null;
        $this->db->prepare('DELETE FROM photos_logements WHERE id = ?')->execute([$photoId]);
        return $url;
    }

    public function getPhotos(int $logementId): array {
        $s = $this->db->prepare(
            'SELECT * FROM photos_logements WHERE logement_id = ? ORDER BY is_principale DESC, id'
        );
        $s->execute([$logementId]);
        return $s->fetchAll();
    }

    public function getAvis(int $logementId, int $limit = 10): array {
        $s = $this->db->prepare("
            SELECT a.*, u.nom, u.prenom, u.avatar
            FROM avis a JOIN users u ON u.id = a.locataire_id
            WHERE a.logement_id = ?
            ORDER BY a.created_at DESC
            LIMIT $limit
        ");
        $s->execute([$logementId]);
        return $s->fetchAll();
    }

    public function byProprietaire(int $proprietaireId): array {
        $s = $this->db->prepare("
            SELECT l.*, v.nom AS ville_nom, r.nom AS region_nom,
                   COALESCE(AVG(a.note),0) AS note_moyenne,
                   ph.url AS photo_principale
            FROM logements l
            JOIN villes v  ON v.id = l.ville_id
            JOIN regions r ON r.id = l.region_id
            LEFT JOIN avis a ON a.logement_id = l.id
            LEFT JOIN photos_logements ph ON ph.logement_id = l.id AND ph.is_principale = 1
            WHERE l.proprietaire_id = ?
            GROUP BY l.id, v.nom, r.nom, ph.url
            ORDER BY l.created_at DESC
        ");
        $s->execute([$proprietaireId]);
        return $s->fetchAll();
    }

    public function valider(int $id, string $statut, ?string $motif = null): void {
        $s = $this->db->prepare('UPDATE logements SET statut=?, motif_rejet=? WHERE id=?');
        $s->execute([$statut, $motif, $id]);
    }

    public function dashboardStats(int $proprietaireId): array {
        $sql = "
            SELECT
                COUNT(DISTINCT l.id) AS total_annonces,
                COUNT(DISTINCT CASE WHEN l.statut='actif'      THEN l.id END) AS annonces_actives,
                COUNT(DISTINCT CASE WHEN l.statut='en_attente' THEN l.id END) AS en_attente,
                COUNT(DISTINCT CASE WHEN res.statut='confirmee' THEN res.id END) AS reservations_actives,
                COALESCE(SUM(CASE WHEN res.statut='confirmee'
                    AND MONTH(res.created_at)=MONTH(NOW())
                    AND YEAR(res.created_at)=YEAR(NOW())
                    THEN res.montant_total END),0) AS revenus_mois,
                COALESCE(AVG(a.note),0) AS note_moyenne
            FROM logements l
            LEFT JOIN reservations res ON res.logement_id = l.id
            LEFT JOIN avis a ON a.logement_id = l.id
            WHERE l.proprietaire_id = ?
        ";
        $s = $this->db->prepare($sql);
        $s->execute([$proprietaireId]);
        return $s->fetch();
    }

    public function adminStats(): array {
        $s = $this->db->query("
            SELECT
                COUNT(*) AS total_logements,
                SUM(statut='actif')      AS actifs,
                SUM(statut='en_attente') AS en_attente,
                SUM(statut='inactif')    AS inactifs
            FROM logements
        ");
        return $s->fetch();
    }

    public function listAdmin(string $statut, int $page, int $limit): array {
        $offset = ($page - 1) * $limit;
        $total  = $this->db->prepare('SELECT COUNT(*) FROM logements WHERE statut = ?');
        $total->execute([$statut]);
        $count  = (int)$total->fetchColumn();

        $s = $this->db->prepare("
            SELECT l.*, v.nom AS ville_nom, r.nom AS region_nom,
                   u.nom AS proprio_nom, u.prenom AS proprio_prenom, u.email AS proprio_email,
                   ph.url AS photo_principale
            FROM logements l
            JOIN villes v  ON v.id = l.ville_id
            JOIN regions r ON r.id = l.region_id
            JOIN users u   ON u.id = l.proprietaire_id
            LEFT JOIN photos_logements ph ON ph.logement_id = l.id AND ph.is_principale = 1
            WHERE l.statut = ?
            ORDER BY l.created_at DESC
            LIMIT $limit OFFSET $offset
        ");
        $s->execute([$statut]);
        return ['items' => $s->fetchAll(), 'total' => $count];
    }
}
