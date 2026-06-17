<?php
include 'db.php';
try {
    $conn->exec('ALTER TABLE cims_applications ADD COLUMN department VARCHAR(100)');
    echo "Success";
} catch (PDOException $e) {
    echo $e->getMessage();
}
?>
