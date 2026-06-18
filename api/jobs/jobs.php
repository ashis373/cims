<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require '../db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    if ($method == 'GET') {
        $stmt = $conn->query("SELECT * FROM cims_jobs ORDER BY id DESC");
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

        $sql = "INSERT INTO cims_jobs (job_id, title, department, location, openings, applications, status, date, author, job_type, work_mode, min_exp, max_exp, min_salary, max_salary, description, target_date, priority, internal_notes) VALUES (?, ?, ?, ?, ?, 0, 'Open', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$jobId, $title, $department, $location, $openings, $date, $author, $job_type, $work_mode, $min_exp, $max_exp, $min_salary, $max_salary, $description, $target_date, $priority, $internal_notes]);
        
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
        $job_id = $data['job_id'] ?? '';
        $status = $data['status'] ?? '';
        
        if ($job_id && $status) {
            $stmt = $conn->prepare("UPDATE cims_jobs SET status = ? WHERE job_id = ?");
            $stmt->execute([$status, $job_id]);
            echo json_encode(["success" => true, "message" => "Job status updated"]);
        } else {
            echo json_encode(["error" => "Missing data"]);
        }
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
