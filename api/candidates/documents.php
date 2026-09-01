<?php
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-User-Id");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include '../db.php';
$required_module = 'Candidate Management';

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST') $required_permission = 'can_add';
else if ($method === 'PUT') $required_permission = 'can_edit';
else if ($method === 'DELETE') $required_permission = 'can_delete';
else $required_permission = 'can_view';

require_once '../auth_middleware.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK && isset($_POST['candidate_id'])) {
        $uploadDir = '../../uploads/candidates/documents/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        $fileTmpPath = $_FILES['file']['tmp_name'];
        $originalName = basename($_FILES['file']['name']);
        
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
        
        if ($_FILES['file']['size'] > 10 * 1024 * 1024) {
            http_response_code(400);
            echo json_encode(["error" => "Document exceeds maximum allowed size (10MB)."]);
            exit;
        }
        
        if (!in_array($fileMimeType, $allowedMimeTypes) || !in_array($fileExtension, $allowedExtensions)) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG are allowed."]);
            exit;
        }
        
        $fileName = time() . '_' . preg_replace("/[^a-zA-Z0-9.-]/", "_", $originalName);
        $destPath = $uploadDir . $fileName;
        
        if (move_uploaded_file($fileTmpPath, $destPath)) {
            $stmt = $conn->prepare("INSERT INTO cims_candidate_documents (candidate_id, name, filePath, uploadedBy) VALUES (?, ?, ?, ?)");
            $stmt->execute([
                $_POST['candidate_id'],
                $originalName,
                $fileName,
                'System'
            ]);
            echo json_encode(["success" => true, "filename" => $fileName]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error moving the uploaded file."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["error" => "No file uploaded, upload error, or missing candidate_id."]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (isset($data['id'])) {
        $stmt = $conn->prepare("SELECT filePath FROM cims_candidate_documents WHERE id = ?");
        $stmt->execute([$data['id']]);
        $doc = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($doc) {
            $filePath = '../../uploads/candidates/documents/' . $doc['filePath'];
            if (file_exists($filePath)) {
                unlink($filePath);
            }
            $delStmt = $conn->prepare("DELETE FROM cims_candidate_documents WHERE id = ?");
            if ($delStmt->execute([$data['id']])) {
                echo json_encode(["success" => true]);
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Database error deleting document."]);
            }
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Document not found."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Missing document id."]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
?>
