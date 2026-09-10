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

    // Handle Secure File Uploads with Strict Whitelists and Size Limits
    function uploadFile($fileKey, $isImage) {
        if (isset($_FILES[$fileKey]) && $_FILES[$fileKey]['error'] === UPLOAD_ERR_OK) {
            $fileTmpPath = $_FILES[$fileKey]['tmp_name'];
            $fileSize = $_FILES[$fileKey]['size'];
            $originalName = basename($_FILES[$fileKey]['name']);
            $originalName = str_replace(chr(0), '', $originalName); // Null-byte strip

            $fileExtension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

            // Strict Size Limit: 1MB for photos, 5MB for resumes
            $maxSize = $isImage ? (1 * 1024 * 1024) : (5 * 1024 * 1024);
            if ($fileSize > $maxSize) {
                http_response_code(400);
                echo json_encode(["error" => ($isImage ? "Photo" : "Resume") . " exceeds maximum allowed size (" . ($isImage ? '1MB' : '5MB') . ")."]);
                exit;
            }

            $allowedExtensions = $isImage ? ['jpg', 'jpeg', 'png'] : ['pdf', 'doc', 'docx'];
            $allowedMimeTypes = $isImage 
                ? ['image/jpeg', 'image/png'] 
                : ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $fileMimeType = finfo_file($finfo, $fileTmpPath);
            finfo_close($finfo);

            if (!in_array($fileMimeType, $allowedMimeTypes) || !in_array($fileExtension, $allowedExtensions)) {
                http_response_code(400);
                echo json_encode(["error" => "Invalid file type for " . ($isImage ? "Photo" : "Resume") . ". Allowed: " . implode(', ', $allowedExtensions)]);
                exit;
            }

            if ($isImage) {
                $imgCheck = @getimagesize($fileTmpPath);
                if ($imgCheck === false) {
                    http_response_code(400);
                    echo json_encode(["error" => "Uploaded image is invalid or corrupted."]);
                    exit;
                }
            }

            $uploadDir = '../../uploads/candidates/' . ($isImage ? 'photos/' : 'resumes/');
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            $safeBase = preg_replace("/[^a-zA-Z0-9_-]/", "_", pathinfo($originalName, PATHINFO_FILENAME));
            $safeBase = substr($safeBase, 0, 30);
            $randomSuffix = bin2hex(random_bytes(6));
            $fileName = time() . '_' . $safeBase . '_' . $randomSuffix . '.' . $fileExtension;
            $destPath = $uploadDir . $fileName;

            if (move_uploaded_file($fileTmpPath, $destPath)) {
                chmod($destPath, 0644);
                return $fileName;
            }
        }
        return '';
    }

    $photo = uploadFile('photo', true);
    $resume = uploadFile('resume', false);

    $job_id = !empty($_POST['job_id']) ? (int)$_POST['job_id'] : null;

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
            INSERT INTO cims_applications (candidate_id, job_id, role_applied, department, source, appliedAt, stage, recruiter)
            VALUES (?, ?, ?, ?, 'Website', ?, 'New Applicant', 'Unassigned')
        ");
        $stmtApp->execute([$id, $job_id, $role, $department, $t]);
        
        if ($job_id) {
            $updJob = $conn->prepare("UPDATE cims_jobs SET applications = applications + 1 WHERE id = ?");
            $updJob->execute([$job_id]);
        }

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
