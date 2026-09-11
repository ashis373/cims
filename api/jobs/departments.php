<?php
require_once __DIR__ . '/../cors.php';
header('Content-Type: application/json');
include '../db.php';
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST') $required_permission = 'can_add';
else if ($method === 'PUT') $required_permission = 'can_edit';
else if ($method === 'DELETE') $required_permission = 'can_delete';
else $required_permission = 'can_view';
require_once '../auth_middleware.php';
if ($method !== 'GET') {
    require_permission('system_settings');
}
if ($method === 'GET') {
    try {
        $stmt = $conn->query("
            SELECT d.*, 
                (SELECT COUNT(*) FROM cims_jobs j WHERE j.department = d.name) as jobs_count,
                (SELECT COUNT(DISTINCT candidate_id) FROM cims_applications a WHERE a.department = d.name) as candidates_count
            FROM cims_departments d 
            ORDER BY id ASC
        ");
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($results);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['name'])) {
        http_response_code(400);
        echo json_encode(["error" => "Name is required"]);
        exit;
    }
    
    try {
        $status = $data['status'] ?? 'Active';
        $color = $data['color_theme'] ?? 'bg-slate-500/12 text-slate-700 dark:text-slate-300 border-slate-500/25';
        
        $stmt = $conn->prepare("INSERT INTO cims_departments (name, status, color_theme) VALUES (?, ?, ?)");
        $stmt->execute([$data['name'], $status, $color]);
        $id = $conn->lastInsertId();
        
        $dept_id = 'DEPT-' . str_pad($id, 3, '0', STR_PAD_LEFT);
        $conn->exec("UPDATE cims_departments SET dept_id = '$dept_id' WHERE id = $id");
        
        echo json_encode(["success" => true, "id" => $id, "dept_id" => $dept_id]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(["error" => "ID is required"]);
        exit;
    }
    
    try {
        if (isset($data['action']) && $data['action'] === 'toggle_status') {
            $status = $data['status'] === 'Active' ? 'Active' : 'Inactive';
            $stmt = $conn->prepare("UPDATE cims_departments SET status = ? WHERE id = ?");
            $stmt->execute([$status, $data['id']]);
        } else {
            $stmt = $conn->prepare("UPDATE cims_departments SET name = ?, status = ? WHERE id = ?");
            $stmt->execute([$data['name'], $data['status'], $data['id']]);
        }
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'DELETE') {
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(["error" => "ID is required"]);
        exit;
    }
    
    try {
        $id = $_GET['id'];
        
        // Check if in use
        $check = $conn->prepare("
            SELECT name,
                (SELECT COUNT(*) FROM cims_jobs WHERE department = d.name) as jobs_count,
                (SELECT COUNT(DISTINCT candidate_id) FROM cims_applications WHERE department = d.name) as candidates_count
            FROM cims_departments d WHERE id = ?
        ");
        $check->execute([$id]);
        $dept = $check->fetch(PDO::FETCH_ASSOC);
        
        if ($dept && ($dept['jobs_count'] > 0 || $dept['candidates_count'] > 0)) {
            http_response_code(400);
            echo json_encode(["error" => "Cannot delete department. It is currently associated with {$dept['jobs_count']} jobs and {$dept['candidates_count']} candidates."]);
            exit;
        }
        
        $stmt = $conn->prepare("DELETE FROM cims_departments WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}
?>





