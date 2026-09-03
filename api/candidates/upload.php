<?php
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}
include '../db.php';
$required_permission = 'can_add';
require_once '../auth_middleware.php';
require_permission('candidates');
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['resume']) && $_FILES['resume']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['resume']['tmp_name'];
        $originalName = basename($_FILES['resume']['name']);
        
        $fileExtension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        $isImage = in_array($fileExtension, ['jpg', 'jpeg', 'png']);
        
        $maxSize = $isImage ? (5 * 1024 * 1024) : (10 * 1024 * 1024);
        if ($_FILES['resume']['size'] > $maxSize) {
            http_response_code(400);
            echo json_encode(["error" => "File exceeds maximum allowed size (" . ($isImage ? '5MB' : '10MB') . ")."]);
            exit;
        }
        
        $uploadDir = '../../uploads/candidates/' . ($isImage ? 'photos/' : 'resumes/');
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        $allowedMimeTypes = [
            'application/pdf', 
            'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
            'image/jpeg', 
            'image/png'
        ];
        $allowedExtensions = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
        
        $fileMimeType = mime_content_type($fileTmpPath);
        $fileExtension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        
        if (!in_array($fileMimeType, $allowedMimeTypes) || !in_array($fileExtension, $allowedExtensions)) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG are allowed."]);
            exit;
        }
        
        $fileName = time() . '_' . preg_replace("/[^a-zA-Z0-9.-]/", "_", $originalName);
        $destPath = $uploadDir . $fileName;
        
        if (move_uploaded_file($fileTmpPath, $destPath)) {
            echo json_encode(["success" => true, "filename" => $fileName]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error moving the uploaded file."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["error" => "No file uploaded or upload error."]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
?>
