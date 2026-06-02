<?php
declare(strict_types=1);

// ── Bootstrap ────────────────────────────────────────────────────
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthJWT.php';
require_once __DIR__ . '/../middleware/RoleCheck.php';
require_once __DIR__ . '/../middleware/Upload.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Region.php';
require_once __DIR__ . '/../models/Logement.php';
require_once __DIR__ . '/../models/Reservation.php';
require_once __DIR__ . '/../models/Message.php';
require_once __DIR__ . '/../models/Avis.php';
require_once __DIR__ . '/../services/PaymentService.php';
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/LogementController.php';
require_once __DIR__ . '/../controllers/ReservationController.php';
require_once __DIR__ . '/../controllers/MessageController.php';
require_once __DIR__ . '/../controllers/AvisController.php';
require_once __DIR__ . '/../controllers/AdminController.php';
require_once __DIR__ . '/../controllers/PaiementController.php';

// ── CORS ─────────────────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: ' . FRONTEND_URL);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Parsing de l'URL ─────────────────────────────────────────────
$method   = $_SERVER['REQUEST_METHOD'];
$uri      = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri      = preg_replace('#^/locamaison/backend/api#', '', $uri);
$uri      = trim($uri, '/');
$segments = explode('/', $uri);

// ── Routeur ───────────────────────────────────────────────────────
try {
    route($method, $segments);
} catch (Throwable $e) {
    $msg = DEBUG ? $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine() : 'Erreur interne';
    Response::error($msg, 500);
}

function route(string $method, array $seg): void {
    $s0 = $seg[0] ?? '';
    $s1 = $seg[1] ?? '';
    $s2 = $seg[2] ?? '';
    $s3 = $seg[3] ?? '';
    $id = is_numeric($s1) ? (int)$s1 : null;

    // ── AUTH ──────────────────────────────────────────────────────
    if ($s0 === 'auth') {
        $c = new AuthController();
        match (true) {
            $method === 'POST' && $s1 === 'register'   => $c->register(),
            $method === 'POST' && $s1 === 'login'      => $c->login(),
            $method === 'GET'  && $s1 === 'me'         => $c->me(),
            $method === 'PUT'  && $s1 === 'me'         => $c->updateProfile(),
            default => Response::error('Route auth introuvable', 404),
        };
        return;
    }

    // ── GÉOGRAPHIE ───────────────────────────────────────────────
    if ($s0 === 'regions') {
        $r = new Region();
        Response::success($r->allRegions());
        return;
    }
    if ($s0 === 'villes') {
        $r = new Region();
        Response::success($r->villesByRegion((int)($_GET['region_id'] ?? 0)));
        return;
    }
    if ($s0 === 'quartiers') {
        $r = new Region();
        Response::success($r->quartiersByVille((int)($_GET['ville_id'] ?? 0)));
        return;
    }

    // ── LOGEMENTS (recherche publique) ────────────────────────────
    if ($s0 === 'logements') {
        $c = new LogementController();
        match (true) {
            $method === 'GET'  && !$id                        => $c->search(),
            $method === 'GET'  && $id && !$s2                 => $c->show($id),
            $method === 'POST' && !$id                        => $c->create(),
            $method === 'PUT'  && $id                         => $c->update($id),
            $method === 'DELETE' && $id                       => $c->delete($id),
            $method === 'POST' && $id && $s2 === 'photos'     => $c->uploadPhotos($id),
            default => Response::error('Route logements introuvable', 404),
        };
        return;
    }

    // ── PHOTOS (suppression) ──────────────────────────────────────
    if ($s0 === 'photos' && $id && $method === 'DELETE') {
        (new LogementController())->deletePhoto($id);
        return;
    }

    // ── RÉSERVATIONS ──────────────────────────────────────────────
    if ($s0 === 'reservations') {
        $c = new ReservationController();
        match (true) {
            $method === 'POST' && !$id                         => $c->create(),
            $method === 'PUT'  && $id && $s2 === 'statut'      => $c->updateStatut($id),
            default => Response::error('Route réservations introuvable', 404),
        };
        return;
    }

    // ── PROPRIÉTAIRE ──────────────────────────────────────────────
    if ($s0 === 'proprietaire') {
        $lc = new LogementController();
        $rc = new ReservationController();
        $mc = new MessageController();
        match (true) {
            $method === 'GET' && $s1 === 'dashboard'     => $lc->proprietaireDashboard(),
            $method === 'GET' && $s1 === 'annonces'      => $lc->mesAnnonces(),
            $method === 'GET' && $s1 === 'reservations'  => $rc->reservationsProprietaire(),
            $method === 'GET' && $s1 === 'messages'      => $mc->myConversations(),
            default => Response::error('Route propriétaire introuvable', 404),
        };
        return;
    }

    // ── LOCATAIRE ─────────────────────────────────────────────────
    if ($s0 === 'locataire') {
        $rc = new ReservationController();
        $mc = new MessageController();
        match (true) {
            $method === 'GET' && $s1 === 'reservations' => $rc->mesReservations(),
            $method === 'GET' && $s1 === 'messages'     => $mc->myConversations(),
            default => Response::error('Route locataire introuvable', 404),
        };
        return;
    }

    // ── MESSAGERIE ────────────────────────────────────────────────
    if ($s0 === 'messages') {
        $c = new MessageController();
        match (true) {
            $method === 'POST' && !$id                        => $c->send(),
            $method === 'GET'  && $id                         => $c->conversation($id),
            $method === 'PUT'  && $s1 === 'lu' && is_numeric($s2) => $c->markRead((int)$s2),
            default => Response::error('Route messages introuvable', 404),
        };
        return;
    }

    // ── AVIS ──────────────────────────────────────────────────────
    if ($s0 === 'avis' && $method === 'POST') {
        (new AvisController())->create();
        return;
    }

    // ── PAIEMENTS ─────────────────────────────────────────────────
    if ($s0 === 'paiements') {
        $c = new PaiementController();
        match (true) {
            $method === 'POST' && $s1 === 'initier'            => $c->initier(),
            $method === 'POST' && $s1 === 'webhook'            => $c->webhook(),
            $method === 'GET'  && $s1 === 'verifier' && $s2    => $c->verifier($s2),
            default => Response::error('Route paiements introuvable', 404),
        };
        return;
    }

    // ── ADMIN ─────────────────────────────────────────────────────
    if ($s0 === 'admin') {
        $c = new AdminController();
        match (true) {
            $method === 'GET'  && $s1 === 'stats'                        => $c->stats(),
            $method === 'GET'  && $s1 === 'logements'                    => $c->logements(),
            $method === 'PUT'  && $s1 === 'logements' && $id && $s3 === 'valider'
                                                                         => $c->validerLogement($id),
            $method === 'GET'  && $s1 === 'users'                        => $c->users(),
            $method === 'PUT'  && $s1 === 'users' && $id && $s3 === 'statut'
                                                                         => $c->updateUserStatut($id),
            $method === 'GET'  && $s1 === 'avis'                         => $c->avis(),
            $method === 'DELETE' && $s1 === 'avis' && $id                => $c->deleteAvis($id),
            $method === 'GET'  && $s1 === 'stats-regions'                => $c->statsByRegion(),
            default => Response::error('Route admin introuvable', 404),
        };
        return;
    }

    Response::error('Endpoint introuvable', 404);
}
