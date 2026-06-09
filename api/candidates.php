<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $conn->query("SELECT * FROM candidates ORDER BY updatedAt DESC");
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($results as &$row) {
            $row['tags'] = json_decode($row['tags'] ?? '[]');
            $row['interviews'] = json_decode($row['interviews'] ?? '[]');
            $row['activity'] = json_decode($row['activity'] ?? '[]');
            $row['applications'] = json_decode($row['applications'] ?? '[]');
            
            // Format dates back to ISO
            if ($row['appliedAt']) $row['appliedAt'] = str_replace(' ', 'T', $row['appliedAt']) . 'Z';
            if ($row['updatedAt']) $row['updatedAt'] = str_replace(' ', 'T', $row['updatedAt']) . 'Z';
        }
        
        echo json_encode($results);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid input"]);
        exit;
    }
    
    try {
        // If it's a bulk sync
        if (isset($data['bulk']) && is_array($data['candidates'])) {
            $conn->beginTransaction();
            // Clear existing
            $conn->exec("TRUNCATE TABLE candidates");
            
            $stmt = $conn->prepare("INSERT INTO candidates (id, name, email, phone, source, role, department, resume, notes, appliedAt, updatedAt, stage, tags, interviews, activity, applications, joiningDate, designation, employeeId) VALUES (:id, :name, :email, :phone, :source, :role, :department, :resume, :notes, :appliedAt, :updatedAt, :stage, :tags, :interviews, :activity, :applications, :joiningDate, :designation, :employeeId)");
            
            foreach ($data['candidates'] as $c) {
                $stmt->execute([
                    ':id' => $c['id'],
                    ':name' => $c['name'],
                    ':email' => $c['email'],
                    ':phone' => $c['phone'] ?? '',
                    ':source' => $c['source'] ?? 'Website',
                    ':role' => $c['role'] ?? '',
                    ':department' => $c['department'] ?? 'Engineering',
                    ':resume' => $c['resume'] ?? '',
                    ':notes' => $c['notes'] ?? '',
                    ':appliedAt' => date('Y-m-d H:i:s', strtotime($c['appliedAt'])),
                    ':updatedAt' => date('Y-m-d H:i:s', strtotime($c['updatedAt'])),
                    ':stage' => $c['stage'] ?? 'New Applicant',
                    ':tags' => json_encode($c['tags'] ?? []),
                    ':interviews' => json_encode($c['interviews'] ?? []),
                    ':activity' => json_encode($c['activity'] ?? []),
                    ':applications' => json_encode($c['applications'] ?? []),
                    ':joiningDate' => isset($c['joiningDate']) && $c['joiningDate'] ? date('Y-m-d H:i:s', strtotime($c['joiningDate'])) : null,
                    ':designation' => $c['designation'] ?? null,
                    ':employeeId' => $c['employeeId'] ?? null,
                ]);
            }
            $conn->commit();
            echo json_encode(["success" => true, "message" => "Bulk sync complete"]);
            exit;
        }

        // Single insert
        $stmt = $conn->prepare("INSERT INTO candidates (id, name, email, phone, source, role, department, resume, notes, appliedAt, updatedAt, stage, tags, interviews, activity, applications, joiningDate, designation, employeeId) VALUES (:id, :name, :email, :phone, :source, :role, :department, :resume, :notes, :appliedAt, :updatedAt, :stage, :tags, :interviews, :activity, :applications, :joiningDate, :designation, :employeeId)");
        
        $stmt->execute([
            ':id' => $data['id'],
            ':name' => $data['name'],
            ':email' => $data['email'],
            ':phone' => $data['phone'] ?? '',
            ':source' => $data['source'] ?? 'Website',
            ':role' => $data['role'] ?? '',
            ':department' => $data['department'] ?? 'Engineering',
            ':resume' => $data['resume'] ?? '',
            ':notes' => $data['notes'] ?? '',
            ':appliedAt' => date('Y-m-d H:i:s', strtotime($data['appliedAt'])),
            ':updatedAt' => date('Y-m-d H:i:s', strtotime($data['updatedAt'])),
            ':stage' => $data['stage'] ?? 'New Applicant',
            ':tags' => json_encode($data['tags'] ?? []),
            ':interviews' => json_encode($data['interviews'] ?? []),
            ':activity' => json_encode($data['activity'] ?? []),
            ':applications' => json_encode($data['applications'] ?? []),
            ':joiningDate' => isset($data['joiningDate']) && $data['joiningDate'] ? date('Y-m-d H:i:s', strtotime($data['joiningDate'])) : null,
            ':designation' => $data['designation'] ?? null,
            ':employeeId' => $data['employeeId'] ?? null,
        ]);
        
        echo json_encode(["success" => true, "message" => "Candidate added"]);
    } catch (PDOException $e) {
        if(isset($conn) && $conn->inTransaction()) {
            $conn->rollBack();
        }
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($_GET['id']) || !$data) {
        http_response_code(400);
        echo json_encode(["error" => "Missing ID or data"]);
        exit;
    }
    
    $id = $_GET['id'];
    
    try {
        $stmt = $conn->prepare("SELECT * FROM candidates WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$existing) {
            http_response_code(404);
            echo json_encode(["error" => "Candidate not found"]);
            exit;
        }
        
        // Merge the incoming data. For JSON fields, we accept the incoming array.
        $fields = ['name', 'email', 'phone', 'source', 'role', 'department', 'resume', 'notes', 'appliedAt', 'updatedAt', 'stage', 'designation', 'employeeId'];
        $jsonFields = ['tags', 'interviews', 'activity', 'applications'];
        
        $merged = [];
        foreach ($fields as $f) {
            $merged[$f] = isset($data[$f]) ? $data[$f] : $existing[$f];
        }
        foreach ($jsonFields as $jf) {
            if (isset($data[$jf])) {
                $merged[$jf] = is_array($data[$jf]) ? json_encode($data[$jf]) : $data[$jf];
            } else {
                $merged[$jf] = $existing[$jf];
            }
        }
        $merged['joiningDate'] = isset($data['joiningDate']) && $data['joiningDate'] ? date('Y-m-d H:i:s', strtotime($data['joiningDate'])) : $existing['joiningDate'];
        
        $stmt = $conn->prepare("UPDATE candidates SET name=:name, email=:email, phone=:phone, source=:source, role=:role, department=:department, resume=:resume, notes=:notes, appliedAt=:appliedAt, updatedAt=:updatedAt, stage=:stage, tags=:tags, interviews=:interviews, activity=:activity, applications=:applications, joiningDate=:joiningDate, designation=:designation, employeeId=:employeeId WHERE id=:id");
        
        $stmt->execute([
            ':id' => $id,
            ':name' => $merged['name'],
            ':email' => $merged['email'],
            ':phone' => $merged['phone'],
            ':source' => $merged['source'],
            ':role' => $merged['role'],
            ':department' => $merged['department'],
            ':resume' => $merged['resume'],
            ':notes' => $merged['notes'],
            ':appliedAt' => date('Y-m-d H:i:s', strtotime($merged['appliedAt'])),
            ':updatedAt' => date('Y-m-d H:i:s', strtotime($merged['updatedAt'] ?? 'now')),
            ':stage' => $merged['stage'],
            ':tags' => $merged['tags'],
            ':interviews' => $merged['interviews'],
            ':activity' => $merged['activity'],
            ':applications' => $merged['applications'],
            ':joiningDate' => $merged['joiningDate'],
            ':designation' => $merged['designation'],
            ':employeeId' => $merged['employeeId']
        ]);
        
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    $ids = [];
    if (isset($data['ids']) && is_array($data['ids'])) {
        $ids = $data['ids'];
    } elseif (isset($_GET['id'])) {
        $ids = [$_GET['id']];
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Missing or invalid IDs"]);
        exit;
    }
    
    try {
        $inQuery = implode(',', array_fill(0, count($ids), '?'));
        $stmt = $conn->prepare("DELETE FROM candidates WHERE id IN ($inQuery)");
        $stmt->execute($ids);
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}
?>
