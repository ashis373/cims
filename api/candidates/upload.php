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
        
        // Remove null bytes and path traversal attempts
        $originalName = str_replace(chr(0), '', $originalName);
        $fileExtension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        $isImage = in_array($fileExtension, ['jpg', 'jpeg', 'png']);
        
        // Strict File Size Restrictions: 1MB for photos, 2MB for resumes/docs
        $maxSize = $isImage ? (1 * 1024 * 1024) : (2 * 1024 * 1024);
        if ($_FILES['resume']['size'] > $maxSize) {
            http_response_code(400);
            echo json_encode(["error" => "File exceeds maximum allowed size (" . ($isImage ? '1MB' : '2MB') . ")."]);
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
        
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $fileMimeType = finfo_file($finfo, $fileTmpPath);
        finfo_close($finfo);
        
        if (!in_array($fileMimeType, $allowedMimeTypes) || !in_array($fileExtension, $allowedExtensions)) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid file type. Only secure PDF, DOC, DOCX, JPG, and PNG files are allowed."]);
            exit;
        }

        // Deep inspect image files to prevent malicious scripts disguised as images
        if ($isImage) {
            $imageInfo = @getimagesize($fileTmpPath);
            if ($imageInfo === false) {
                http_response_code(400);
                echo json_encode(["error" => "Uploaded image is corrupted or invalid."]);
                exit;
            }
        }
        
        // Generate secure random sanitized filename
        $safeBase = preg_replace("/[^a-zA-Z0-9_-]/", "_", pathinfo($originalName, PATHINFO_FILENAME));
        $safeBase = substr($safeBase, 0, 40);
        $randomSuffix = bin2hex(random_bytes(6));
        $fileName = time() . '_' . $safeBase . '_' . $randomSuffix . '.' . $fileExtension;
        $destPath = $uploadDir . $fileName;
        
        if (move_uploaded_file($fileTmpPath, $destPath)) {
            chmod($destPath, 0644); // Restrict execution permission
            echo json_encode(["success" => true, "filename" => $fileName]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error securely saving the uploaded file."]);
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
