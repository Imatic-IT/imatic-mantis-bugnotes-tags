<?php
header('Content-Type: application/json');

require_api('authentication_api.php');
auth_ensure_user_authenticated();

require_once __DIR__ . '/../core/BugnoteHighlightsManager.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data    = json_decode(file_get_contents('php://input'), true);
    $manager = new BugnoteHighlightsManager($data);
    $manager->sendJsonResponse();
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Only POST requests are allowed']);
}
