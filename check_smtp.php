<?php
include('api/db.php');
$stmt = $conn->query('SELECT * FROM cims_smtp_config');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
