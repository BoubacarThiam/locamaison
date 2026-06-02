<?php
class PaiementController {
    private Reservation    $resModel;
    private PaymentService $payService;

    public function __construct() {
        $this->resModel   = new Reservation();
        $this->payService = new PaymentService();
    }

    public function initier(): void {
        $jwt  = AuthJWT::require();
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        foreach (['reservation_id','mode'] as $f) {
            if (empty($body[$f])) Response::error("Champ requis : $f", 400);
        }

        $reservation = $this->resModel->findById((int)$body['reservation_id']);
        if (!$reservation) Response::error('Réservation introuvable', 404);
        if ((int)$reservation['locataire_id'] !== (int)$jwt['id']) {
            Response::error('Accès refusé', 403);
        }

        $ref     = 'LM-' . strtoupper(bin2hex(random_bytes(6)));
        $montant = (float)$reservation['montant_total'];
        $mode    = $body['mode'];

        // Mise à jour du mode de paiement et de la ref
        $this->resModel->updatePaiement($reservation['id'], $ref, 'en_attente');

        try {
            if ($mode === 'wave') {
                $result = $this->payService->initiateWave($montant, $ref);
            } elseif ($mode === 'orange_money') {
                $telephone = $body['telephone'] ?? '';
                $result    = $this->payService->initiateOrangeMoney($montant, $telephone, $ref);
            } elseif ($mode === 'especes') {
                $result = ['message' => 'Réservation créée. Réglez en espèces auprès du propriétaire.'];
                $this->resModel->updateStatut($reservation['id'], 'en_attente');
            } else {
                Response::error('Mode de paiement invalide', 400);
            }

            Response::success(array_merge($result, ['ref' => $ref]));
        } catch (RuntimeException $e) {
            Response::error('Erreur de paiement : ' . $e->getMessage(), 502);
        }
    }

    public function webhook(): void {
        // Endpoint public — vérifie la signature
        $payload   = file_get_contents('php://input');
        $headers   = getallheaders();
        $signature = $headers['Wave-Signature'] ?? $headers['X-Orange-Signature'] ?? '';

        // Vérification signature Wave
        if ($signature && !$this->payService->verifyWaveSignature($payload, $signature)) {
            http_response_code(401);
            echo json_encode(['error' => 'Signature invalide']);
            exit;
        }

        $data  = json_decode($payload, true);
        $event = $data['type'] ?? $data['event'] ?? '';
        $ref   = $data['data']['client_reference'] ?? $data['order_id'] ?? '';

        if (in_array($event, ['checkout.completed','PAYMENT_SUCCEEDED'], true) && $ref) {
            $reservation = $this->resModel->findByRef($ref);
            if ($reservation) {
                $this->resModel->updateStatut($reservation['id'], 'confirmee');
            }
        }

        http_response_code(200);
        echo json_encode(['received' => true]);
        exit;
    }

    public function verifier(string $ref): void {
        $jwt         = AuthJWT::require();
        $reservation = $this->resModel->findByRef($ref);

        if (!$reservation) Response::error('Référence introuvable', 404);
        if ((int)$reservation['locataire_id'] !== (int)$jwt['id'] && $jwt['role'] !== 'admin') {
            Response::error('Accès refusé', 403);
        }

        try {
            $status = $this->payService->verifyWave($ref);
            if ($status['paid'] && $reservation['statut'] !== 'confirmee') {
                $this->resModel->updateStatut($reservation['id'], 'confirmee');
            }
            Response::success([
                'statut'  => $reservation['statut'],
                'paid'    => $status['paid'],
                'montant' => $reservation['montant_total'],
                'ref'     => $ref,
            ]);
        } catch (RuntimeException $e) {
            Response::success([
                'statut'  => $reservation['statut'],
                'paid'    => $reservation['statut'] === 'confirmee',
                'montant' => $reservation['montant_total'],
                'ref'     => $ref,
            ]);
        }
    }
}
