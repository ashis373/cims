<?php
include 'db.php';
try {
    $conn->exec("RENAME TABLE candidates TO candidates_old");
    $conn->exec("RENAME TABLE candidates_normalized TO candidates");
    echo "Tables renamed successfully.";
} catch (PDOException $e) {
    die("Rename failed: " . $e->getMessage());
}
?>
