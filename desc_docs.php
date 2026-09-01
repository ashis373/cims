<?php
require 'api/db.php';
$stmt = $conn->query("DESCRIBE cims_candidate_documents");
$cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
print_r(array_column($cols, 'Field'));
?>
