<?php
class Reservation {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function create(array $data): int {
        $s = $this->db->prepare("
            INSERT INTO reservations
              (locataire_id,logement_id,date_debut,date_fin,type_sejour,montant_total,mode_paiement)
            VALUES
              (:locataire_id,:logement_id,:date_debut,:date_fin,:type_sejour,:montant_total,:mode_paiement)
        ");
        $s->execute([
            ':locataire_id'  => (int)$data['locataire_id'],
            ':logement_id'   => (int)$data['logement_id'],
            ':date_debut'    => $data['date_debut'],
            ':date_fin'      => $data['date_fin'],
            ':type_sejour'   => $data['type_sejour'],
            ':montant_total' => (float)$data['montant_total'],
            ':mode_paiement' => $data['mode_paiement'] ?? null,
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function findById(int $id): ?array {
        $s = $this->db->prepare("
            SELECT res.*,
                   l.titre AS logement_titre, l.prix_par_nuit, l.prix_par_mois,
                   ph.url  AS photo_logement,
                   v.nom   AS ville_nom,
                   u_loc.nom    AS locataire_nom,    u_loc.prenom    AS locataire_prenom,
                   u_loc.email  AS locataire_email,  u_loc.telephone AS locataire_tel,
                   u_prop.id    AS proprietaire_id
            FROM reservations res
            JOIN logements l     ON l.id   = res.logement_id
            JOIN villes v        ON v.id   = l.ville_id
            JOIN users u_loc     ON u_loc.id  = res.locataire_id
            JOIN users u_prop    ON u_prop.id = l.proprietaire_id
            LEFT JOIN photos_logements ph ON ph.logement_id = l.id AND ph.is_principale = 1
            WHERE res.id = ?
        ");
        $s->execute([$id]);
        return $s->fetch() ?: null;
    }

    public function byLocataire(int $locataireId): array {
        $s = $this->db->prepare("
            SELECT res.*,
                   l.titre AS logement_titre, v.nom AS ville_nom,
                   ph.url  AS photo_logement,
                   EXISTS(SELECT 1 FROM avis a WHERE a.reservation_id = res.id) AS a_laisse_avis
            FROM reservations res
            JOIN logements l ON l.id = res.logement_id
            JOIN villes v    ON v.id = l.ville_id
            LEFT JOIN photos_logements ph ON ph.logement_id = l.id AND ph.is_principale = 1
            WHERE res.locataire_id = ?
            ORDER BY res.created_at DESC
        ");
        $s->execute([$locataireId]);
        return $s->fetchAll();
    }

    public function byProprietaire(int $proprietaireId): array {
        $s = $this->db->prepare("
            SELECT res.*,
                   l.titre AS logement_titre, v.nom AS ville_nom,
                   u.nom   AS locataire_nom, u.prenom AS locataire_prenom,
                   u.telephone AS locataire_tel, u.avatar AS locataire_avatar
            FROM reservations res
            JOIN logements l ON l.id = res.logement_id
            JOIN villes v    ON v.id = l.ville_id
            JOIN users u     ON u.id = res.locataire_id
            WHERE l.proprietaire_id = ?
            ORDER BY res.created_at DESC
        ");
        $s->execute([$proprietaireId]);
        return $s->fetchAll();
    }

    public function updateStatut(int $id, string $statut): void {
        $this->db->prepare('UPDATE reservations SET statut = ? WHERE id = ?')
                 ->execute([$statut, $id]);
    }

    public function updatePaiement(int $id, string $ref, string $statut): void {
        $this->db->prepare('UPDATE reservations SET ref_paiement=?, statut=? WHERE id=?')
                 ->execute([$ref, $statut, $id]);
    }

    public function findByRef(string $ref): ?array {
        $s = $this->db->prepare('SELECT * FROM reservations WHERE ref_paiement = ? LIMIT 1');
        $s->execute([$ref]);
        return $s->fetch() ?: null;
    }

    public function checkConflict(int $logementId, string $debut, string $fin): bool {
        $s = $this->db->prepare("
            SELECT COUNT(*) FROM reservations
            WHERE logement_id = ?
              AND statut IN ('en_attente','confirmee')
              AND date_debut < ? AND date_fin > ?
        ");
        $s->execute([$logementId, $fin, $debut]);
        return (int)$s->fetchColumn() > 0;
    }

    public function adminStats(): array {
        $s = $this->db->query("
            SELECT
                COUNT(*) AS total_reservations,
                SUM(statut='confirmee') AS confirmees,
                SUM(statut='en_attente') AS en_attente,
                COALESCE(SUM(CASE WHEN statut='confirmee'
                    AND MONTH(created_at)=MONTH(NOW())
                    AND YEAR(created_at)=YEAR(NOW())
                    THEN montant_total END),0) AS revenus_mois
            FROM reservations
        ");
        return $s->fetch();
    }

    public function statsByRegion(): array {
        $s = $this->db->query("
            SELECT r.nom AS region,
                   COUNT(DISTINCT l.id)   AS nb_annonces,
                   COUNT(DISTINCT res.id) AS nb_reservations,
                   COALESCE(SUM(res.montant_total),0) AS revenus_total,
                   COALESCE(AVG(l.prix_par_mois),0)   AS prix_moyen
            FROM regions r
            LEFT JOIN logements l    ON l.region_id = r.id AND l.statut = 'actif'
            LEFT JOIN reservations res ON res.logement_id = l.id AND res.statut = 'confirmee'
            GROUP BY r.id, r.nom
            ORDER BY nb_reservations DESC
        ");
        return $s->fetchAll();
    }
}
