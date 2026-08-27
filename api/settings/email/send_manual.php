<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include '../../db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['candidate_id']) || !isset($data['template_id']) || !isset($data['to'])) {
    echo json_encode(["success" => false, "message" => "Missing parameters"]);
    exit;
}

require '../../vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

try {
    $recipient_email = $data['to'];
    $subject = $data['subject'];
    $body = $data['body'];
    $template_id = $data['template_id'];
    $candidate_id = $data['candidate_id'];
    $unique_hash = $data['unique_hash'];

    // Get SMTP Config
    $smtpStmt = $conn->query("SELECT * FROM cims_smtp_config LIMIT 1");
    $smtp = $smtpStmt->fetch(PDO::FETCH_ASSOC);

    $mailSent = false;
    $status = 'Failed';
    $errorMsg = '';

    if ($smtp && $smtp['host']) {
        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host       = $smtp['host'];
            $mail->SMTPAuth   = true;
            $mail->Username   = $smtp['username'];
            $mail->Password   = $smtp['password'];
            if ($smtp['encryption'] === 'tls') $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            elseif ($smtp['encryption'] === 'ssl') $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            $mail->Port       = $smtp['port'];

            $mail->setFrom($smtp['from_email'], $smtp['from_name']);
            $mail->addAddress($recipient_email);
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $body;

            $mail->send();
            $mailSent = true;
            $status = 'Delivered';
        } catch (Exception $e) {
            $errorMsg = $mail->ErrorInfo;
        }
    } else {
        $errorMsg = "SMTP config incomplete.";
    }

    // Log it
    $logStmt = $conn->prepare("
        INSERT INTO cims_email_logs (recipient_email, subject, body, template_id, candidate_id, status, error_message, unique_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $logStmt->execute([
        $recipient_email,
        $subject,
        $body,
        $template_id,
        $candidate_id,
        $status,
        $errorMsg,
        $unique_hash
    ]);

    if ($mailSent) {
        echo json_encode(["success" => true, "message" => "Email sent manually!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to send email: " . $errorMsg]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
