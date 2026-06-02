<?php
class User {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function findByEmail(string $email): ?array {
        $s = $this->db->prepare('SELECT * FROM users WHERE email = ? AND is_active = 1 LIMIT 1');
        $s->execute([$email]);
        return $s->fetch() ?: null;
    }

    public function findById(int $id): ?array {
        $s = $this->db->prepare(
            'SELECT id,nom,prenom,email,telephone,role,avatar,piece_identite_url,is_verified,is_active,created_at
             FROM users WHERE id = ? LIMIT 1'
        );
        $s->execute([$id]);
        return $s->fetch() ?: null;
    }

    public function create(array $data): int {
        $s = $this->db->prepare(
            'INSERT INTO users (nom,prenom,email,password_hash,telephone,role)
             VALUES (:nom,:prenom,:email,:password_hash,:telephone,:role)'
        );
        $s->execute([
            ':nom'           => $data['nom'],
            ':prenom'        => $data['prenom'],
            ':email'         => $data['email'],
            ':password_hash' => password_hash($data['password'], PASSWORD_BCRYPT),
            ':telephone'     => $data['telephone'] ?? null,
            ':role'          => $data['role'],
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function update(int $id, array $data): void {
        $allowed = ['nom','prenom','telephone','avatar','piece_identite_url'];
        $sets    = [];
        $params  = [':id' => $id];
        foreach ($allowed as $col) {
            if (array_key_exists($col, $data)) {
                $sets[] = "$col = :$col";
                $params[":$col"] = $data[$col];
            }
        }
        if (!$sets) return;
        $this->db->prepare('UPDATE users SET ' . implode(',', $sets) . ' WHERE id = :id')
                 ->execute($params);
    }

    public function updatePassword(int $id, string $password): void {
        $s = $this->db->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
        $s->execute([password_hash($password, PASSWORD_BCRYPT), $id]);
    }

    public function setActive(int $id, bool $active): void {
        $this->db->prepare('UPDATE users SET is_active = ? WHERE id = ?')
                 ->execute([(int)$active, $id]);
    }

    public function setVerified(int $id, bool $verified): void {
        $this->db->prepare('UPDATE users SET is_verified = ? WHERE id = ?')
                 ->execute([(int)$verified, $id]);
    }

    public function listPaginated(int $page, int $limit, ?string $role = null): array {
        $offset = ($page - 1) * $limit;
        $where  = $role ? 'WHERE role = ?' : '';
        $params = $role ? [$role] : [];

        $total = $this->db->prepare("SELECT COUNT(*) FROM users $where");
        $total->execute($params);
        $count = (int)$total->fetchColumn();

        $s = $this->db->prepare(
            "SELECT id,nom,prenom,email,role,telephone,is_verified,is_active,created_at
             FROM users $where ORDER BY created_at DESC LIMIT $limit OFFSET $offset"
        );
        $s->execute($params);
        return ['items' => $s->fetchAll(), 'total' => $count];
    }

    public function countByRole(string $role): int {
        $s = $this->db->prepare('SELECT COUNT(*) FROM users WHERE role = ?');
        $s->execute([$role]);
        return (int)$s->fetchColumn();
    }
}
