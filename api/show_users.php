<?php
include 'db.php';
$stmt = $conn->query('SELECT * FROM cims_users');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
