<?php
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-User-Id");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include '../db.php';
$required_module = 'Candidate Management';
$required_permission = 'can_add';
require_once '../auth_middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($_FILES['resume'])) {
    echo json_encode(["success" => false, "error" => "No file uploaded or file exceeds server upload limits (upload_max_filesize)."]);
    exit;
}

$file = $_FILES['resume'];

if ($file['error'] !== UPLOAD_ERR_OK) {
    if ($file['error'] === UPLOAD_ERR_INI_SIZE || $file['error'] === UPLOAD_ERR_FORM_SIZE) {
        echo json_encode(["success" => false, "error" => "File exceeds maximum size of 5MB or server upload_max_filesize limit."]);
        exit;
    }
    echo json_encode(["success" => false, "error" => "File upload error code: " . $file['error']]);
    exit;
}

$file = $_FILES['resume'];
$tmpPath = $file['tmp_name'];
$fileName = $file['name'];
$fileSize = $file['size'];
$ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

$allowed_exts = ['pdf', 'doc', 'docx'];
if (!in_array($ext, $allowed_exts)) {
    echo json_encode(["success" => false, "error" => "Unsupported file format. Please upload PDF, DOC, or DOCX."]);
    exit;
}

if ($fileSize > 5 * 1024 * 1024) {
    echo json_encode(["success" => false, "error" => "File exceeds maximum size of 5MB."]);
    exit;
}

$text = "";

require_once __DIR__ . '/../../vendor/autoload.php';

if ($ext === 'pdf') {
    try {
        $parser = new \Smalot\PdfParser\Parser();
        $pdf = $parser->parseFile($tmpPath);
        $text = $pdf->getText();
    } catch (Exception $e) {
        $text = "";
    }
} else {
    // For DOC/DOCX/TXT try raw extraction
    $text = file_get_contents($tmpPath);
    // basic cleanup for docx xml
    $text = strip_tags(str_replace(['<w:t>', '<w:t '], ' ', $text));
}

// Clean up text
$text = preg_replace('/\s+/', ' ', $text);

if (strlen(trim($text)) < 50) {
    // Treat as image-only / scanned PDF
    $text = "";
}

$data = [
    "name" => "",
    "email" => "",
    "phone" => "",
    "experience" => "",
    "skills" => "",
    "currentCompany" => "",
    "currentDesignation" => "",
    "location" => "",
    "linkedInProfile" => "",
    "currentCtc" => "",
    "noticePeriod" => ""
];

// 1. Email Extraction
if (preg_match('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', $text, $match)) {
    $data['email'] = strtolower($match[0]);
}

// 2. Phone Extraction (Indian formats or standard 10 digit)
if (preg_match('/(?:\+?91[-.\s]?)?[6789]\d{9}/', preg_replace('/[^\d+]/', '', $text), $match)) {
    $phone = preg_replace('/^\+?91/', '', $match[0]);
    if (strlen($phone) == 10) {
        $data['phone'] = $phone;
    }
}

// 3. LinkedIn Extraction
if (preg_match('/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i', $text, $match)) {
    $data['linkedInProfile'] = "https://www." . strtolower($match[0]);
}

// 4. Experience Extraction
if (preg_match('/(?:(\d+(?:\.\d+)?)\s*(?:years?|yrs?|yr)\s*(?:and\s*(\d{1,2})\s*(?:months?|mos?))?)/i', $text, $match)) {
    $data['experience'] = $match[1];
}

// 5. Skills Extraction (matching against a known list)
$known_skills = ['React', 'Angular', 'Vue', 'Node.js', 'Python', 'Java', 'C++', 'PHP', 'Laravel', 'SQL', 'MySQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind', 'Git'];
$found_skills = [];
foreach ($known_skills as $skill) {
    if (stripos($text, $skill) !== false) {
        $found_skills[] = $skill;
    }
}
if (!empty($found_skills)) {
    $data['skills'] = implode(", ", array_unique($found_skills));
}

// 6. Basic Name heuristic: Look for capitalized words near the beginning of the file, or near email/phone
// This is very rudimentary.
if (empty($data['name'])) {
    // If the file is named something like John_Doe_Resume.pdf
    $nameParts = preg_split('/[^a-zA-Z]/', pathinfo($fileName, PATHINFO_FILENAME));
    $nameParts = array_filter($nameParts, function($p) { return strlen($p) > 2 && strtolower($p) !== 'resume' && strtolower($p) !== 'cv'; });
    if (count($nameParts) >= 2) {
        $data['name'] = ucfirst($nameParts[0]) . ' ' . ucfirst($nameParts[1]);
    }
}

// 7. Location heuristic
$known_cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur', 'Noida', 'Gurgaon'];
foreach ($known_cities as $city) {
    if (preg_match('/\b' . $city . '\b/i', $text)) {
        $data['location'] = $city;
        break;
    }
}

// Upload the file as well so the user doesn't have to upload it twice
$uploadDir = __DIR__ . '/../../uploads/candidates/resumes/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}
$newFilename = time() . '_' . preg_replace('/[^a-zA-Z0-9.-]/', '_', $fileName);
$destination = $uploadDir . $newFilename;
$resumeUrl = "";
if (move_uploaded_file($tmpPath, $destination)) {
    $resumeUrl = $newFilename;
}

echo json_encode([
    "success" => true,
    "data" => $data,
    "resume" => $resumeUrl,
    "rawTextLength" => strlen($text)
]);
