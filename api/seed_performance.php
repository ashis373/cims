<?php
if (isset($_SERVER['HTTP_ORIGIN'])) { header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

include 'db.php';

try {
    try {
        $conn->exec("ALTER TABLE cims_applications ADD COLUMN stageReason TEXT");
    } catch(Exception $e) {}
    
    $conn->beginTransaction();

    $recruiters = ['Alice Smith', 'Bob Johnson', 'Charlie Davis', 'Diana Prince'];
    $roles = ['Frontend Developer', 'Backend Developer', 'UI/UX Designer', 'Product Manager'];
    $rejectionReasons = ['High Salary Expectation', 'Poor Technical Skills', 'Not Culture Fit', 'Location Issue', 'Lacked Experience'];
    $noJoinReasons = ['Got better offer', 'Ghosted HR', 'Personal Emergency', 'Counter offer accepted'];
    
    // Funnel distribution weights
    // Out of 100 applications:
    // 40 stay New Applicant
    // 20 Rejected
    // 10 Shortlisted
    // 15 Interview Scheduled
    // 5 No Show
    // 5 Offer Released
    // 5 Joined

    for ($i = 0; $i < 150; $i++) {
        $recruiter = $recruiters[array_rand($recruiters)];
        $role = $roles[array_rand($roles)];
        
        // Random date in last 60 days
        $daysAgo = rand(1, 60);
        $date = date('Y-m-d H:i:s', strtotime("-$daysAgo days"));
        
        $rand = rand(1, 100);
        $stageReason = null;
        
        if ($rand <= 30) {
            $stage = 'New Applicant';
        } elseif ($rand <= 50) {
            $stage = 'Rejected';
        } elseif ($rand <= 60) {
            $stage = 'Shortlisted';
        } elseif ($rand <= 75) {
            $stage = 'Interview Scheduled';
        } elseif ($rand <= 85) {
            $stage = 'No Show';
            $stageReason = $noJoinReasons[array_rand($noJoinReasons)];
        } elseif ($rand <= 92) {
            $stage = 'Offer Released';
        } else {
            $stage = 'Joined';
        }

        // Insert mock candidate
        $uid = uniqid();
        $name = "Mock Candidate $uid";
        
        $stmtCand = $conn->prepare("INSERT INTO cims_candidates (id, name, email, phone) VALUES (?, ?, ?, ?)");
        $stmtCand->execute([$uid, $name, "$uid@example.com", "1234567890"]);
        
        // Insert mock application
        $stmtApp = $conn->prepare("INSERT INTO cims_applications (candidate_id, role_applied, recruiter, stage, stageReason, appliedAt) VALUES (?, ?, ?, ?, ?, ?)");
        $stmtApp->execute([$uid, $role, $recruiter, $stage, $stageReason, $date]);
        
        // If rejected, insert rejection reason
        if ($stage === 'Rejected') {
            $reason = $rejectionReasons[array_rand($rejectionReasons)];
            $stmtRej = $conn->prepare("INSERT INTO cims_candidate_rejections (candidate_id, type, reason) VALUES (?, 'Rejected', ?)");
            $stmtRej->execute([$uid, $reason]);
        }
    }

    $conn->commit();
    echo "Seeded 150 records successfully!";
} catch (Exception $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    echo "Error: " . $e->getMessage();
}
?>
