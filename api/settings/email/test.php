<?php
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}
include '../../db.php';
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST') $required_permission = 'can_add';
else if ($method === 'PUT') $required_permission = 'can_edit';
else if ($method === 'DELETE') $required_permission = 'can_delete';
else $required_permission = 'can_view';
require_once '../../auth_middleware.php';
require_permission('email_settings');
require '../../vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $recipient = $data['email'] ?? null;
    if (!$recipient) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Recipient email required"]);
        exit;
    }
    try {
        // Fetch SMTP config
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
        $mail = new PHPMailer(true);
        $mailSent = false;
        $errorMsg = '';
        try {
            // Server settings
            $mail->isSMTP();
            $mail->Host       = $smtp['host'];
            $mail->SMTPAuth   = true;
            $mail->Username   = $smtp['username'];
            $mail->Password   = decrypt_data($smtp['password']);
            
            if ($smtp['encryption'] === 'tls') {
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            } elseif ($smtp['encryption'] === 'ssl') {
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            }
            $mail->Port       = $smtp['port'];
            // Recipients
            $mail->setFrom($smtp['from_email'], $smtp['from_name']);
            $mail->addAddress($recipient);
            // Content
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $body;
            $mail->send();
            $mailSent = true;
            echo json_encode(["success" => true, "message" => "Test email successfully sent to {$recipient}."]);
        } catch (Exception $e) {
            $errorMsg = $mail->ErrorInfo ?: $e->getMessage();
            echo json_encode(["success" => false, "message" => "SMTP Error: " . $errorMsg]);
        }
        // Log Test Email
        $logStmt = $conn->prepare("
            INSERT INTO cims_email_logs (recipient_email, subject, body, status, error_message, unique_hash)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $logStmt->execute([
            $recipient,
            $subject,
            $body,
            $mailSent ? 'Delivered' : 'Failed',
            $errorMsg,
            md5('test_' . time() . '_' . $recipient)
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Server Error: " . $e->getMessage()]);
    }
}
?>
