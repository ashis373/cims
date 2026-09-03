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
$required_module = 'interviews';

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST') $required_permission = 'can_add';
else if ($method === 'PUT') $required_permission = 'can_edit';
else if ($method === 'DELETE') $required_permission = 'can_delete';
else $required_permission = 'can_view';

require_once '../auth_middleware.php';

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data || !isset($data['application_id']) || !isset($data['candidate_id'])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing required fields (application_id, candidate_id)"]);
        exit;
    }
    file_put_contents('error_log.txt', date('Y-m-d H:i:s') . ' PAYLOAD: ' . json_encode($data) . "\n", FILE_APPEND);


    try {
        $conn->beginTransaction();

        $stmt = $conn->prepare("INSERT INTO cims_candidate_interviews (
            application_id, type, interviewDate, end_time, mode, interviewers, 
            meeting_link, location, notes, status, created_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

        $now = date('Y-m-d H:i:s');
        $date = !empty($data['date']) ? date('Y-m-d H:i:s', strtotime($data['date'])) : $now;
        $endTime = !empty($data['end_time']) ? date('Y-m-d H:i:s', strtotime($data['end_time'])) : null;
        $status = $data['status'] ?? 'Scheduled';
        $createdBy = $data['created_by'] ?? 'Admin';

        $stmt->execute([
            $data['application_id'],
            $data['type'] ?? 'HR Round',
            $date,
            $endTime,
            $data['mode'] ?? 'Online',
            $data['interviewers'] ?? '',
            $data['meeting_link'] ?? '',
            $data['location'] ?? '',
            $data['notes'] ?? '',
            $status,
            $createdBy,
            $now
        ]);

        $interviewId = $conn->lastInsertId();

        // Update candidate stage if it is New Applicant or Shortlisted
        $stmtStage = $conn->prepare("SELECT stage FROM cims_applications WHERE id = ?");
        $stmtStage->execute([$data['application_id']]);
        $currentStage = $stmtStage->fetchColumn();
        
        if (in_array($currentStage, ['New Applicant', 'Shortlisted', 'HR Call Scheduled'])) {
            $stmtUpd = $conn->prepare("UPDATE cims_applications SET stage = 'Interview Scheduled' WHERE id = ?");
            $stmtUpd->execute([$data['application_id']]);
            $stmtUpdC = $conn->prepare("UPDATE cims_candidates SET updatedAt = ? WHERE id = ?");
            $stmtUpdC->execute([$now, $data['candidate_id']]);
        }

        // Log History
        $stmtHist = $conn->prepare("INSERT INTO cims_candidate_history (candidate_id, action, details, createdAt) VALUES (?, ?, ?, ?)");
        $details = ($data['type'] ?? 'HR Round') . " scheduled for " . date('d M, h:i A', strtotime($date));
        $stmtHist->execute([$data['candidate_id'], 'Interview Scheduled', $details, $now]);

        $conn->commit();
        echo json_encode(["success" => true, "id" => $interviewId, "message" => "Interview scheduled successfully"]);
    } catch (Throwable $e) {
        if ($conn->inTransaction()) $conn->rollBack();
        http_response_code(500);
        $errorMsg = $e->getMessage() . ' in ' . $e->getFile() . ' on line ' . $e->getLine();
        file_put_contents('error_log.txt', date('Y-m-d H:i:s') . ' POST Error: ' . $errorMsg . "\n", FILE_APPEND);
        echo json_encode(["error" => $errorMsg]);
    }
} elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($_GET['id']) || !$data || !isset($data['candidate_id'])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing ID or data"]);
        exit;
    }

    $id = $_GET['id'];

    try {
        $conn->beginTransaction();

        $fields = ['type', 'interviewDate', 'end_time', 'mode', 'interviewers', 'meeting_link', 'location', 'notes', 'status', 'feedback', 'rating', 'recommendation', 'comments'];
        $updateStrs = [];
        $params = [];

        foreach ($fields as $f) {
            if (isset($data[$f])) {
                if ($f === 'interviewDate' || $f === 'end_time') {
                    $updateStrs[] = "$f = ?";
                    $params[] = $data[$f] ? date('Y-m-d H:i:s', strtotime($data[$f])) : null;
                } else {
                    $updateStrs[] = "$f = ?";
                    $params[] = $data[$f];
                }
            }
        }

        if (!empty($updateStrs)) {
            $params[] = $id;
            $sql = "UPDATE cims_candidate_interviews SET " . implode(", ", $updateStrs) . " WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
        }

        // Log History
        $now = date('Y-m-d H:i:s');
        $statusStr = $data['status'] ?? 'Updated';
        $stmtHist = $conn->prepare("INSERT INTO cims_candidate_history (candidate_id, action, details, createdAt) VALUES (?, ?, ?, ?)");
        $details = "Interview " . $statusStr . (isset($data['feedback']) ? " - Feedback added" : "");
        $stmtHist->execute([$data['candidate_id'], 'Interview Updated', $details, $now]);

        $conn->commit();
        echo json_encode(["success" => true, "message" => "Interview updated successfully"]);
    } catch (Throwable $e) {
        if ($conn->inTransaction()) $conn->rollBack();
        http_response_code(500);
        $errorMsg = $e->getMessage() . ' in ' . $e->getFile() . ' on line ' . $e->getLine();
        file_put_contents('error_log.txt', date('Y-m-d H:i:s') . ' PUT Error: ' . $errorMsg . "\n", FILE_APPEND);
        echo json_encode(["error" => $errorMsg]);
    }
}
?>
