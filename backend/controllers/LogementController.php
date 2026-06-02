<?php
class LogementController {
    private Logement $model;

    public function __construct() {
        $this->model = new Logement();
    }

    public function search(): void {
        $filters = [
            'region_id'    => $_GET['region_id']   ?? null,
            'ville_id'     => $_GET['ville_id']    ?? null,
            'quartier_id'  => $_GET['quartier_id'] ?? null,
            'type'         => $_GET['type']        ?? null,
            'meuble'       => $_GET['meuble']      ?? null,
            'nb_chambres'  => $_GET['nb_chambres'] ?? null,
            'prix_min'     => $_GET['prix_min']    ?? null,
            'prix_max'     => $_GET['prix_max']    ?? null,
            'type_sejour'  => $_GET['type_sejour'] ?? null,
        ];
        $page  = max(1, (int)($_GET['page']  ?? 1));
        $limit = min(50, max(1, (int)($_GET['limit'] ?? 10)));
        $sort  = $_GET['sort'] ?? 'recent';

        $result = $this->model->search($filters, $page, $limit, $sort);
        Response::paginated($result['items'], $result['total'], $page, $limit);
    }

    public function show(int $id): void {
        $logement = $this->model->findById($id);
        if (!$logement) Response::error('Logement introuvable', 404);
        Response::success($logement);
    }

    // ── Propriétaire ────────────────────────────────────────────
    public function create(): void {
        $jwt = AuthJWT::require();
        RoleCheck::require($jwt, 'proprietaire');

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        foreach (['titre','type','ville_id','region_id'] as $f) {
            if (empty($body[$f])) Response::error("Champ requis : $f", 400);
        }
        if (empty($body['prix_par_nuit']) && empty($body['prix_par_mois'])) {
            Response::error('Au moins un prix (nuit ou mois) est requis', 400);
        }

        $id = $this->model->create((int)$jwt['id'], $body);
        $logement = $this->model->findById($id);
        Response::success($logement, 'Annonce créée — en attente de validation', 201);
    }

    public function update(int $id): void {
        $jwt      = AuthJWT::require();
        $ownerId  = $this->model->getProprietaireId($id);
        if (!$ownerId) Response::error('Logement introuvable', 404);
        RoleCheck::requireOwnerOrAdmin($jwt, $ownerId);

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $this->model->update($id, $body);
        Response::success($this->model->findById($id), 'Annonce mise à jour');
    }

    public function delete(int $id): void {
        $jwt     = AuthJWT::require();
        $ownerId = $this->model->getProprietaireId($id);
        if (!$ownerId) Response::error('Logement introuvable', 404);
        RoleCheck::requireOwnerOrAdmin($jwt, $ownerId);
        $this->model->delete($id);
        Response::success(null, 'Annonce supprimée');
    }

    public function uploadPhotos(int $id): void {
        $jwt     = AuthJWT::require();
        $ownerId = $this->model->getProprietaireId($id);
        if (!$ownerId) Response::error('Logement introuvable', 404);
        RoleCheck::requireOwnerOrAdmin($jwt, $ownerId);

        $photos = $_FILES['photos'] ?? null;
        if (!$photos) Response::error('Aucune photo envoyée', 400);

        $existingCount = count($this->model->getPhotos($id));
        $results       = [];

        // Normalise le tableau $_FILES pour gérer upload multiple
        $files = [];
        if (is_array($photos['name'])) {
            for ($i = 0; $i < count($photos['name']); $i++) {
                $files[] = [
                    'name'     => $photos['name'][$i],
                    'tmp_name' => $photos['tmp_name'][$i],
                    'size'     => $photos['size'][$i],
                    'error'    => $photos['error'][$i],
                ];
            }
        } else {
            $files[] = $photos;
        }

        if ($existingCount + count($files) > 10) {
            Response::error('Maximum 10 photos par annonce', 400);
        }

        foreach ($files as $i => $file) {
            $url        = Upload::handlePhoto($file, "logement{$id}");
            $principale = ($existingCount === 0 && $i === 0);
            $photoId    = $this->model->addPhoto($id, $url, $principale);
            $results[]  = ['id' => $photoId, 'url' => $url, 'is_principale' => $principale];
        }

        Response::success($results, 'Photos téléchargées', 201);
    }

    public function deletePhoto(int $photoId): void {
        $jwt = AuthJWT::require();
        $url = $this->model->deletePhoto($photoId);
        if (!$url) Response::error('Photo introuvable', 404);
        Upload::deletePhoto($url);
        Response::success(null, 'Photo supprimée');
    }

    // ── Dashboard propriétaire ───────────────────────────────────
    public function proprietaireDashboard(): void {
        $jwt  = AuthJWT::require();
        RoleCheck::require($jwt, 'proprietaire');
        $stats = $this->model->dashboardStats((int)$jwt['id']);
        Response::success($stats);
    }

    public function mesAnnonces(): void {
        $jwt = AuthJWT::require();
        RoleCheck::require($jwt, 'proprietaire');
        Response::success($this->model->byProprietaire((int)$jwt['id']));
    }
}
