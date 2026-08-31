<?php
include 'api/db.php';

try {
    $conn->exec("ALTER TABLE cims_permissions 
        ADD COLUMN can_approve tinyint(1) DEFAULT 0,
        ADD COLUMN can_export tinyint(1) DEFAULT 0,
        ADD COLUMN scope varchar(50) DEFAULT 'All';");
    echo "Successfully added columns to 'cims_permissions'.\n";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo "Columns already exist in 'cims_permissions'.\n";
    } else {
        echo "Error: " . $e->getMessage() . "\n";
    }
}
?>
