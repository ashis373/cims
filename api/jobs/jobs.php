<?php
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require '../db.php';

$required_module = 'job_openings';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') $required_permission = 'can_add';
else if ($method === 'PUT') $required_permission = 'can_edit';
else if ($method === 'DELETE') $required_permission = 'can_delete';
else $required_permission = 'can_view';

require_once '../auth_middleware.php';

try {
    if ($method == 'GET') {
        $stmt = $conn->query("
            SELECT j.*, r.name as recruiter_name 
            FROM cims_jobs j 
            LEFT JOIN cims_recruiters r ON j.recruiter = r.id OR j.recruiter = r.name
            ORDER BY j.id DESC
        ");
        $cims_jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $formattedJobs = array_map(function($job) {
            $job['openings'] = (int)$job['openings'];
            $job['applications'] = (int)$job['applications'];
            $job['id'] = $job['job_id']; 
            return $job;
        }, $cims_jobs);
        
        echo json_encode($formattedJobs);
    } 
    elseif ($method == 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $title = $data['title'] ?? '';
        $department = $data['department'] ?? 'Other';
        $location = $data['location'] ?? 'Remote';
        $openings = $data['openings'] ?? 1;
        $author = $data['author'] ?? 'Admin';
        $recruiter = $data['recruiter'] ?? '';
        
        $job_type = $data['job_type'] ?? 'Full Time';
        $work_mode = $data['work_mode'] ?? 'Hybrid';
        $min_exp = $data['min_exp'] ?? 0;
        $max_exp = $data['max_exp'] ?? 0;
        $min_salary = $data['min_salary'] ?? 0;
        $max_salary = $data['max_salary'] ?? 0;
        $description = $data['description'] ?? '';
        $target_date = $data['target_date'] ?? '';
        $priority = $data['priority'] ?? 'Medium';
        $internal_notes = $data['internal_notes'] ?? '';
        
        $stmt = $conn->query("SELECT MAX(id) FROM cims_jobs");
        $maxId = $stmt->fetchColumn() ?? 0;
        $jobId = "JOB-" . str_pad($maxId + 1, 3, "0", STR_PAD_LEFT);
        $date = date("M d, Y");

        $sql = "INSERT INTO cims_jobs (job_id, title, department, location, openings, applications, status, date, author, recruiter, job_type, work_mode, min_exp, max_exp, min_salary, max_salary, description, target_date, priority, internal_notes) VALUES (?, ?, ?, ?, ?, 0, 'Open', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$jobId, $title, $department, $location, $openings, $date, $author, $recruiter, $job_type, $work_mode, $min_exp, $max_exp, $min_salary, $max_salary, $description, $target_date, $priority, $internal_notes]);
        
        echo json_encode(["success" => true, "message" => "Job created successfully", "job_id" => $jobId]);
    }
    elseif ($method == 'DELETE') {
        $job_id = $_GET['job_id'] ?? '';
        if ($job_id) {
            $stmt = $conn->prepare("DELETE FROM cims_jobs WHERE job_id = ?");
            $stmt->execute([$job_id]);
            echo json_encode(["success" => true, "message" => "Job deleted"]);
        } else {
            echo json_encode(["error" => "No job_id provided"]);
        }
    }
    elseif ($method == 'PUT') {
        $data = json_decode(file_get_contents("php://input"), true);
        $job_id = $data['job_id'] ?? $_GET['id'] ?? '';
        
        if (!$job_id) {
            echo json_encode(["error" => "Missing job_id"]);
            exit;
        }

        $fields = [];
        $params = [];
        
        // Define all possible fields that can be updated
        $allowedFields = [
            'title', 'department', 'location', 'openings', 'status', 'author', 'recruiter',
            'job_type', 'work_mode', 'min_exp', 'max_exp', 'min_salary', 
            'max_salary', 'description', 'target_date', 'priority', 'internal_notes'
        ];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "`$field` = ?";
                $params[] = $data[$field];
            }
        }
        
        if (empty($fields)) {
            echo json_encode(["success" => true, "message" => "No changes provided"]);
            exit;
        }
        
        $params[] = $job_id;
        $sql = "UPDATE cims_jobs SET " . implode(", ", $fields) . " WHERE job_id = ?";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        echo json_encode(["success" => true, "message" => "Job updated successfully"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
