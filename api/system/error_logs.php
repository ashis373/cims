<?php
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}
require '../db.php';
// Strict enforcement: Only the Administrator role can access error logs
$required_permission = 'can_view';
$allowed_roles = ['Administrator'];
require_once '../auth_middleware.php';
require_permission('users_roles');
$logFile = __DIR__ . '/../error.log';
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($logFile)) {
        $size = filesize($logFile);
        if ($size > 100 * 1024) { // Read only last 100KB
            $fp = fopen($logFile, 'r');
            fseek($fp, -100 * 1024, SEEK_END);
            $logs = fread($fp, 100 * 1024);
            fclose($fp);
            $logs = "[... Truncated, showing last 100KB ...]\n" . $logs;
        } else {
            $logs = file_get_contents($logFile);
        }
        echo json_encode(["status" => "success", "logs" => $logs]);
    } else {
        echo json_encode(["status" => "success", "logs" => ""]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Clear the error log
    if (file_exists($logFile)) {
        file_put_contents($logFile, ''); // Empty the file
    }
    echo json_encode(["status" => "success", "message" => "Logs cleared successfully."]);
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
}
?>
