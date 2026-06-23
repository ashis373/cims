<?php
require 'api/db.php';
$stmt = $conn->prepare("UPDATE system_permissions SET can_add=0, can_edit=0, can_delete=0 WHERE role_id=2 AND module_name IN ('Candidates', 'Interviews')");
$stmt->execute();
echo "Updated to view only\n";
?>
