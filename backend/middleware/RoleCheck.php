<?php
class RoleCheck {
    public static function require(array $jwt, string ...$roles): void {
        if (!in_array($jwt['role'] ?? '', $roles, true)) {
            Response::error('Accès refusé — droits insuffisants', 403);
        }
    }

    public static function isOwner(array $jwt, int $ownerId): bool {
        return (int)$jwt['id'] === $ownerId;
    }

    public static function requireOwnerOrAdmin(array $jwt, int $ownerId): void {
        if ((int)$jwt['id'] !== $ownerId && $jwt['role'] !== 'admin') {
            Response::error('Accès refusé', 403);
        }
    }
}
