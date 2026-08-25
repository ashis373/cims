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
        $smtpStmt = $conn->query("SELECT from_name, from_email FROM cims_smtp_config LIMIT 1");
        $smtp = $smtpStmt->fetch(PDO::FETCH_ASSOC);
        $fromName = $smtp['from_name'] ?? "ATS System";
        $fromEmail = $smtp['from_email'] ?? "no-reply@ats.local";

        // 5. Send Email (Mocking PHPMailer for local environment)
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= "From: {$fromName} <{$fromEmail}>" . "\r\n";

        // Since this is localhost without an SMTP server configured, we simulate success
        // In production, you would uncomment mail() or include PHPMailer here.
        // $mailSent = mail($recipient_email, $subject, $body, $headers);
        $mailSent = true; 

        $status = $mailSent ? 'Delivered' : 'Failed';

        // 6. Log Delivery
        $logStmt = $conn->prepare("
            INSERT INTO cims_email_logs (recipient_email, subject, body, template_id, candidate_id, status, unique_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $logStmt->execute([
            $recipient_email,
            $subject,
            $body,
            $template['id'],
            $candidate_id,
            $status,
            $unique_hash
        ]);

        return ["success" => $mailSent, "message" => "Email processed successfully."];

    } catch (Exception $e) {
        return ["success" => false, "message" => "Email sending error: " . $e->getMessage()];
    }
}
?>
