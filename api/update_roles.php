<?php
if (isset($_SERVER['HTTP_ORIGIN'])) { header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require 'db.php';
try {
    $conn->exec("UPDATE system_roles SET description = 'Full Access' WHERE role_name = 'Administrator'");
    $conn->exec("UPDATE system_roles SET description = 'View All, Approvals, Reports' WHERE role_name = 'HR Manager'");
    $conn->exec("UPDATE system_roles SET description = 'Candidate Management, Interview Tracking' WHERE role_name = 'Recruiter'");
    $conn->exec("UPDATE system_roles SET description = 'Interview Feedback, Candidate Review' WHERE role_name = 'Hiring Manager'");
    echo 'Done';
} catch(PDOException $e) {
    echo $e->getMessage();
}
?>
