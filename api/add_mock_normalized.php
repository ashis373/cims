<?php
if (isset($_SERVER['HTTP_ORIGIN'])) { header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

include 'db.php';

$firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Chris', 'Jessica', 'Matthew', 'Ashley', 'Daniel', 'Amanda', 'James', 'Melissa', 'Robert', 'Michelle'];
$lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas'];
$roles = ['Frontend Engineer', 'Backend Engineer', 'Full Stack Developer', 'DevOps Engineer', 'Data Scientist', 'Product Manager', 'UX Designer', 'Marketing Manager', 'QA Engineer', 'Sales Representative'];
$departments = ['Engineering', 'Product', 'Design', 'Data & Analytics', 'Marketing', 'Operations', 'Security'];
$sources = ['Website', 'LinkedIn', 'Job Board', 'Referral', 'Other'];
$stages = ['New Applicant', 'Shortlisted', 'HR Call Scheduled', 'Interview Scheduled', 'Interview Completed', 'Offer Released', 'Offer Accepted', 'Offer Declined', 'Offer Expired', 'Joined', 'Rejected', 'No Show', 'On Hold'];
$skillsPool = ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes', 'Java', 'C++', 'SQL', 'NoSQL'];
$locations = ['Bangalore', 'Mumbai', 'Pune', 'Hyderabad', 'Delhi', 'Chennai', 'Remote'];

for ($i = 0; $i < 68; $i++) {
    $id = uniqid('cand_');
    $name = $firstNames[array_rand($firstNames)] . ' ' . $lastNames[array_rand($lastNames)];
    $email = strtolower(str_replace(' ', '.', $name)) . rand(100,999) . '@example.com';
    $phone = '98' . rand(10000000, 99999999);
    
    $role = $roles[array_rand($roles)];
    $source = $sources[array_rand($sources)];
    $stage = $stages[array_rand($stages)];
    $location = $locations[array_rand($locations)];
    $experience = rand(1, 15) . ' years';
    $appliedAt = date('Y-m-d H:i:s', strtotime('-' . rand(0, 60) . ' days'));
    
    $numSkills = rand(3, 5);
    $selectedSkills = [];
    $keys = array_rand($skillsPool, $numSkills);
    foreach ((array)$keys as $k) {
        $selectedSkills[] = $skillsPool[$k];
    }
    $skills = json_encode($selectedSkills);

    // Insert Candidate
    $stmt = $conn->prepare("INSERT INTO cims_candidates (id, name, email, phone, location, experience, skills, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$id, $name, $email, $phone, $location, $experience, $skills, $appliedAt, $appliedAt]);
    
    // Insert Application
    $stmtApp = $conn->prepare("INSERT INTO cims_applications (candidate_id, role_applied, source, stage, appliedAt) VALUES (?, ?, ?, ?, ?)");
    $stmtApp->execute([$id, $role, $source, $stage, $appliedAt]);
}

echo "Successfully added 68 mock candidates into the normalized tables to reach 100 total.";
?>
