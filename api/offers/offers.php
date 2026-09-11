<?php
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

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
require_permission('offers');

try {
    if ($method === 'GET') {
        $scopeWhere = get_candidate_scope_where('c');
        $stmt = $conn->query("
            SELECT 
                o.id as offer_id,
                o.offeredCtc,
                o.offerDate,
                o.offerStatus,
                o.acceptedDate,
                o.joiningDate,
                a.id as application_id,
                a.role_applied as role,
                a.department,
                a.recruiter,
                a.stageReason,
                c.id as candidate_id,
                c.name,
                c.email,
                c.phone,
                c.expectedCtc
            FROM cims_candidate_offers o
            JOIN cims_applications a ON o.application_id = a.id
            JOIN cims_candidates c ON a.candidate_id = c.id
            WHERE $scopeWhere
            ORDER BY o.offerDate DESC
        ");
        
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($results);
    } elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($_GET['id']) || !$data) {
            http_response_code(400);
            echo json_encode(["error" => "Missing ID or data"]);
            exit;
        }
        
        $id = (int)$_GET['id'];
        $action = $data['action'] ?? '';
        $userId = isset($payload['user_id']) ? $payload['user_id'] : null;
        
        $conn->beginTransaction();
        
        // Fetch offer info
        $stmt = $conn->prepare("SELECT o.*, a.candidate_id FROM cims_candidate_offers o JOIN cims_applications a ON o.application_id = a.id WHERE o.id = ?");
        $stmt->execute([$id]);
        $offer = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$offer) {
            $conn->rollBack();
            http_response_code(404);
            echo json_encode(["error" => "Offer not found"]);
            exit;
        }
        
        $candidateId = (int)$offer['candidate_id'];
        if (!check_candidate_access($candidateId)) {
            $conn->rollBack();
            http_response_code(403);
            echo json_encode(["error" => "Forbidden: You are not authorized to update offers for this candidate."]);
            exit;
        }

        if ($action === 'mark_joined') {
            // Update offer
            $stmtUpdate = $conn->prepare("UPDATE cims_candidate_offers SET offerStatus = 'Joined' WHERE id = ?");
            $stmtUpdate->execute([$id]);
            // Update application stage
            $stmtApp = $conn->prepare("UPDATE cims_applications SET stage = 'Joined' WHERE id = ?");
            $stmtApp->execute([$offer['application_id']]);
            // Update candidate stage (for legacy fields)
            $stmtCand = $conn->prepare("UPDATE cims_candidates SET stage = 'Joined', updatedAt = NOW() WHERE id = ?");
            $stmtCand->execute([$candidateId]);
            // Log history
            $stmtHist = $conn->prepare("INSERT INTO cims_candidate_history (candidate_id, action, details, userId) VALUES (?, 'Offer Updated', 'Candidate marked as Joined', ?)");
            $stmtHist->execute([$candidateId, $userId]);
        } elseif ($action === 'send_reminder') {
            // Log history
            $stmtHist = $conn->prepare("INSERT INTO cims_candidate_history (candidate_id, action, details, userId) VALUES (?, 'Reminder Sent', 'Sent joining reminder to candidate', ?)");
            $stmtHist->execute([$candidateId, $userId]);
        } else {
            // Generic update
            $fields = ['offerStatus', 'offeredCtc', 'offerDate', 'acceptedDate', 'joiningDate'];
            $updates = [];
            $params = [];
            foreach ($fields as $f) {
                if (isset($data[$f])) {
                    $updates[] = "$f = ?";
                    $params[] = $data[$f];
                }
            }
            if (!empty($updates)) {
                $params[] = $id;
                $sql = "UPDATE cims_candidate_offers SET " . implode(", ", $updates) . " WHERE id = ?";
                $stmtUpd = $conn->prepare($sql);
                $stmtUpd->execute($params);
                
                // If offerStatus changes, sync application stage
                if (isset($data['offerStatus'])) {
                    $stageMap = [
                        'Released' => 'Offer Released',
                        'Accepted' => 'Offer Accepted',
                        'Declined' => 'Offer Declined',
                        'Joined' => 'Joined',
                        'No Show' => 'No Show'
                    ];
                    $newStage = $stageMap[$data['offerStatus']] ?? $data['offerStatus'];
                    $stmtApp = $conn->prepare("UPDATE cims_applications SET stage = ? WHERE id = ?");
                    $stmtApp->execute([$newStage, $offer['application_id']]);
                    $stmtCand = $conn->prepare("UPDATE cims_candidates SET stage = ?, updatedAt = NOW() WHERE id = ?");
                    $stmtCand->execute([$newStage, $candidateId]);
                    
                    $stmtHist = $conn->prepare("INSERT INTO cims_candidate_history (candidate_id, action, details, userId) VALUES (?, 'Offer Updated', ?, ?)");
                    $stmtHist->execute([$candidateId, "Offer status changed to " . $data['offerStatus'], $userId]);
                }
            }
        }
        
        $conn->commit();
        echo json_encode(["success" => true]);
    } else {
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
    }
} catch (PDOException $e) {
    if (isset($conn) && $conn->inTransaction()) {
        $conn->rollBack();
    }
    http_response_code(500);
    echo json_encode(["error" => "A database error occurred while processing the offer."]);
}
