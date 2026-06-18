<?php
if (isset($_SERVER['HTTP_ORIGIN'])) { header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

include 'db.php';
$stmt1 = $conn->query("SELECT count(*) as count FROM cims_candidates_old");
$c1 = $stmt1->fetch(PDO::FETCH_ASSOC);

$stmt2 = $conn->query("SELECT count(*) as count FROM cims_candidates");
$c2 = $stmt2->fetch(PDO::FETCH_ASSOC);

echo "Old: " . $c1['count'] . ", New: " . $c2['count'];
?>
