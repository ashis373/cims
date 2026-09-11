<?php
require_once __DIR__ . '/../cors.php';
include '../db.php';
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST') $required_permission = 'can_add';
else if ($method === 'PUT') $required_permission = 'can_edit';
else if ($method === 'DELETE') $required_permission = 'can_delete';
else $required_permission = 'can_view';
require_once '../auth_middleware.php';
require_permission('candidates');
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK && isset($_POST['candidate_id'])) {
        $candidateId = (int)$_POST['candidate_id'];
        if (!check_candidate_access($candidateId)) {
            http_response_code(403);
            echo json_encode(["error" => "Forbidden: You are not authorized to upload documents for this candidate."]);
            exit;
        }
        $uploadDir = '../../uploads/candidates/documents/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        $fileTmpPath = $_FILES['file']['tmp_name'];
        $originalName = basename($_FILES['file']['name']);
        $originalName = str_replace(chr(0), '', $originalName); // Strip null bytes
        
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
        $fileExtension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        
        // Strict 5MB limit for candidate documents
        if ($_FILES['file']['size'] > 5 * 1024 * 1024) {
            http_response_code(400);
            echo json_encode(["error" => "Document exceeds maximum allowed size (5MB)."]);
            exit;
        }
        
        if (!in_array($fileMimeType, $allowedMimeTypes) || !in_array($fileExtension, $allowedExtensions)) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid file type. Only secure PDF, DOC, DOCX, JPG, and PNG are allowed."]);
            exit;
        }
        
        $safeBase = preg_replace("/[^a-zA-Z0-9_-]/", "_", pathinfo($originalName, PATHINFO_FILENAME));
        $safeBase = substr($safeBase, 0, 35);
        $randomSuffix = bin2hex(random_bytes(6));
        $fileName = time() . '_' . $safeBase . '_' . $randomSuffix . '.' . $fileExtension;
        $destPath = $uploadDir . $fileName;
        
        if (move_uploaded_file($fileTmpPath, $destPath)) {
            chmod($destPath, 0644);
            $stmt = $conn->prepare("INSERT INTO cims_candidate_documents (candidate_id, name, filePath, uploadedBy) VALUES (?, ?, ?, ?)");
            $stmt->execute([
                $_POST['candidate_id'],
                $originalName,
                $fileName,
                'System'
            ]);
            
            $userId = isset($payload['user_id']) ? $payload['user_id'] : null;
            $stmtHist = $conn->prepare("INSERT INTO cims_candidate_history (candidate_id, action, details, userId) VALUES (?, 'Document Added', ?, ?)");
            $stmtHist->execute([$_POST['candidate_id'], $originalName . ' uploaded', $userId]);

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
        $stmt = $conn->prepare("SELECT candidate_id, name, filePath FROM cims_candidate_documents WHERE id = ?");
        $stmt->execute([$data['id']]);
        $doc = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($doc) {
            if (!check_candidate_access((int)$doc['candidate_id'])) {
                http_response_code(403);
                echo json_encode(["error" => "Forbidden: You are not authorized to delete documents for this candidate."]);
                exit;
            }
            $filePath = '../../uploads/candidates/documents/' . $doc['filePath'];
            if (file_exists($filePath)) {
                unlink($filePath);
            }
            $delStmt = $conn->prepare("DELETE FROM cims_candidate_documents WHERE id = ?");
            if ($delStmt->execute([$data['id']])) {
                $userId = isset($payload['user_id']) ? $payload['user_id'] : null;
                $stmtHist = $conn->prepare("INSERT INTO cims_candidate_history (candidate_id, action, details, userId) VALUES (?, 'Document Deleted', ?, ?)");
                $stmtHist->execute([$doc['candidate_id'], $doc['name'] . ' deleted', $userId]);
                
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
