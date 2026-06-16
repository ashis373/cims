<?php
include 'db.php';
try {
    $conn->exec('ALTER TABLE applications ADD COLUMN department VARCHAR(100)');
    echo "Success";
} catch (PDOException $e) {
    echo $e->getMessage();
}
?>
