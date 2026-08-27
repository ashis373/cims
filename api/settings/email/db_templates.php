<?php
include '../../db.php';
try {
    $stmt = $conn->query("SELECT name FROM cims_email_templates");
    $templates = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if (count($templates) == 0) {
        $sql = "INSERT INTO cims_email_templates (name, subject, category, sending_method, is_active) VALUES 
        ('Interview Invitation', 'Invitation to Interview', 'Interview', 'Automatic', 1),
        ('Offer Letter', 'Job Offer from Company', 'Offer', 'Automatic', 1),
        ('Rejection Email', 'Update on your application', 'Rejection', 'Manual', 1),
        ('Custom Template', 'Custom Subject', 'Custom', 'Manual', 0)";
        $conn->exec($sql);
        echo "Inserted default templates.\n";
    } else {
        echo "Templates already exist:\n";
        print_r($templates);
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
