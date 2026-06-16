<?php
include 'db.php';
$stmt1 = $conn->query("SELECT count(*) as count FROM candidates_old");
$c1 = $stmt1->fetch(PDO::FETCH_ASSOC);

$stmt2 = $conn->query("SELECT count(*) as count FROM candidates");
$c2 = $stmt2->fetch(PDO::FETCH_ASSOC);

echo "Old: " . $c1['count'] . ", New: " . $c2['count'];
?>
