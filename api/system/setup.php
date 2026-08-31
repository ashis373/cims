<?php
if (isset($_SERVER['HTTP_ORIGIN'])) { header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require '../db.php';
require_once '../auth_middleware.php';

try {
    $conn->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $conn->exec("DROP TABLE IF EXISTS cims_users, cims_roles, cims_permissions, cims_company_settings, cims_recruitment_settings, cims_rejection_reasons, cims_blacklist_reasons;");
    $conn->exec("SET FOREIGN_KEY_CHECKS = 1;");

    // Users
    $conn->exec("CREATE TABLE IF NOT EXISTS cims_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        mobile VARCHAR(20),
        designation VARCHAR(100),
        department VARCHAR(100),
        profile_photo VARCHAR(255),
        password_hashed VARCHAR(255) NOT NULL,
        notification_preferences JSON,
        role_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Roles
    $conn->exec("CREATE TABLE IF NOT EXISTS cims_roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role_name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Permissions
    $conn->exec("CREATE TABLE IF NOT EXISTS cims_permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role_id INT NOT NULL,
        module_name VARCHAR(50) NOT NULL,
        can_view BOOLEAN DEFAULT FALSE,
        can_add BOOLEAN DEFAULT FALSE,
        can_edit BOOLEAN DEFAULT FALSE,
        can_delete BOOLEAN DEFAULT FALSE,
        UNIQUE KEY role_module (role_id, module_name)
    )");

    // Company Settings
    $conn->exec("CREATE TABLE IF NOT EXISTS cims_company_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_name VARCHAR(100) NOT NULL,
        logo VARCHAR(255),
        website VARCHAR(255),
        timezone VARCHAR(50) DEFAULT 'UTC',
        date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY'
    )");

    // Recruitment Settings
    $conn->exec("CREATE TABLE IF NOT EXISTS cims_recruitment_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        notice_period INT DEFAULT 30,
        max_rounds INT DEFAULT 4,
        auto_duplicate_check BOOLEAN DEFAULT TRUE,
        blacklist_approval BOOLEAN DEFAULT TRUE,
        offer_expiry_days INT DEFAULT 7
    )");

    // Rejection Reasons
    $conn->exec("CREATE TABLE IF NOT EXISTS cims_rejection_reasons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reason_text VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Blacklist Reasons
    $conn->exec("CREATE TABLE IF NOT EXISTS cims_blacklist_reasons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reason_text VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Insert Default Data
    $conn->exec("INSERT INTO cims_roles (role_name, description) VALUES 
        ('Administrator', 'Full access to all system modules and settings'),
        ('HR Manager', 'Can manage candidates, jobs, and approve offers'),
        ('Recruiter', 'Can view and manage candidate pipelines'),
        ('Hiring Manager', 'Can view candidates and submit feedback')
    ");
    
    $adminId = $conn->lastInsertId() - 3;
    
    $modules = ['Dashboard', 'Candidates', 'Interviews', 'Pipeline', 'Offers', 'Risk Management', 'Reports', 'Alerts', 'Email Settings', 'System Settings'];
    $stmt = $conn->prepare("INSERT INTO cims_permissions (role_id, module_name, can_view, can_add, can_edit, can_delete) VALUES (?, ?, 1, 1, 1, 1)");
    foreach($modules as $mod) {
        $stmt->execute([$adminId, $mod]);
    }

    $hashed = password_hash('password123', PASSWORD_BCRYPT);
    $notifs = json_encode(['email' => true, 'interviews' => true, 'offers' => true, 'candidates' => false, 'system' => true]);
    $conn->exec("INSERT INTO cims_users (full_name, email, mobile, designation, department, password_hashed, notification_preferences, role_id) 
        VALUES ('Admin User', 'admin@hexalearn.com', '+1 (555) 123-4567', 'Senior HR Manager', 'software development', '$hashed', '$notifs', $adminId)
    ");

    $conn->exec("INSERT INTO cims_company_settings (company_name, website, timezone, date_format) VALUES ('Hexalearn Solutions', 'https://hexalearn.com', 'UTC', 'MM/DD/YYYY')");
    $conn->exec("INSERT INTO cims_recruitment_settings (notice_period, max_rounds, auto_duplicate_check, blacklist_approval, offer_expiry_days) VALUES (30, 4, 1, 1, 7)");
    
    $reasons = ['Not a culture fit', 'Lacking required technical skills', 'Salary expectations too high', 'Position closed/on hold'];
    $stmt = $conn->prepare("INSERT INTO cims_rejection_reasons (reason_text) VALUES (?)");
    foreach($reasons as $r) $stmt->execute([$r]);

    $blacklists = ['Falsified resume/information', 'Unprofessional behavior during interview', 'No show without prior notice', 'Failed background check'];
    $stmt = $conn->prepare("INSERT INTO cims_blacklist_reasons (reason_text) VALUES (?)");
    foreach($blacklists as $b) $stmt->execute([$b]);

    echo "Tables created and seeded successfully.";

} catch(PDOException $e) {
    die("Database Error: " . $e->getMessage());
}
?>
