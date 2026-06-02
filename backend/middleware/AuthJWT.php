<?php
class AuthJWT {
    // ── Génère un token JWT HS256 ────────────────────────────────
    public static function generate(array $payload): string {
        $header  = self::b64url(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
        $payload['iat'] = time();
        $payload['exp'] = time() + JWT_EXPIRY;
        $body = self::b64url(json_encode($payload));
        $sig  = self::b64url(hash_hmac('sha256', "$header.$body", JWT_SECRET, true));
        return "$header.$body.$sig";
    }

    // ── Vérifie et décode un token ───────────────────────────────
    public static function verify(string $token): ?array {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;
        [$header, $body, $sig] = $parts;

        $expected = self::b64url(hash_hmac('sha256', "$header.$body", JWT_SECRET, true));
        if (!hash_equals($expected, $sig)) return null;

        $data = json_decode(self::b64urldecode($body), true);
        if (!$data || ($data['exp'] ?? 0) < time()) return null;

        return $data;
    }

    // ── Lit le header Authorization ──────────────────────────────
    public static function fromHeader(): ?array {
        $headers = getallheaders();
        $auth    = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (!str_starts_with($auth, 'Bearer ')) return null;
        return self::verify(substr($auth, 7));
    }

    // ── Exige un JWT valide, sinon 401 ───────────────────────────
    public static function require(): array {
        $data = self::fromHeader();
        if (!$data) Response::error('Non authentifié', 401);
        return $data;
    }

    private static function b64url(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function b64urldecode(string $data): string {
        return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', (4 - strlen($data) % 4) % 4));
    }
}
