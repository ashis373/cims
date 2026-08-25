<?php
include 'api/db.php';

try {
    $stmt = $conn->prepare("UPDATE cims_smtp_config SET host=?, port=?, username=?, password=?, encryption=?, from_name=?, from_email=? WHERE id=1");
    $stmt->execute([
        'smtp.gmail.com', 
        587, 
        'asghis@gmail.com', 
        'YOUR_16_CHARACTER_APP_PASSWORD', 
        'tls', 
        'CIMS Recruitment', 
        'asghis@gmail.com'
    ]);
    echo "SMTP config updated successfully.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
