<?php
$host = "localhost";
$dbname = "u413479707_demohub";
$username = "u413479707_hexadev";
$password = "hexadev$0014B";

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // echo "Database Connected Successfully";
} catch (PDOException $e) {
    die(json_encode(["error" => "Connection Failed: " . $e->getMessage()]));
}
?>
