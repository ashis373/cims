<?php
require 'api/db.php';
$stmt = $conn->query("SELECT * FROM system_roles");
$roles = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode(["status" => "success", "data" => $roles]);
?>
