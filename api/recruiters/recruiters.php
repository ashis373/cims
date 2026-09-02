<?php
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include '../db.php';
$required_module = 'System Settings';

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST') $required_permission = 'can_add';
else if ($method === 'PUT') $required_permission = 'can_edit';
else if ($method === 'DELETE') $required_permission = 'can_delete';
else $required_permission = 'can_view';

require_once '../auth_middleware.php';



if ($method === 'GET') {
    try {
        $stmt = $conn->query("
            SELECT r.id, r.name, r.email, r.mobile, r.status, r.department, r.designation, r.createdAt,
                (SELECT COUNT(*) FROM cims_jobs j WHERE j.recruiter = r.id OR j.recruiter = r.name) as assigned_jobs,
                (SELECT COUNT(DISTINCT a.candidate_id) FROM cims_applications a WHERE a.recruiter = r.id OR a.recruiter = r.name) as candidates
            FROM cims_recruiters r
        ");
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($results);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        $name = $input['name'] ?? '';
        $email = $input['email'] ?? '';
        $mobile = !empty($input['mobile']) ? $input['mobile'] : null;
        $department = !empty($input['department']) ? $input['department'] : null;
        $designation = !empty($input['designation']) ? $input['designation'] : null;
        
        if (empty($name) || empty($email)) {
            echo json_encode(["error" => "Name and Email are required"]);
            exit;
        }
        
        $stmt = $conn->prepare("INSERT INTO cims_recruiters (name, email, mobile, department, designation, status) VALUES (?, ?, ?, ?, ?, 'Active')");
        $stmt->execute([$name, $email, $mobile, $department, $designation]);
        
        echo json_encode(["success" => true, "id" => $conn->lastInsertId()]);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            echo json_encode(["error" => "Email already exists"]);
        } else {
            echo json_encode(["error" => $e->getMessage()]);
        }
    }
} elseif ($method === 'PUT') {
    try {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            echo json_encode(["error" => "Missing ID"]);
            exit;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (isset($input['status']) && count($input) === 1) {
            // Just toggle status
            $stmt = $conn->prepare("UPDATE cims_recruiters SET status = ? WHERE id = ?");
            $stmt->execute([$input['status'], $id]);
            echo json_encode(["success" => true]);
            exit;
        }
        
        $name = $input['name'] ?? '';
        $email = $input['email'] ?? '';
        $mobile = !empty($input['mobile']) ? $input['mobile'] : null;
        $department = !empty($input['department']) ? $input['department'] : null;
        $designation = !empty($input['designation']) ? $input['designation'] : null;
        $status = $input['status'] ?? 'Active';
        
        $stmt = $conn->prepare("UPDATE cims_recruiters SET name = ?, email = ?, mobile = ?, department = ?, designation = ?, status = ? WHERE id = ?");
        $stmt->execute([$name, $email, $mobile, $department, $designation, $status, $id]);
        
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            echo json_encode(["error" => "Email already exists"]);
        } else {
            echo json_encode(["error" => $e->getMessage()]);
        }
    }
} elseif ($method === 'DELETE') {
    try {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            echo json_encode(["error" => "Missing ID"]);
            exit;
        }
        $stmt = $conn->prepare("DELETE FROM cims_recruiters WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        echo json_encode(["error" => $e->getMessage()]);
    }
}
?>
