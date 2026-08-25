<?php
include 'api/db.php';
$conn->exec("UPDATE cims_email_templates SET subject = REPLACE(subject, '[Company Name]', '{{company_name}}')");
$conn->exec("UPDATE cims_email_templates SET body = REPLACE(body, '[Candidate Name]', '{{candidate_name}}')");
echo "Updated templates variables.";
?>
