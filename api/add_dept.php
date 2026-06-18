<?php
if (isset($_SERVER['HTTP_ORIGIN'])) { header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

include 'db.php';
try {
    $conn->exec('ALTER TABLE cims_applications ADD COLUMN department VARCHAR(100)');
    echo "Success";
} catch (PDOException $e) {
    echo $e->getMessage();
}
?>
