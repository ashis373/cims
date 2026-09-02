<?php
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include '../../db.php';

$allowed_roles = ['Administrator'];
require_once '../../auth_middleware.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $conn->query("SELECT * FROM cims_smtp_config LIMIT 1");
        $config = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode($config);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if ($data) {
        try {
            $stmt = $conn->prepare("UPDATE cims_smtp_config SET host=?, port=?, username=?, password=?, encryption=?, from_name=?, from_email=? WHERE id = 1");
            $stmt->execute([
                $data['host'],
                $data['port'],
                $data['username'],
                $data['password'],
                $data['encryption'],
                $data['from_name'],
                $data['from_email']
            ]);
            echo json_encode(["success" => true, "message" => "SMTP settings saved."]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Invalid data"]);
    }
}
?>
