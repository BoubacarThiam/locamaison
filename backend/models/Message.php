<?php
class Message {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function send(int $expediteurId, int $destinataireId, string $contenu, ?int $reservationId): int {
        $s = $this->db->prepare(
            'INSERT INTO messages (expediteur_id,destinataire_id,reservation_id,contenu)
             VALUES (?,?,?,?)'
        );
        $s->execute([$expediteurId, $destinataireId, $reservationId, $contenu]);
        return (int)$this->db->lastInsertId();
    }

    public function conversation(int $userId1, int $userId2): array {
        $s = $this->db->prepare("
            SELECT m.*, u.nom, u.prenom, u.avatar
            FROM messages m
            JOIN users u ON u.id = m.expediteur_id
            WHERE (m.expediteur_id = :a AND m.destinataire_id = :b)
               OR (m.expediteur_id = :b2 AND m.destinataire_id = :a2)
            ORDER BY m.created_at ASC
        ");
        $s->execute([':a' => $userId1, ':b' => $userId2, ':b2' => $userId2, ':a2' => $userId1]);
        return $s->fetchAll();
    }

    public function markRead(int $fromId, int $toId): void {
        $s = $this->db->prepare(
            'UPDATE messages SET lu=1 WHERE expediteur_id=? AND destinataire_id=? AND lu=0'
        );
        $s->execute([$fromId, $toId]);
    }

    public function conversationsList(int $userId): array {
        $s = $this->db->prepare("
            SELECT
                CASE WHEN m.expediteur_id = :uid THEN m.destinataire_id ELSE m.expediteur_id END AS interlocuteur_id,
                u.nom, u.prenom, u.avatar,
                m.contenu AS dernier_message,
                m.created_at,
                SUM(CASE WHEN m.destinataire_id = :uid2 AND m.lu = 0 THEN 1 ELSE 0 END) AS non_lus
            FROM messages m
            JOIN users u ON u.id = CASE WHEN m.expediteur_id = :uid3 THEN m.destinataire_id ELSE m.expediteur_id END
            WHERE m.expediteur_id = :uid4 OR m.destinataire_id = :uid5
            GROUP BY interlocuteur_id, u.nom, u.prenom, u.avatar, m.contenu, m.created_at
            ORDER BY m.created_at DESC
        ");
        $s->execute([
            ':uid'  => $userId, ':uid2' => $userId, ':uid3' => $userId,
            ':uid4' => $userId, ':uid5' => $userId,
        ]);
        return $s->fetchAll();
    }
}
