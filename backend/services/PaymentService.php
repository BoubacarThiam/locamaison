<?php
class PaymentService {
    // ── Wave CI ─────────────────────────────────────────────────
    public function initiateWave(float $montant, string $ref): array {
        $payload = [
            'amount'           => (int)$montant,
            'currency'         => 'XOF',
            'client_reference' => $ref,
            'success_url'      => FRONTEND_URL . '/reservation/succes?ref=' . $ref,
            'error_url'        => FRONTEND_URL . '/reservation/echec?ref=' . $ref,
            'webhook_url'      => BACKEND_URL  . '/api/paiements/webhook',
        ];

        $ch = curl_init(WAVE_API_URL . '/checkout/sessions');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($payload),
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . WAVE_API_KEY,
            ],
            CURLOPT_TIMEOUT        => 15,
        ]);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200 && $httpCode !== 201) {
            throw new RuntimeException('Erreur Wave : ' . $response);
        }
        $data = json_decode($response, true);
        return ['checkout_url' => $data['wave_launch_url'] ?? $data['checkout_url']];
    }

    // ── Orange Money Sénégal ─────────────────────────────────────
    public function initiateOrangeMoney(float $montant, string $telephone, string $ref): array {
        // Récupération du token OAuth2 Orange
        $tokenCh = curl_init(OM_API_URL . '/token');
        $credentials = base64_encode(OM_CLIENT_ID . ':' . OM_CLIENT_SECRET);
        curl_setopt_array($tokenCh, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => 'grant_type=client_credentials',
            CURLOPT_HTTPHEADER     => [
                'Authorization: Basic ' . $credentials,
                'Content-Type: application/x-www-form-urlencoded',
            ],
        ]);
        $tokenResp = json_decode(curl_exec($tokenCh), true);
        curl_close($tokenCh);

        $accessToken = $tokenResp['access_token'] ?? null;
        if (!$accessToken) throw new RuntimeException('Impossible d\'obtenir un token Orange Money');

        $payload = [
            'merchant_key'   => OM_CLIENT_ID,
            'currency'        => 'OUV',
            'order_id'        => $ref,
            'amount'          => (int)$montant,
            'return_url'      => FRONTEND_URL . '/reservation/succes?ref=' . $ref,
            'cancel_url'      => FRONTEND_URL . '/reservation/echec?ref=' . $ref,
            'notif_url'       => BACKEND_URL  . '/api/paiements/webhook',
            'lang'            => 'fr',
        ];

        $ch = curl_init(OM_API_URL . '/webpayment');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($payload),
            CURLOPT_HTTPHEADER     => [
                'Authorization: Bearer ' . $accessToken,
                'Content-Type: application/json',
            ],
            CURLOPT_TIMEOUT => 15,
        ]);
        $response = curl_exec($ch);
        curl_close($ch);

        $data = json_decode($response, true);
        return ['payment_url' => $data['payment_url'] ?? null];
    }

    // ── Vérification statut Wave ─────────────────────────────────
    public function verifyWave(string $ref): array {
        $ch = curl_init(WAVE_API_URL . '/checkout/sessions?client_reference=' . $ref);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . WAVE_API_KEY],
            CURLOPT_TIMEOUT        => 10,
        ]);
        $response = curl_exec($ch);
        curl_close($ch);
        $data = json_decode($response, true);

        $session  = $data[0] ?? $data;
        $paid     = ($session['payment_status'] ?? '') === 'succeeded';
        return ['paid' => $paid, 'amount' => $session['amount'] ?? 0];
    }

    // ── Validation signature webhook Wave ───────────────────────
    public function verifyWaveSignature(string $payload, string $signature): bool {
        $expected = hash_hmac('sha256', $payload, WAVE_WEBHOOK_SECRET);
        return hash_equals($expected, $signature);
    }
}
