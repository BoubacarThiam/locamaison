<?php
class ReservationController {
    private Reservation $model;
    private Logement    $logModel;

    public function __construct() {
        $this->model    = new Reservation();
        $this->logModel = new Logement();
    }

    public function create(): void {
        $jwt  = AuthJWT::require();
        RoleCheck::require($jwt, 'locataire');

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        foreach (['logement_id','date_debut','date_fin','type_sejour','mode_paiement'] as $f) {
            if (empty($body[$f])) Response::error("Champ requis : $f", 400);
        }

        $logement = $this->logModel->findById((int)$body['logement_id']);
        if (!$logement || $logement['statut'] !== 'actif') {
            Response::error('Logement indisponible', 404);
        }

        if ($this->model->checkConflict((int)$body['logement_id'], $body['date_debut'], $body['date_fin'])) {
            Response::error('Ce logement est déjà réservé pour ces dates', 409);
        }

        // Calcul montant
        $debut  = new DateTime($body['date_debut']);
        $fin    = new DateTime($body['date_fin']);
        $jours  = max(1, $debut->diff($fin)->days);
        $mois   = $jours / 30;

        if ($body['type_sejour'] === 'courte_duree') {
            $montant = $jours * (float)($logement['prix_par_nuit'] ?? 0);
        } else {
            $montant = round($mois, 1) * (float)($logement['prix_par_mois'] ?? 0);
        }
        if ($montant <= 0) Response::error('Montant invalide — vérifiez les prix du logement', 400);

        $body['locataire_id']  = $jwt['id'];
        $body['montant_total'] = $montant;

        $id          = $this->model->create($body);
        $reservation = $this->model->findById($id);
        Response::success($reservation, 'Réservation créée', 201);
    }

    public function mesReservations(): void {
        $jwt = AuthJWT::require();
        RoleCheck::require($jwt, 'locataire');
        Response::success($this->model->byLocataire((int)$jwt['id']));
    }

    public function reservationsProprietaire(): void {
        $jwt = AuthJWT::require();
        RoleCheck::require($jwt, 'proprietaire');
        Response::success($this->model->byProprietaire((int)$jwt['id']));
    }

    public function updateStatut(int $id): void {
        $jwt         = AuthJWT::require();
        $reservation = $this->model->findById($id);
        if (!$reservation) Response::error('Réservation introuvable', 404);

        $body   = json_decode(file_get_contents('php://input'), true) ?? [];
        $statut = $body['statut'] ?? '';

        if ($jwt['role'] === 'proprietaire') {
            // Le propriétaire ne peut que confirmer ou annuler
            if (!in_array($statut, ['confirmee','annulee'], true)) {
                Response::error('Statut invalide', 400);
            }
            if ((int)$reservation['proprietaire_id'] !== (int)$jwt['id']) {
                Response::error('Accès refusé', 403);
            }
        } elseif ($jwt['role'] === 'locataire') {
            // Le locataire peut annuler uniquement
            if ($statut !== 'annulee') Response::error('Statut invalide', 400);
            if ((int)$reservation['locataire_id'] !== (int)$jwt['id']) {
                Response::error('Accès refusé', 403);
            }
        } else {
            RoleCheck::require($jwt, 'admin');
        }

        $this->model->updateStatut($id, $statut);
        Response::success(['statut' => $statut], 'Statut mis à jour');
    }
}
