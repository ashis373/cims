<?php
require 'api/db.php';
try {
    $conn->exec("
        CREATE TABLE IF NOT EXISTS system_permissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            role_id INT NOT NULL,
            module_name VARCHAR(100) NOT NULL,
            can_view TINYINT(1) DEFAULT 0,
            can_add TINYINT(1) DEFAULT 0,
            can_edit TINYINT(1) DEFAULT 0,
            can_delete TINYINT(1) DEFAULT 0,
            UNIQUE KEY unique_role_module (role_id, module_name)
        )
    ");
    echo "Permissions table created.\n";
} catch (Exception $e) {
    echo $e->getMessage();
}
?>
