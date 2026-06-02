<?php
class AdminController {
    private Logement    $logModel;
    private User        $userModel;
    private Avis        $avisModel;
    private Reservation $resModel;
    private Region      $regionModel;

    public function __construct() {
        $this->logModel    = new Logement();
        $this->userModel   = new User();
        $this->avisModel   = new Avis();
        $this->resModel    = new Reservation();
        $this->regionModel = new Region();
    }

    private function requireAdmin(): array {
        $jwt = AuthJWT::require();
        RoleCheck::require($jwt, 'admin');
        return $jwt;
    }

    public function stats(): void {
        $this->requireAdmin();

        $logStats = $this->logModel->adminStats();
        $resStats = $this->resModel->adminStats();

        Response::success([
            'total_logements'       => (int)$logStats['total_logements'],
            'logements_actifs'      => (int)$logStats['actifs'],
            'logements_en_attente'  => (int)$logStats['en_attente'],
            'logements_inactifs'    => (int)$logStats['inactifs'],
            'total_reservations'    => (int)$resStats['total_reservations'],
            'reservations_confirmees' => (int)$resStats['confirmees'],
            'revenus_mois'          => (float)$resStats['revenus_mois'],
            'nb_locataires'         => $this->userModel->countByRole('locataire'),
            'nb_proprietaires'      => $this->userModel->countByRole('proprietaire'),
            'logements_par_region'  => $this->regionModel->logementsParRegion(),
        ]);
    }

    public function logements(): void {
        $this->requireAdmin();
        $statut = $_GET['statut'] ?? 'en_attente';
        $page   = max(1, (int)($_GET['page']  ?? 1));
        $limit  = min(50, (int)($_GET['limit'] ?? 20));
        $result = $this->logModel->listAdmin($statut, $page, $limit);
        Response::paginated($result['items'], $result['total'], $page, $limit);
    }

    public function validerLogement(int $id): void {
        $this->requireAdmin();
        $body   = json_decode(file_get_contents('php://input'), true) ?? [];
        $statut = $body['statut'] ?? '';

        if (!in_array($statut, ['actif','inactif'], true)) {
            Response::error('Statut invalide (actif ou inactif)', 400);
        }
        $motif = $statut === 'inactif' ? ($body['motif_rejet'] ?? null) : null;
        $this->logModel->valider($id, $statut, $motif);
        Response::success(null, $statut === 'actif' ? 'Annonce validée' : 'Annonce rejetée');
    }

    public function users(): void {
        $this->requireAdmin();
        $page  = max(1, (int)($_GET['page']  ?? 1));
        $limit = min(50, (int)($_GET['limit'] ?? 20));
        $role  = $_GET['role'] ?? null;
        $result = $this->userModel->listPaginated($page, $limit, $role ?: null);
        Response::paginated($result['items'], $result['total'], $page, $limit);
    }

    public function updateUserStatut(int $id): void {
        $this->requireAdmin();
        $body   = json_decode(file_get_contents('php://input'), true) ?? [];
        $actif  = isset($body['actif']) ? (bool)$body['actif'] : true;
        $verified = isset($body['is_verified']) ? (bool)$body['is_verified'] : null;

        $this->userModel->setActive($id, $actif);
        if ($verified !== null) $this->userModel->setVerified($id, $verified);

        Response::success(null, 'Utilisateur mis à jour');
    }

    public function deleteAvis(int $id): void {
        $this->requireAdmin();
        $this->avisModel->delete($id);
        Response::success(null, 'Avis supprimé');
    }

    public function avis(): void {
        $this->requireAdmin();
        $page   = max(1, (int)($_GET['page']  ?? 1));
        $limit  = min(50, (int)($_GET['limit'] ?? 20));
        $result = $this->avisModel->listAll($page, $limit);
        Response::paginated($result['items'], $result['total'], $page, $limit);
    }

    public function statsByRegion(): void {
        $this->requireAdmin();
        Response::success($this->resModel->statsByRegion());
    }
}
