<?php
class Upload {
    public static function handlePhoto(array $file, string $prefix = 'photo'): string {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            Response::error("Erreur upload : code {$file['error']}", 400);
        }
        if ($file['size'] > MAX_FILE_SIZE) {
            Response::error('Fichier trop volumineux (max 5 Mo)', 400);
        }

        $mime = mime_content_type($file['tmp_name']);
        if (!in_array($mime, ALLOWED_MIME, true)) {
            Response::error('Format non supporté (JPG, PNG, WebP uniquement)', 400);
        }

        $ext      = match($mime) {
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/webp' => 'webp',
        };
        $filename = $prefix . '_' . bin2hex(random_bytes(8)) . '.' . $ext;
        $dest     = UPLOAD_DIR . $filename;

        if (!is_dir(UPLOAD_DIR)) {
            mkdir(UPLOAD_DIR, 0755, true);
        }
        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            Response::error("Impossible d'enregistrer le fichier", 500);
        }

        return UPLOAD_URL . $filename;
    }

    public static function deletePhoto(string $url): void {
        $path = UPLOAD_DIR . basename($url);
        if (file_exists($path)) {
            unlink($path);
        }
    }
}
