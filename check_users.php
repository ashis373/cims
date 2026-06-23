<?php
require 'api/db.php';
$stmt = $conn->query("
    SELECT u.id, u.full_name, u.email, u.designation, u.department, u.is_active, u.created_at, r.role_name as role, r.id as role_id,
    (SELECT log_time FROM system_audit_logs WHERE user_id = u.id AND action = 'Login' ORDER BY log_time DESC LIMIT 1) as last_login
    FROM system_users u
    LEFT JOIN system_roles r ON u.role_id = r.id
    ORDER BY u.created_at DESC
");
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode(["status" => "success", "data" => $users]);
?>
