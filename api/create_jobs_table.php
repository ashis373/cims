<?php
if (isset($_SERVER['HTTP_ORIGIN'])) { header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require 'db.php';

try {
    $conn->exec("CREATE TABLE IF NOT EXISTS cims_jobs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        job_id VARCHAR(20) NOT NULL,
        title VARCHAR(100) NOT NULL,
        department VARCHAR(100) NOT NULL,
        location VARCHAR(100) NOT NULL,
        openings INT DEFAULT 1,
        applications INT DEFAULT 0,
        status VARCHAR(20) DEFAULT 'Open',
        date VARCHAR(20) NOT NULL,
        author VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    // Check if empty
    $stmt = $conn->query("SELECT COUNT(*) FROM jobs");
    $count = $stmt->fetchColumn();
    
    if ($count == 0) {
        $mockJobs = [
          ['JOB-001', 'Senior Frontend Engineer', 'Engineering', 'Remote', 3, 145, 'Open', 'Oct 12, 2023', 'John Doe'],
          ['JOB-002', 'Product Manager', 'Product', 'New York, NY', 1, 82, 'Open', 'Oct 10, 2023', 'Sarah Smith'],
          ['JOB-003', 'UX Designer', 'Design', 'San Francisco, CA', 2, 56, 'On Hold', 'Oct 05, 2023', 'John Doe'],
          ['JOB-004', 'Data Scientist', 'Data & Analytics', 'Remote', 1, 110, 'Filled', 'Sep 28, 2023', 'Mike Johnson'],
          ['JOB-005', 'Marketing Director', 'Marketing', 'Chicago, IL', 1, 45, 'Closed', 'Sep 15, 2023', 'Sarah Smith'],
          ['JOB-006', 'DevOps Engineer', 'Engineering', 'Remote', 2, 67, 'Open', 'Sep 10, 2023', 'John Doe'],
          ['JOB-007', 'Security Analyst', 'Security', 'Austin, TX', 1, 34, 'Open', 'Sep 05, 2023', 'Mike Johnson']
        ];
        
        $stmt = $conn->prepare("INSERT INTO jobs (job_id, title, department, location, openings, applications, status, date, author) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        foreach($mockJobs as $job) {
            $stmt->execute($job);
        }
        echo "Table created and mock data inserted successfully.";
    } else {
        echo "Table already has data.";
    }
} catch (PDOException $e) {
    die("Error: " . $e->getMessage());
}
?>
