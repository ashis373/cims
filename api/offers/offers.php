<?php
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
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
require_permission('offers');
$method = $_SERVER['REQUEST_METHOD'];
try {
    if ($method === 'GET') {
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
        
        $id = $_GET['id'];
        $action = $data['action'] ?? '';
        
        $conn->beginTransaction();
        
        // Fetch offer info
        $stmt = $conn->prepare("SELECT o.*, a.candidate_id FROM cims_candidate_offers o JOIN cims_applications a ON o.application_id = a.id WHERE o.id = ?");
        $stmt->execute([$id]);
        $offer = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$offer) {
            http_response_code(404);
            echo json_encode(["error" => "Offer not found"]);
            exit;
        }
        $candidateId = $offer['candidate_id'];
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
            $stmtHist = $conn->prepare("INSERT INTO cims_candidate_history (candidate_id, action, details) VALUES (?, 'Offer Updated', 'Candidate marked as Joined')");
            $stmtHist->execute([$candidateId]);
        } elseif ($action === 'send_reminder') {
            // In a real app, send email here. Just log history.
            $stmtHist = $conn->prepare("INSERT INTO cims_candidate_history (candidate_id, action, details) VALUES (?, 'Reminder Sent', 'Sent joining reminder to candidate')");
            $stmtHist->execute([$candidateId]);
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
                    
                    $stmtHist = $conn->prepare("INSERT INTO cims_candidate_history (candidate_id, action, details) VALUES (?, 'Offer Updated', ?)");
                    $stmtHist->execute([$candidateId, "Offer status changed to " . $data['offerStatus']]);
                }
            }
        }
        
        $conn->commit();
        echo json_encode(["success" => true]);
    }
} catch (PDOException $e) {
    if(isset($conn) && $conn->inTransaction()) {
        $conn->rollBack();
    }
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
