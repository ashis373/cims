<?php
$host = "localhost";
$dbname = "cims";
$username = "root";
$password = "";

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // echo "Database Connected Successfully";
} catch (PDOException $e) {
    die(json_encode(["error" => "Connection Failed: " . $e->getMessage()]));
}
?>
