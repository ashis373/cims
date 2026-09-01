<?php
include 'api/db.php';
try {
    $conn->exec("ALTER TABLE cims_roles ADD COLUMN permissions JSON NULL");
    echo "permissions column added\n";
} catch(Exception $e) { echo $e->getMessage() . "\n"; }
?>
