<?php
require 'api/db.php';
$stmt = $conn->query('SELECT u.email, u.role_id, r.role_name FROM system_users u LEFT JOIN system_roles r ON u.role_id = r.id');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
