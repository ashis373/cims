<?php
require_once __DIR__ . '/../cors.php';

include '../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $clientIp = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

    // Rate Limiting: Max 10 applications per IP per hour
    try {
        $conn->exec("DELETE FROM cims_rate_limits WHERE created_at < (NOW() - INTERVAL 1 HOUR)");
        $rateStmt = $conn->prepare("SELECT COUNT(*) FROM cims_rate_limits WHERE ip_address = ? AND action = 'apply' AND created_at > (NOW() - INTERVAL 1 HOUR)");
        $rateStmt->execute([$clientIp]);
        $applyAttempts = (int)$rateStmt->fetchColumn();

        if ($applyAttempts >= 10) {
            http_response_code(429);
            echo json_encode(["error" => "Too many application submissions from your IP. Please try again after an hour."]);
            exit;
        }

        // Record submission attempt
        $insRate = $conn->prepare("INSERT INTO cims_rate_limits (ip_address, action, created_at) VALUES (?, 'apply', NOW())");
        $insRate->execute([$clientIp]);
    } catch (\Throwable $rateErr) {
        error_log("Rate limiting error in apply.php: " . $rateErr->getMessage());
    }

    // We are expecting multipart/form-data
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $alternateMobile = trim($_POST['alternateMobile'] ?? '');
    $location = trim($_POST['location'] ?? '');
    $preferredLocation = trim($_POST['preferredLocation'] ?? '');
    $experience = trim($_POST['experience'] ?? '');
    $relevantExperience = trim($_POST['relevantExperience'] ?? '');
    $currentCompany = trim($_POST['currentCompany'] ?? '');
    $currentDesignation = trim($_POST['currentDesignation'] ?? '');
    $currentCtc = trim($_POST['currentCtc'] ?? '');
    $expectedCtc = trim($_POST['expectedCtc'] ?? '');
    $noticePeriod = trim($_POST['noticePeriod'] ?? '');
    $skills = $_POST['skills'] ?? '[]';
    $linkedInProfile = trim($_POST['linkedInProfile'] ?? '');
    $role = trim($_POST['role'] ?? '');
    $department = trim($_POST['department'] ?? '');
    $photo = '';
    $resume = '';
    
    // Validate basics
    if (!$name || !$email || !$role) {
        http_response_code(400);
        echo json_encode(["error" => "Name, Email, and Position are required."]);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["error" => "Please enter a valid email address."]);
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
        error_log("Apply database error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["error" => "An error occurred while submitting your application. Please try again later."]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
