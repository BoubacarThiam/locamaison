<?php
class AuthController {
    private User $userModel;

    public function __construct() {
        $this->userModel = new User();
    }

    public function register(): void {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $required = ['nom','prenom','email','password','role'];
        foreach ($required as $f) {
            if (empty($body[$f])) Response::error("Champ requis : $f", 400);
        }

        if (!filter_var($body['email'], FILTER_VALIDATE_EMAIL)) {
            Response::error('Adresse email invalide', 400);
        }
        if (strlen($body['password']) < 6) {
            Response::error('Mot de passe trop court (min. 6 caractères)', 400);
        }
        if (!in_array($body['role'], ['locataire','proprietaire'], true)) {
            Response::error('Rôle invalide', 400);
        }
        if ($body['telephone'] ?? false) {
            if (!preg_match('/^(\+221|00221)?[76]\d{8}$/', $body['telephone'])) {
                Response::error('Numéro de téléphone sénégalais invalide', 400);
            }
        }
        if ($this->userModel->findByEmail($body['email'])) {
            Response::error('Cet email est déjà utilisé', 409);
        }

        $id   = $this->userModel->create($body);
        $user = $this->userModel->findById($id);
        $token = AuthJWT::generate([
            'id'    => $user['id'],
            'email' => $user['email'],
            'role'  => $user['role'],
        ]);

        Response::success(['token' => $token, 'user' => $user], 'Inscription réussie', 201);
    }

    public function login(): void {
        // Rate limiting simple (production : utiliser Redis)
        static $attempts = [];
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $key = 'login_' . $ip;
        // En production, stocker en cache/Redis et limiter à 5/min

        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        if (empty($body['email']) || empty($body['password'])) {
            Response::error('Email et mot de passe requis', 400);
        }

        $user = $this->userModel->findByEmail($body['email']);
        if (!$user || !password_verify($body['password'], $user['password_hash'])) {
            Response::error('Email ou mot de passe incorrect', 401);
        }
        if (!$user['is_active']) {
            Response::error('Compte désactivé. Contactez le support.', 403);
        }

        $token = AuthJWT::generate([
            'id'    => $user['id'],
            'email' => $user['email'],
            'role'  => $user['role'],
        ]);

        unset($user['password_hash']);
        Response::success(['token' => $token, 'user' => $user]);
    }

    public function me(): void {
        $jwt  = AuthJWT::require();
        $user = $this->userModel->findById($jwt['id']);
        if (!$user) Response::error('Utilisateur introuvable', 404);
        Response::success($user);
    }

    public function updateProfile(): void {
        $jwt  = AuthJWT::require();
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $this->userModel->update($jwt['id'], $body);
        $user = $this->userModel->findById($jwt['id']);
        Response::success($user, 'Profil mis à jour');
    }
}
