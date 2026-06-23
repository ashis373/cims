<?php
require 'api/db.php';
$_SERVER['REQUEST_METHOD'] = 'PUT';

$id = 3; // HR Manager
$data = [
    'full_name' => 'HR Manager Edit',
    'email' => 'hrmanager@hireflow.com',
    'role_id' => 2,
    'is_active' => true
];

$stmt = $conn->prepare("UPDATE system_users SET full_name = ?, email = ?, role_id = ?, is_active = ? WHERE id = ?");
$stmt->execute([
    $data['full_name'],
    $data['email'],
    $data['role_id'],
    $data['is_active'] ? 1 : 0,
    $id
]);
echo "Success 1\n";

$_SESSION['user_id'] = 2; // Simulate logged in super admin

$logStmt = $conn->prepare("INSERT INTO system_audit_logs (user_id, action, module, details) VALUES (?, 'Update User', 'Users', ?)");
$logStmt->execute([$_SESSION['user_id'], json_encode(['target_user_id' => $id, 'role_id' => $data['role_id']])]);

echo "Success 2\n";
?>
