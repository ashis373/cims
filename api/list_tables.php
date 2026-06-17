<?php
include 'db.php';
$stmt = $conn->query("SHOW TABLES");
$tables = [];
while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
    $tables[] = $row[0];
}
echo json_encode($tables);
?>
