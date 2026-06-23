<?php
require 'api/db.php';
$stmt = $conn->query("SELECT DISTINCT module_name FROM system_permissions");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
