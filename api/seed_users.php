<?php
if (isset($_SERVER['HTTP_ORIGIN'])) { header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require 'db.php';

try {
    // Attempt to add is_active column if it doesn't exist
    try {
        $conn->exec("ALTER TABLE system_users ADD COLUMN is_active BOOLEAN DEFAULT TRUE");
    } catch (PDOException $e) {
        // Column likely already exists, ignore
    }

    $users = [
        [
            'full_name' => 'Super Admin',
            'email' => 'ashiskrout1@gmail.com',
            'password' => 'Admin@123',
            'role_name' => 'Administrator',
            'department' => 'Management',
            'designation' => 'System Administrator',
            'is_active' => 1
        ],
        [
            'full_name' => 'HR Manager',
            'email' => 'hrmanager@hireflow.com',
            'password' => 'HRManager@123',
            'role_name' => 'HR Manager',
            'department' => 'Human Resources',
            'designation' => 'HR Manager',
            'is_active' => 1
        ],
        [
            'full_name' => 'Recruiter One',
            'email' => 'recruiter@hireflow.com',
            'password' => 'Recruiter@123',
            'role_name' => 'Recruiter',
            'department' => 'Talent Acquisition',
            'designation' => 'Recruiter',
            'is_active' => 1
        ],
        [
            'full_name' => 'Hiring Manager',
            'email' => 'hiringmanager@hireflow.com',
            'password' => 'HiringManager@123',
            'role_name' => 'Hiring Manager',
            'department' => 'Engineering',
            'designation' => 'Hiring Manager',
            'is_active' => 1
        ]
    ];

    $notifs = json_encode(['email' => true, 'interviews' => true, 'offers' => true, 'candidates' => true, 'system' => true]);

    foreach ($users as $user) {
        // Check for duplicate
        $stmtCheck = $conn->prepare("SELECT id FROM system_users WHERE email = ?");
        $stmtCheck->execute([$user['email']]);
        if ($stmtCheck->fetch()) {
            echo "User already exists: {$user['email']}\n";
            continue;
        }

        // Get Role ID
        $stmtRole = $conn->prepare("SELECT id FROM system_roles WHERE role_name = ?");
        $stmtRole->execute([$user['role_name']]);
        $roleId = $stmtRole->fetchColumn();

        if (!$roleId) {
            echo "Role not found for: {$user['role_name']}\n";
            continue;
        }

        $hashedPassword = password_hash($user['password'], PASSWORD_BCRYPT);

        $stmtInsert = $conn->prepare("
            INSERT INTO system_users 
            (full_name, email, password_hashed, role_id, department, designation, notification_preferences, is_active) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmtInsert->execute([
            $user['full_name'],
            $user['email'],
            $hashedPassword,
            $roleId,
            $user['department'],
            $user['designation'],
            $notifs,
            $user['is_active']
        ]);

        echo "Successfully created user: {$user['full_name']} ({$user['email']})\n";
    }
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
