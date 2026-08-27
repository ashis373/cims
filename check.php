<?php
include('api/db.php');
$stmt = $conn->query('SELECT * FROM cims_email_templates LIMIT 2');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
