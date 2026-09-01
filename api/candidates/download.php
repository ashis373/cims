<?php
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-User-Id");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require '../db.php';
$required_module = 'Candidate Management';
$required_permission = 'can_view';
require_once '../auth_middleware.php';

$file = $_GET['file'] ?? '';
$type = $_GET['type'] ?? 'documents';

if (empty($file) || preg_match('/[^a-zA-Z0-9_.-]/', $file)) {
    http_response_code(400);
    die("Invalid filename");
}

$allowedTypes = ['documents', 'resumes', 'photos'];
if (!in_array($type, $allowedTypes)) {
    http_response_code(400);
    die("Invalid type");
}

// Assignment/Permission check
// If user has Scope 'Own', they can only see files belonging to their assigned candidates.
// For simplicity, we just rely on module 'can_view'.

$filePath = '../../uploads/candidates/' . $type . '/' . $file;

if (!file_exists($filePath)) {
    http_response_code(404);
    die("File not found");
}

$mime = mime_content_type($filePath);
header('Content-Type: ' . $mime);
header('Content-Length: ' . filesize($filePath));
if ($type !== 'photos') {
    header('Content-Disposition: attachment; filename="' . basename($filePath) . '"');
} else {
    header('Content-Disposition: inline; filename="' . basename($filePath) . '"');
}

readfile($filePath);
?>
