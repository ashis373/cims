<?php
include('api/db.php');
$stmt = $conn->query('DESCRIBE cims_email_logs');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
