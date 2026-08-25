<?php
include 'api/db.php';
$stmt = $conn->query("SHOW TABLES LIKE 'cims_email%'");
print_r($stmt->fetchAll(PDO::FETCH_COLUMN));

$stmt2 = $conn->query("SHOW TABLES LIKE 'cims_smtp%'");
print_r($stmt2->fetchAll(PDO::FETCH_COLUMN));
?>
