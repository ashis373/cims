<?php
require_once __DIR__ . '/../cors.php';

include '../db.php';

try {
    $stmt = $conn->query("
        SELECT 
            id,
            job_id,
            title,
            department,
            location,
            job_type,
            work_mode,
            min_exp,
            max_exp,
            min_salary,
            max_salary,
            openings,
            description,
            created_at
        FROM cims_jobs 
        WHERE status = 'Open' 
        ORDER BY id DESC
    ");
    $jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format types properly for clean consumption
    $formatted = array_map(function($j) {
        return [
            'id' => (int)$j['id'],
            'job_id' => $j['job_id'],
            'title' => $j['title'],
            'department' => $j['department'],
            'location' => $j['location'],
            'job_type' => $j['job_type'] ?: 'Full Time',
            'work_mode' => $j['work_mode'] ?: 'Hybrid',
            'min_exp' => (int)$j['min_exp'],
            'max_exp' => (int)$j['max_exp'],
            'min_salary' => (int)$j['min_salary'],
            'max_salary' => (int)$j['max_salary'],
            'openings' => (int)$j['openings'],
            'description' => $j['description'] ?: '',
            'created_at' => $j['created_at']
        ];
    }, $jobs);

    echo json_encode($formatted);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>
