<?php
require 'api/db.php';

$base = __DIR__ . '/uploads';
$dirs = [
    $base,
    $base . '/candidates',
    $base . '/candidates/resumes',
    $base . '/candidates/documents',
    $base . '/candidates/photos',
    $base . '/profiles'
];

foreach ($dirs as $d) {
    if (!is_dir($d)) mkdir($d, 0777, true);
}

// 1. Create .htaccess to prevent execution
$htaccess = "<FilesMatch \"\.(php|php3|php4|php5|php7|php8|phtml|pl|py|jsp|asp|htm|shtml|sh|cgi)$\">\n    Require all denied\n</FilesMatch>\nOptions -Indexes";
file_put_contents($base . '/.htaccess', $htaccess);

// 2. Move files from api/candidates/uploads/
$oldCandDir = __DIR__ . '/api/candidates/uploads';
if (is_dir($oldCandDir)) {
    $files = scandir($oldCandDir);
    foreach ($files as $f) {
        if ($f === '.' || $f === '..') continue;
        $ext = strtolower(pathinfo($f, PATHINFO_EXTENSION));
        $src = $oldCandDir . '/' . $f;
        
        if (in_array($ext, ['jpg', 'jpeg', 'png'])) {
            rename($src, $base . '/candidates/photos/' . $f);
        } else {
            // Check if it's a document in DB
            $stmt = $conn->prepare("SELECT id FROM cims_candidate_documents WHERE filePath = ? OR filePath LIKE ?");
            $stmt->execute([$f, "%$f"]);
            if ($stmt->rowCount() > 0) {
                rename($src, $base . '/candidates/documents/' . $f);
                // Update DB to just hold filename (already does, but just in case)
            } else {
                rename($src, $base . '/candidates/resumes/' . $f);
            }
        }
    }
}

// 3. Move files from api/uploads/profiles/
$oldProfDir = __DIR__ . '/api/uploads/profiles';
if (is_dir($oldProfDir)) {
    $files = scandir($oldProfDir);
    foreach ($files as $f) {
        if ($f === '.' || $f === '..') continue;
        rename($oldProfDir . '/' . $f, $base . '/profiles/' . $f);
    }
}

echo "Migration of files complete.\n";

// Update profile.php paths
$profilePhp = file_get_contents('api/system/profile.php');
$profilePhp = str_replace("'../uploads/profiles/'", "'../../uploads/profiles/'", $profilePhp);
$profilePhp = str_replace("'uploads/profiles/'", "'../../uploads/profiles/'", $profilePhp);
file_put_contents('api/system/profile.php', $profilePhp);

// Update extract_resume.php paths
$extPhp = file_get_contents('api/candidates/extract_resume.php');
$extPhp = str_replace("__DIR__ . '/uploads/'", "__DIR__ . '/../../uploads/candidates/resumes/'", $extPhp);
file_put_contents('api/candidates/extract_resume.php', $extPhp);

// Update documents.php paths
$docPhp = file_get_contents('api/candidates/documents.php');
$docPhp = str_replace("'uploads/'", "'../../uploads/candidates/documents/'", $docPhp);
// For reading existing
$docPhp = str_replace("'uploads/' . \$doc['filePath']", "'../../uploads/candidates/documents/' . basename(\$doc['file_path'])", $docPhp);
file_put_contents('api/candidates/documents.php', $docPhp);

echo "Backend scripts updated.\n";
?>
