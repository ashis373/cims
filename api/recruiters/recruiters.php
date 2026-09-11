<?php
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

include '../db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') $required_permission = 'can_add';
else if ($method === 'PUT') $required_permission = 'can_edit';
else if ($method === 'DELETE') $required_permission = 'can_delete';
else $required_permission = 'can_view';

require_once '../auth_middleware.php';

if ($method !== 'GET') {
    require_permission('system_settings');
} else {
    // Enforce view authorization for recruiters
    $stmtUser = $conn->prepare("SELECT r.role_name, r.is_system_admin, r.id as role_id FROM cims_users u JOIN cims_roles r ON u.role_id = r.id WHERE u.id = ?");
    $stmtUser->execute([$currentUser]);
    $uRow = $stmtUser->fetch(PDO::FETCH_ASSOC);
    if (!$uRow) {
        http_response_code(403);
        echo json_encode(["error" => "Forbidden"]);
        exit;
    }
    if ($uRow['is_system_admin'] != 1 && $uRow['role_name'] !== 'Administrator') {
        $permStmt = $conn->prepare("SELECT can_view FROM cims_permissions WHERE role_id = ? AND module_name IN ('system_settings', 'System Settings', 'Candidates', 'candidates', 'job_openings') AND can_view = 1");
        $permStmt->execute([$uRow['role_id']]);
        if (!$permStmt->fetchColumn()) {
            http_response_code(403);
            echo json_encode(["error" => "Forbidden: You do not have permission to view recruiters."]);
            exit;
        }
    }
}

if ($method === 'GET') {
    try {
        $stmt = $conn->query("
            SELECT r.id, r.name, r.email, r.mobile, r.status, r.department, r.designation, r.createdAt,
                (SELECT COUNT(*) FROM cims_jobs j WHERE j.recruiter = r.id OR j.recruiter = r.name) as assigned_jobs,
                (SELECT COUNT(DISTINCT a.candidate_id) FROM cims_applications a WHERE a.recruiter = r.id OR a.recruiter = r.name) as candidates
            FROM cims_recruiters r
            ORDER BY r.name ASC
        ");
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($results);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "An error occurred while fetching recruiters."]);
    }
} elseif ($method === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        $name = trim($input['name'] ?? '');
        $email = trim($input['email'] ?? '');
        $mobile = !empty($input['mobile']) ? trim($input['mobile']) : null;
        $department = !empty($input['department']) ? trim($input['department']) : null;
        $designation = !empty($input['designation']) ? trim($input['designation']) : null;
        
        if (empty($name) || empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(["error" => "Valid Name and Email are required"]);
            exit;
        }
        
        $stmt = $conn->prepare("INSERT INTO cims_recruiters (name, email, mobile, department, designation, status) VALUES (?, ?, ?, ?, ?, 'Active')");
        $stmt->execute([$name, $email, $mobile, $department, $designation]);
        
        echo json_encode(["success" => true, "id" => $conn->lastInsertId()]);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            http_response_code(409);
            echo json_encode(["error" => "Email already exists"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "An error occurred while creating recruiter."]);
        }
    }
} elseif ($method === 'PUT') {
    try {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "Missing ID"]);
            exit;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (isset($input['status']) && count($input) === 1) {
            $stmt = $conn->prepare("UPDATE cims_recruiters SET status = ? WHERE id = ?");
            $stmt->execute([$input['status'], $id]);
            echo json_encode(["success" => true]);
            exit;
        }
        
        $name = trim($input['name'] ?? '');
        $email = trim($input['email'] ?? '');
        $mobile = !empty($input['mobile']) ? trim($input['mobile']) : null;
        $department = !empty($input['department']) ? trim($input['department']) : null;
        $designation = !empty($input['designation']) ? trim($input['designation']) : null;
        $status = $input['status'] ?? 'Active';
        
        if (empty($name) || empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(["error" => "Valid Name and Email are required"]);
            exit;
        }

        $stmt = $conn->prepare("UPDATE cims_recruiters SET name = ?, email = ?, mobile = ?, department = ?, designation = ?, status = ? WHERE id = ?");
        $stmt->execute([$name, $email, $mobile, $department, $designation, $status, $id]);
        
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            http_response_code(409);
            echo json_encode(["error" => "Email already exists"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "An error occurred while updating recruiter."]);
        }
    }
} elseif ($method === 'DELETE') {
    try {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "Missing ID"]);
            exit;
        }
        $stmt = $conn->prepare("DELETE FROM cims_recruiters WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "An error occurred while deleting recruiter."]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
