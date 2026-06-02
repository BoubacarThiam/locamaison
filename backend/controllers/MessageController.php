<?php
class MessageController {
    private Message $model;

    public function __construct() {
        $this->model = new Message();
    }

    public function send(): void {
        $jwt  = AuthJWT::require();
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        if (empty($body['destinataire_id']) || empty($body['contenu'])) {
            Response::error('destinataire_id et contenu sont requis', 400);
        }
        if ((int)$body['destinataire_id'] === (int)$jwt['id']) {
            Response::error('Impossible de vous envoyer un message à vous-même', 400);
        }

        $id      = $this->model->send(
            (int)$jwt['id'],
            (int)$body['destinataire_id'],
            trim($body['contenu']),
            isset($body['reservation_id']) ? (int)$body['reservation_id'] : null
        );
        Response::success(['id' => $id], 'Message envoyé', 201);
    }

    public function conversation(int $userId): void {
        $jwt = AuthJWT::require();
        $messages = $this->model->conversation((int)$jwt['id'], $userId);
        $this->model->markRead($userId, (int)$jwt['id']);
        Response::success($messages);
    }

    public function markRead(int $fromId): void {
        $jwt = AuthJWT::require();
        $this->model->markRead($fromId, (int)$jwt['id']);
        Response::success(null, 'Messages marqués comme lus');
    }

    public function myConversations(): void {
        $jwt  = AuthJWT::require();
        $list = $this->model->conversationsList((int)$jwt['id']);
        Response::success($list);
    }
}
