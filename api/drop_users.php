<?php
if (isset($_SERVER['HTTP_ORIGIN'])) { header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require 'db.php';
$conn->exec("SET FOREIGN_KEY_CHECKS = 0;");
$conn->exec("DROP TABLE IF EXISTS cims_users;");
$conn->exec("SET FOREIGN_KEY_CHECKS = 1;");
echo "Dropped";
?>
