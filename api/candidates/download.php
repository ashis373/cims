<?php
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require '../db.php';
$required_permission = 'can_view';
require_once '../auth_middleware.php';
require_permission('candidates');

$docId = isset($_GET['id']) ? (int)$_GET['id'] : null;
$file = isset($_GET['file']) ? trim($_GET['file']) : '';
$type = isset($_GET['type']) ? trim($_GET['type']) : 'documents';
$isInline = isset($_GET['inline']) && ($_GET['inline'] === '1' || $_GET['inline'] === 'true');

$allowedTypes = ['documents', 'resumes', 'photos'];
if (!in_array($type, $allowedTypes, true)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid file type requested."]);
    exit;
}

$targetPath = null;
$downloadFilename = null;

if ($docId && $docId > 0) {
    // Document ID lookup
    $stmt = $conn->prepare("SELECT id, candidate_id, name, filePath FROM cims_candidate_documents WHERE id = ?");
    $stmt->execute([$docId]);
    $doc = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$doc) {
        http_response_code(404);
        echo json_encode(["error" => "Document record not found."]);
        exit;
    }

    if (!check_candidate_access((int)$doc['candidate_id'])) {
        http_response_code(403);
        echo json_encode(["error" => "Forbidden: You are not authorized to access this candidate's documents."]);
        exit;
    }

    $safeName = basename($doc['filePath']);
    $targetPath = realpath(__DIR__ . '/../../uploads/candidates/documents/' . $safeName);
    $downloadFilename = $doc['name'] ?: $safeName;

} elseif (!empty($file)) {
    // Filename lookup
    if (preg_match('/[^a-zA-Z0-9_.-]/', $file)) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid filename characters."]);
        exit;
    }

    $safeName = basename($file);

    if ($type === 'documents') {
        $stmt = $conn->prepare("SELECT candidate_id, name, filePath FROM cims_candidate_documents WHERE filePath = ?");
        $stmt->execute([$safeName]);
        $doc = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$doc) {
            http_response_code(404);
            echo json_encode(["error" => "Document not found in database."]);
            exit;
        }

        if (!check_candidate_access((int)$doc['candidate_id'])) {
            http_response_code(403);
            echo json_encode(["error" => "Forbidden: You are not authorized to access this candidate's documents."]);
            exit;
        }

        $targetPath = realpath(__DIR__ . '/../../uploads/candidates/documents/' . $safeName);
        $downloadFilename = $doc['name'] ?: $safeName;

    } elseif ($type === 'resumes') {
        $stmt = $conn->prepare("SELECT id, resume FROM cims_candidates WHERE resume = ?");
        $stmt->execute([$safeName]);
        $cand = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$cand) {
            http_response_code(404);
            echo json_encode(["error" => "Resume not found in candidate records."]);
            exit;
        }

        if (!check_candidate_access((int)$cand['id'])) {
            http_response_code(403);
            echo json_encode(["error" => "Forbidden: You are not authorized to access this candidate's resume."]);
            exit;
        }

        $targetPath = realpath(__DIR__ . '/../../uploads/candidates/resumes/' . $safeName);
        $downloadFilename = $safeName;

    } elseif ($type === 'photos') {
        $stmt = $conn->prepare("SELECT id, photo FROM cims_candidates WHERE photo = ?");
        $stmt->execute([$safeName]);
        $cand = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$cand) {
            http_response_code(404);
            echo json_encode(["error" => "Photo not found in candidate records."]);
            exit;
        }

        if (!check_candidate_access((int)$cand['id'])) {
            http_response_code(403);
            echo json_encode(["error" => "Forbidden: You are not authorized to access this candidate's photo."]);
            exit;
        }

        $targetPath = realpath(__DIR__ . '/../../uploads/candidates/photos/' . $safeName);
        $downloadFilename = $safeName;
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Missing document id or file parameter."]);
    exit;
}

// Verify physical path security
$baseUploads = realpath(__DIR__ . '/../../uploads/candidates');
if (!$targetPath || !file_exists($targetPath) || strpos($targetPath, $baseUploads) !== 0) {
    http_response_code(404);
    echo json_encode(["error" => "File not found on storage."]);
    exit;
}

$mime = mime_content_type($targetPath) ?: 'application/octet-stream';
$disposition = ($isInline || $type === 'photos') ? 'inline' : 'attachment';

header('Content-Type: ' . $mime);
header('Content-Length: ' . filesize($targetPath));
header('Content-Disposition: ' . $disposition . '; filename="' . addslashes($downloadFilename) . '"');
header('Cache-Control: private, no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

readfile($targetPath);
exit;
