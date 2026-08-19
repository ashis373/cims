<?php
// local server credentials

$host = "localhost";
$dbname = "cims";
$username = "root";
$password = "";

date_default_timezone_set('Asia/Kolkata');

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
} catch (PDOException $e) {
    die(json_encode(["error" => "Connection Failed: " . $e->getMessage()]));
}






// Server credentials for production server

// $host = "localhost";
// $dbname = "u413479707_demohub";
// $username = "u413479707_hexadev";
// $password = "hexadev$0014B";

// try {
//     $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
//     $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
// } catch (PDOException $e) {
//     die(json_encode(["error" => "Connection Failed: " . $e->getMessage()]));
// }


?>




