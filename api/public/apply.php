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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // We are expecting multipart/form-data
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $alternateMobile = $_POST['alternateMobile'] ?? '';
    $location = $_POST['location'] ?? '';
    $preferredLocation = $_POST['preferredLocation'] ?? '';
    $experience = $_POST['experience'] ?? '';
    $relevantExperience = $_POST['relevantExperience'] ?? '';
    $currentCompany = $_POST['currentCompany'] ?? '';
    $currentDesignation = $_POST['currentDesignation'] ?? '';
    $currentCtc = $_POST['currentCtc'] ?? '';
    $expectedCtc = $_POST['expectedCtc'] ?? '';
    $noticePeriod = $_POST['noticePeriod'] ?? '';
    $skills = $_POST['skills'] ?? '[]';
    $linkedInProfile = $_POST['linkedInProfile'] ?? '';
    $role = $_POST['role'] ?? '';
    $department = $_POST['department'] ?? '';
    $photo = '';
    $resume = '';
    
    // Validate basics
    if (!$name || !$email || !$role) {
        http_response_code(400);
        echo json_encode(["error" => "Name, Email, and Position are required."]);
        exit;
    }

    // Handle File Uploads
    function uploadFile($fileKey, $isImage) {
        if (isset($_FILES[$fileKey]) && $_FILES[$fileKey]['error'] === UPLOAD_ERR_OK) {
            $fileTmpPath = $_FILES[$fileKey]['tmp_name'];
            $originalName = basename($_FILES[$fileKey]['name']);
            $uploadDir = '../../uploads/candidates/' . ($isImage ? 'photos/' : 'resumes/');
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            $fileName = time() . '_' . preg_replace("/[^a-zA-Z0-9.-]/", "_", $originalName);
            if (move_uploaded_file($fileTmpPath, $uploadDir . $fileName)) {
                return $fileName;
            }
        }
        return '';
    }

    $photo = uploadFile('photo', true);
    $resume = uploadFile('resume', false);

    try {
        $id = substr(str_shuffle("0123456789abcdefghijklmnopqrstuvwxyz"), 0, 16);
        $t = date('Y-m-d H:i:s');
        
        $stmt = $conn->prepare("
            INSERT INTO cims_candidates 
            (id, name, email, phone, alternateMobile, location, preferredLocation, experience, relevantExperience, currentCompany, currentDesignation, currentCtc, expectedCtc, noticePeriod, skills, photo, resume, linkedInProfile, source, isBlacklisted, isActive, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Website', 0, 1, ?, ?)
        ");
        $stmt->execute([$id, $name, $email, $phone, $alternateMobile, $location, $preferredLocation, $experience, $relevantExperience, $currentCompany, $currentDesignation, $currentCtc, $expectedCtc, $noticePeriod, $skills, $photo, $resume, $linkedInProfile, $t, $t]);
        $stmtApp = $conn->prepare("
            INSERT INTO cims_applications (candidate_id, role_applied, department, source, appliedAt, stage, recruiter)
            VALUES (?, ?, ?, 'Website', ?, 'New Applicant', 'Unassigned')
        ");
        $stmtApp->execute([$id, $role, $department, $t]);
        
        $stmtHist = $conn->prepare("
            INSERT INTO cims_candidate_history (candidate_id, action, details, createdAt, userId)
            VALUES (?, 'created', 'Application received from Careers Page', ?, NULL)
        ");
        $stmtHist->execute([$id, $t]);

        echo json_encode(["success" => true, "message" => "Application submitted successfully"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }
}
?>
