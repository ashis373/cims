<?php
include 'db.php';

$firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Chris', 'Jessica', 'Matthew', 'Ashley', 'Daniel', 'Amanda', 'James', 'Melissa', 'Robert', 'Michelle', 'William', 'Laura', 'Joseph', 'Stephanie', 'Richard', 'Rebecca', 'Thomas', 'Sharon', 'Charles', 'Cynthia'];
$lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez'];

$roles = ['Frontend Engineer', 'Backend Engineer', 'Full Stack Developer', 'DevOps Engineer', 'Data Scientist', 'Product Manager', 'UX Designer', 'Marketing Manager', 'QA Engineer', 'Sales Representative'];
$departments = ['Engineering', 'Product', 'Design', 'Data & Analytics', 'Marketing', 'Operations', 'Security'];
$sources = ['Website', 'LinkedIn', 'Job Board', 'Referral', 'Other'];
$stages = ['New Applicant', 'Shortlisted', 'HR Call Scheduled', 'Interview Scheduled', 'Interview Completed', 'Offer Released', 'Offer Accepted', 'Offer Declined', 'Offer Expired', 'Joined', 'Rejected', 'No Show', 'On Hold'];
$skillsPool = ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes', 'Java', 'C++', 'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'UI/UX', 'Figma', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Go', 'Rust'];
$locations = ['Bangalore', 'Mumbai', 'Pune', 'Hyderabad', 'Delhi', 'Chennai', 'Remote'];
$companies = ['TCS', 'Infosys', 'Wipro', 'Cognizant', 'Accenture', 'IBM', 'Capgemini', 'Tech Mahindra', 'HCL', 'Google', 'Microsoft', 'Amazon', 'Facebook', 'Netflix'];
$recruiters = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];

for ($i = 0; $i < 30; $i++) {
    $id = uniqid('cand_');
    $name = $firstNames[array_rand($firstNames)] . ' ' . $lastNames[array_rand($lastNames)];
    $email = strtolower(str_replace(' ', '.', $name)) . $i . '@example.com';
    $phone = '98' . rand(10000000, 99999999);
    $alternateMobile = '99' . rand(10000000, 99999999);
    
    $role = $roles[array_rand($roles)];
    $department = $departments[array_rand($departments)];
    $source = $sources[array_rand($sources)];
    $stage = $stages[array_rand($stages)];
    
    $totalExpNum = rand(1, 15);
    $experience = $totalExpNum . ' years';
    $relevantExperience = rand(1, $totalExpNum) . ' years';
    
    $currentCompany = $companies[array_rand($companies)];
    $currentDesignation = $role;
    $currentCtc = rand(5, 30) . ' LPA';
    $expectedCtc = rand(8, 40) . ' LPA';
    $noticePeriod = rand(1, 3) * 30 . ' days';
    
    $location = $locations[array_rand($locations)];
    $preferredLocation = $locations[array_rand($locations)];
    $linkedInProfile = 'https://linkedin.com/in/' . strtolower(str_replace(' ', '', $name));
    
    $recruiter = $recruiters[array_rand($recruiters)];
    
    $numSkills = rand(3, 6);
    $selectedSkills = [];
    $keys = array_rand($skillsPool, $numSkills);
    foreach ($keys as $k) {
        $selectedSkills[] = $skillsPool[$k];
    }
    
    $skills = json_encode($selectedSkills);
    $tags = json_encode(array_slice($selectedSkills, 0, 2));
    
    $appliedAt = date('Y-m-d H:i:s', strtotime('-' . rand(0, 60) . ' days'));
    $updatedAt = date('Y-m-d H:i:s', strtotime('-' . rand(0, 5) . ' days'));

    $stmt = $conn->prepare("INSERT INTO candidates (
        id, name, email, phone, source, role, department, stage, tags, skills, experience, relevantExperience, currentCompany, currentDesignation, currentCtc, expectedCtc, location, preferredLocation, alternateMobile, linkedInProfile, noticePeriod, recruiter, appliedAt, updatedAt
    ) VALUES (
        :id, :name, :email, :phone, :source, :role, :department, :stage, :tags, :skills, :experience, :relevantExperience, :currentCompany, :currentDesignation, :currentCtc, :expectedCtc, :location, :preferredLocation, :alternateMobile, :linkedInProfile, :noticePeriod, :recruiter, :appliedAt, :updatedAt
    )");

    $stmt->execute([
        ':id' => $id,
        ':name' => $name,
        ':email' => $email,
        ':phone' => $phone,
        ':source' => $source,
        ':role' => $role,
        ':department' => $department,
        ':stage' => $stage,
        ':tags' => $tags,
        ':skills' => $skills,
        ':experience' => $experience,
        ':relevantExperience' => $relevantExperience,
        ':currentCompany' => $currentCompany,
        ':currentDesignation' => $currentDesignation,
        ':currentCtc' => $currentCtc,
        ':expectedCtc' => $expectedCtc,
        ':location' => $location,
        ':preferredLocation' => $preferredLocation,
        ':alternateMobile' => $alternateMobile,
        ':linkedInProfile' => $linkedInProfile,
        ':noticePeriod' => $noticePeriod,
        ':recruiter' => $recruiter,
        ':appliedAt' => $appliedAt,
        ':updatedAt' => $updatedAt
    ]);
}

echo "30 mock candidates added successfully.";
?>
