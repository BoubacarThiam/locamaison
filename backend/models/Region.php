<?php
class Region {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function allRegions(): array {
        return $this->db->query('SELECT * FROM regions ORDER BY nom')->fetchAll();
    }

    public function villesByRegion(int $regionId): array {
        $s = $this->db->prepare('SELECT * FROM villes WHERE region_id = ? ORDER BY nom');
        $s->execute([$regionId]);
        return $s->fetchAll();
    }

    public function quartiersByVille(int $villeId): array {
        $s = $this->db->prepare('SELECT * FROM quartiers WHERE ville_id = ? ORDER BY nom');
        $s->execute([$villeId]);
        return $s->fetchAll();
    }

    public function logementsParRegion(): array {
        $sql = '
            SELECT r.id, r.nom,
                   COUNT(l.id) AS nb_annonces
            FROM regions r
            LEFT JOIN logements l ON l.region_id = r.id AND l.statut = "actif"
            GROUP BY r.id, r.nom
            ORDER BY nb_annonces DESC';
        return $this->db->query($sql)->fetchAll();
    }
}
