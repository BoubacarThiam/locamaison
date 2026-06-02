<?php
class Response {
    public static function success($data = null, string $message = '', int $code = 200): void {
        http_response_code($code);
        echo json_encode(['success' => true, 'data' => $data, 'message' => $message]);
        exit;
    }

    public static function error(string $message, int $code = 400, $data = null): void {
        http_response_code($code);
        echo json_encode(['success' => false, 'data' => $data, 'message' => $message]);
        exit;
    }

    public static function paginated(array $items, int $total, int $page, int $limit): void {
        http_response_code(200);
        echo json_encode([
            'success'    => true,
            'data'       => $items,
            'pagination' => [
                'total' => $total,
                'page'  => $page,
                'limit' => $limit,
                'pages' => (int) ceil($total / max(1, $limit)),
            ],
        ]);
        exit;
    }
}
