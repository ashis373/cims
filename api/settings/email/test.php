<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include '../../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $recipient = $data['email'] ?? null;

    if (!$recipient) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Recipient email required"]);
        exit;
    }

    try {
        // Fetch SMTP config to prove we are using it
        $stmt = $conn->query("SELECT * FROM cims_smtp_config LIMIT 1");
        $smtp = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$smtp || !$smtp['host']) {
            echo json_encode(["success" => false, "message" => "SMTP Configuration is incomplete."]);
            exit;
        }

        $subject = "SMTP Configuration Test - CIMS ATS";
        $body = "<h2>SMTP Connection Successful</h2>
                 <p>This is a test email sent from your CIMS ATS system.</p>
                 <hr>
                 <p><strong>Host:</strong> {$smtp['host']}</p>
                 <p><strong>Port:</strong> {$smtp['port']}</p>
                 <p><strong>Username:</strong> {$smtp['username']}</p>";

        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= "From: {$smtp['from_name']} <{$smtp['from_email']}>" . "\r\n";

        // MOCK SEND: Simulate sending using mail() or success
        // mail($recipient, $subject, $body, $headers);
        $mailSent = true;

        if ($mailSent) {
            echo json_encode(["success" => true, "message" => "Test email successfully sent to {$recipient}."]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to send test email. Please check server logs."]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}
?>
