<?php
include 'db.php';
try {
    $stmt = $conn->query("DESCRIBE cims_recruiters");
    $cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
    print_r($cols);
} catch (Exception $e) {
    echo $e->getMessage();
}
?>
