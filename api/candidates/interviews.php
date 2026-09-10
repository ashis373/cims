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
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST') $required_permission = 'can_add';
else if ($method === 'PUT') $required_permission = 'can_edit';
else if ($method === 'DELETE') $required_permission = 'can_delete';
else $required_permission = 'can_view';
require_once '../auth_middleware.php';
require_permission('interviews');

if ($method === 'GET') {
    try {
        $stmt = $conn->prepare("
            SELECT 
                i.id,
                i.application_id,
                i.type,
                i.interviewDate as date,
                i.end_time,
                i.mode,
                i.interviewers as interviewer,
                i.meeting_link,
                i.location,
                i.notes,
                i.cancellation_reason,
                i.status,
                i.feedback,
                i.rating,
                i.recommendation,
                i.result,
                i.comments,
                i.created_by,
                i.created_at,
                a.candidate_id,
                a.role_applied as position,
                a.department,
                a.stage,
                c.name as candidateName,
                c.email as candidateEmail,
                c.phone as candidatePhone
            FROM cims_candidate_interviews i
            JOIN cims_applications a ON i.application_id = a.id
            JOIN cims_candidates c ON a.candidate_id = c.id
            ORDER BY i.interviewDate DESC
        ");
        $stmt->execute();
        $list = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($list);
        exit;
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
        exit;
    }
}

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
            meeting_link, location, notes, status, created_by, created_at,
            feedback, rating, recommendation, result, comments
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $now = date('Y-m-d H:i:s');
        $date = !empty($data['date']) ? date('Y-m-d H:i:s', strtotime($data['date'])) : $now;
        $endTime = !empty($data['end_time']) ? date('Y-m-d H:i:s', strtotime($data['end_time'])) : null;
        $status = $data['status'] ?? 'Scheduled';
        $createdBy = $data['created_by'] ?? 'Admin';
        $resultVal = !empty($data['result']) ? $data['result'] : (!empty($data['recommendation']) && $data['recommendation'] === 'Do Not Hire' ? 'Failed' : null);

        $stmt->execute([
            $data['application_id'],
            $data['type'] ?? 'HR Call',
            $date,
            $endTime,
            $data['mode'] ?? 'Online',
            $data['interviewers'] ?? '',
            $data['meeting_link'] ?? '',
            $data['location'] ?? '',
            $data['notes'] ?? '',
            $status,
            $createdBy,
            $now,
            $data['feedback'] ?? null,
            isset($data['rating']) ? (int)$data['rating'] : null,
            $data['recommendation'] ?? null,
            $resultVal,
            $data['comments'] ?? null
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
        $stmtHist = $conn->prepare("INSERT INTO cims_candidate_history (candidate_id, action, details, createdAt, userId) VALUES (?, ?, ?, ?, ?)");
        $details = ($data['type'] ?? 'HR Round') . " scheduled for " . date('d M, h:i A', strtotime($date));
        $stmtHist->execute([$data['candidate_id'], 'Interview Scheduled', $details, $now, isset($payload['user_id']) ? $payload['user_id'] : null]);
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
        $fields = ['type', 'interviewDate', 'end_time', 'mode', 'interviewers', 'meeting_link', 'location', 'notes', 'cancellation_reason', 'status', 'feedback', 'rating', 'recommendation', 'result', 'comments'];
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
        $now = date('Y-m-d H:i:s');
        // If interview status is Completed, ensure application stage updates to Interview Completed
        if (isset($data['status'])) {
            $stmtGetApp = $conn->prepare("SELECT application_id, type FROM cims_candidate_interviews WHERE id = ?");
            $stmtGetApp->execute([$id]);
            $ivRow = $stmtGetApp->fetch(PDO::FETCH_ASSOC);
            $appId = $ivRow['application_id'] ?? null;
            $ivType = strtolower(trim($data['type'] ?? $ivRow['type'] ?? ''));

            if ($appId) {
                if ($data['status'] === 'Completed') {
                    // Only move application stage to 'Interview Completed' if it's the Final Round
                    if ($ivType === 'final round' || $ivType === 'final') {
                        $stmtUpdApp = $conn->prepare("UPDATE cims_applications SET stage = 'Interview Completed' WHERE id = ?");
                        $stmtUpdApp->execute([$appId]);
                    } else {
                        // Intermediate completed rounds (Technical, Practical, Managerial, HR Call) keep the candidate in 'Interview Scheduled'
                        $stmtUpdApp = $conn->prepare("UPDATE cims_applications SET stage = 'Interview Scheduled' WHERE id = ?");
                        $stmtUpdApp->execute([$appId]);
                    }
                } elseif ($data['status'] === 'Scheduled' || $data['status'] === 'Rescheduled') {
                    $stmtUpdApp = $conn->prepare("UPDATE cims_applications SET stage = 'Interview Scheduled' WHERE id = ?");
                    $stmtUpdApp->execute([$appId]);
                }
            }
            $stmtUpdC = $conn->prepare("UPDATE cims_candidates SET updatedAt = ? WHERE id = ?");
            $stmtUpdC->execute([$now, $data['candidate_id']]);
        }
        // Log History
        $statusStr = $data['status'] ?? 'Updated';
        $stmtHist = $conn->prepare("INSERT INTO cims_candidate_history (candidate_id, action, details, createdAt, userId) VALUES (?, ?, ?, ?, ?)");
        $details = "Interview " . $statusStr;
        if ($statusStr === 'Cancelled' && !empty($data['notes'])) {
            $details .= " (" . $data['notes'] . ")";
        } elseif (isset($data['feedback'])) {
            $details .= " - Feedback: " . substr($data['feedback'], 0, 50);
        }
        $stmtHist->execute([$data['candidate_id'], 'Interview ' . $statusStr, $details, $now, isset($payload['user_id']) ? $payload['user_id'] : null]);
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
