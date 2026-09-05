<?php
/**
 * Email Sender Utility for CIMS
 * Handles fetching templates, replacing placeholders, checking duplicates, and sending emails.
 */

function sendEventEmail($conn, $trigger_event, $candidateData, $attachments = []) {
    try {
        // 1. Get Template
        $stmt = $conn->prepare("SELECT id, subject, body, is_active FROM cims_email_templates WHERE trigger_event = ? LIMIT 1");
        $stmt->execute([$trigger_event]);
        $template = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$template || !$template['is_active']) {
            return ["success" => false, "message" => "Template not found or inactive for trigger: " . $trigger_event];
        }

        // 2. Prevent Duplicates (Hash = template_id + candidate_id)
        $candidate_id = $candidateData['id'] ?? null;
        $recipient_email = $candidateData['email'] ?? null;
        
        if (!$recipient_email) {
            return ["success" => false, "message" => "No recipient email provided."];
        }

        $unique_hash = md5($template['id'] . "_" . $candidate_id);

        $checkStmt = $conn->prepare("SELECT id FROM cims_email_logs WHERE unique_hash = ?");
        $checkStmt->execute([$unique_hash]);
        if ($checkStmt->rowCount() > 0) {
            return ["success" => false, "message" => "Email already sent to this candidate for this event."];
        }

        // 3. Replace Placeholders (using {{variable_name}} format)
        $subject = str_replace("{{company_name}}", "CIMS Solutions", $template['subject']);
        $body = $template['body'];
        foreach ($candidateData as $key => $value) {
            // Replace e.g., {{candidate_name}} -> John Doe
            $placeholder = "{{" . strtolower(trim($key)) . "}}";
            $body = str_replace($placeholder, $value, $body);
        }

        // 4. Get SMTP Config
        $smtpStmt = $conn->query("SELECT * FROM cims_smtp_config LIMIT 1");
        $smtp = $smtpStmt->fetch(PDO::FETCH_ASSOC);

        $mailSent = false;
        $status = 'Failed';
        $errorMsg = '';

        if ($smtp && $smtp['host']) {
            $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
            try {
                $mail->isSMTP();
                $mail->Host       = $smtp['host'];
                $mail->SMTPAuth   = true;
                $mail->Username   = $smtp['username'];
                $mail->Password   = decrypt_data($smtp['password']);
                if ($smtp['encryption'] === 'tls') $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
                elseif ($smtp['encryption'] === 'ssl') $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
                $mail->Port       = $smtp['port'];

                $mail->setFrom($smtp['from_email'], $smtp['from_name']);
                $mail->addAddress($recipient_email);
                $mail->isHTML(true);
                $mail->Subject = $subject;
                $mail->Body    = $body;

                $mail->send();
                $mailSent = true;
                $status = 'Delivered';
            } catch (\Exception $e) {
                $errorMsg = $mail->ErrorInfo;
            }
        } else {
            $errorMsg = "SMTP config incomplete.";
        }

        // 6. Log Delivery
        $logStmt = $conn->prepare("
            INSERT INTO cims_email_logs (recipient_email, subject, body, template_id, candidate_id, status, error_message, unique_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $logStmt->execute([
            $recipient_email,
            $subject,
            $body,
            $template['id'],
            $candidate_id,
            $status,
            $errorMsg,
            $unique_hash
        ]);

        return ["success" => $mailSent, "message" => $mailSent ? "Email processed successfully." : $errorMsg];

    } catch (\Exception $e) {
        return ["success" => false, "message" => "Email sending error: " . $e->getMessage()];
    }
}
?>
