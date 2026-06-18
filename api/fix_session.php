<?php
if (isset($_SERVER['HTTP_ORIGIN'])) { header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require 'db.php';
$stmt = $conn->query("SELECT id FROM system_users WHERE email='ashiskrout1@gmail.com'");
$id = $stmt->fetchColumn();

if ($id) {
    // Update the hardcoded $_SESSION['user_id'] = 1 to the actual ID in profile.php
    $c = file_get_contents('system/profile.php');
    $c = str_replace("\$_SESSION['user_id'] = 1;", "\$_SESSION['user_id'] = $id;", $c);
    file_put_contents('system/profile.php', $c);
    echo "Updated profile.php to use ID: $id";
}
?>
