<?php
class AvisController {
    private Avis        $avisModel;
    private Reservation $resModel;

    public function __construct() {
        $this->avisModel = new Avis();
        $this->resModel  = new Reservation();
    }

    public function create(): void {
        $jwt  = AuthJWT::require();
        RoleCheck::require($jwt, 'locataire');

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        foreach (['logement_id','reservation_id','note'] as $f) {
            if (!isset($body[$f])) Response::error("Champ requis : $f", 400);
        }

        $note = (int)$body['note'];
        if ($note < 1 || $note > 5) Response::error('La note doit être entre 1 et 5', 400);

        $reservation = $this->resModel->findById((int)$body['reservation_id']);
        if (!$reservation) Response::error('Réservation introuvable', 404);
        if ((int)$reservation['locataire_id'] !== (int)$jwt['id']) {
            Response::error('Cette réservation ne vous appartient pas', 403);
        }
        if ($reservation['statut'] !== 'terminee') {
            Response::error('Vous ne pouvez laisser un avis que pour un séjour terminé', 400);
        }
        if ($this->avisModel->existsForReservation((int)$body['reservation_id'])) {
            Response::error('Vous avez déjà laissé un avis pour ce séjour', 409);
        }

        $body['locataire_id'] = $jwt['id'];
        $id = $this->avisModel->create($body);
        Response::success(['id' => $id], 'Avis publié', 201);
    }
}
