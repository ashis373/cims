<?php
if (isset($_SERVER['HTTP_ORIGIN'])) { header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require 'db.php';

try {
    $conn->exec("CREATE TABLE IF NOT EXISTS cims_departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        color_theme VARCHAR(255) DEFAULT 'bg-slate-500/12 text-slate-700 dark:text-slate-300 border-slate-500/25',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    $defaultDepts = [
        ["Elearning", "bg-blue-500/12 text-blue-700 dark:text-blue-300 border-blue-500/25"],
        ["software development", "bg-violet-500/12 text-violet-700 dark:text-violet-300 border-violet-500/25"],
        ["multimedia design", "bg-fuchsia-500/12 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-500/25"],
        ["QA testing", "bg-cyan-500/12 text-cyan-700 dark:text-cyan-300 border-cyan-500/25"],
        ["Digital Marketing", "bg-orange-500/12 text-orange-700 dark:text-orange-300 border-orange-500/25"],
        ["Business Development", "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/25"]
    ];

    $stmt = $conn->prepare("INSERT IGNORE INTO cims_departments (name, color_theme) VALUES (?, ?)");
    foreach ($defaultDepts as $dept) {
        $stmt->execute($dept);
    }

    echo "Departments table created and seeded successfully.";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
