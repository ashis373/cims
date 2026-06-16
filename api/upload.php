<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['resume']) && $_FILES['resume']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = 'uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        $fileTmpPath = $_FILES['resume']['tmp_name'];
        // Sanitize file name
        $fileName = time() . '_' . preg_replace("/[^a-zA-Z0-9.-]/", "_", basename($_FILES['resume']['name']));
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
