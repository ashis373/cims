<?php
if (isset($_SERVER['HTTP_ORIGIN'])) { header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

include 'db.php';
try {
    $conn->exec("RENAME TABLE cims_candidates TO candidates_old");
    $conn->exec("RENAME TABLE cims_candidates_normalized TO candidates");
    echo "Tables renamed successfully.";
} catch (PDOException $e) {
    die("Rename failed: " . $e->getMessage());
}
?>
