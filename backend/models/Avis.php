<?php
class Avis {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function create(array $data): int {
        $s = $this->db->prepare(
            'INSERT INTO avis (locataire_id,logement_id,reservation_id,note,commentaire)
             VALUES (:locataire_id,:logement_id,:reservation_id,:note,:commentaire)'
        );
        $s->execute([
            ':locataire_id'   => (int)$data['locataire_id'],
            ':logement_id'    => (int)$data['logement_id'],
            ':reservation_id' => (int)$data['reservation_id'],
            ':note'           => (int)$data['note'],
            ':commentaire'    => $data['commentaire'] ?? null,
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function delete(int $id): void {
        $this->db->prepare('DELETE FROM avis WHERE id = ?')->execute([$id]);
    }

    public function existsForReservation(int $reservationId): bool {
        $s = $this->db->prepare('SELECT COUNT(*) FROM avis WHERE reservation_id = ?');
        $s->execute([$reservationId]);
        return (int)$s->fetchColumn() > 0;
    }

    public function listAll(int $page, int $limit): array {
        $offset = ($page - 1) * $limit;
        $total  = (int)$this->db->query('SELECT COUNT(*) FROM avis')->fetchColumn();
        $s      = $this->db->prepare("
            SELECT a.*, u.nom, u.prenom, l.titre AS logement_titre
            FROM avis a
            JOIN users u    ON u.id = a.locataire_id
            JOIN logements l ON l.id = a.logement_id
            ORDER BY a.created_at DESC
            LIMIT $limit OFFSET $offset
        ");
        $s->execute();
        return ['items' => $s->fetchAll(), 'total' => $total];
    }
}
