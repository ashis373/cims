<?php
$pwd = password_hash('Admin@123', PASSWORD_BCRYPT);
try {
    $conn = new PDO('mysql:host=localhost;dbname=cims', 'root', '');
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt = $conn->prepare("INSERT INTO cims_users (full_name, email, password_hashed, is_active, role_id, notification_preferences) VALUES ('Super Admin', 'ashiskrout1@gmail.com', :pwd, 1, 1, '{}')");
    $stmt->execute(['pwd' => $pwd]);
    echo "User Super Admin created successfully.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
