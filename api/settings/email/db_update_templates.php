<?php
include '../../db.php';
try {
    $conn->exec("DELETE FROM cims_email_templates");
    $sql = "INSERT INTO cims_email_templates (name, subject, category, sending_method, is_active, body) VALUES 
    ('Interview Invitation', 'Invitation to Interview', 'Interview', 'Automatic', 1, 'Dear {CandidateName},\n\nWe would like to invite you for an interview for the {Role} position.\n\nDate: {Date}\n\nBest regards,\nHR Team'),
    ('Offer Letter', 'Job Offer from Company', 'Offer', 'Automatic', 1, 'Dear {CandidateName},\n\nWe are pleased to offer you the position of {Role} at our company.\n\nBest regards,\nHR Team'),
    ('Rejection Email', 'Update on your application', 'Rejection', 'Manual', 1, 'Dear {CandidateName},\n\nThank you for applying for the {Role} position. Unfortunately, we will not be moving forward with your application at this time.\n\nBest regards,\nHR Team'),
    ('Custom Template', 'Custom Subject', 'Custom', 'Manual', 0, 'Dear {CandidateName},\n\nThis is a custom message.\n\nBest regards,\nHR Team')";
    $conn->exec($sql);
    echo "Updated templates.";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
