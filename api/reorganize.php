<?php
if (isset($_SERVER['HTTP_ORIGIN'])) { header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

$mappings = [
    'api/candidates.php' => 'api/candidates/candidates.php',
    'api/duplicates.php' => 'api/candidates/duplicates.php',
    'api/timeline.php'   => 'api/candidates/timeline.php',
    'api/documents.php'  => 'api/candidates/documents.php',
    'api/notes.php'      => 'api/candidates/notes.php',
    'api/upload.php'     => 'api/candidates/upload.php',
    'api/jobs.php'       => 'api/jobs/jobs.php',
    'api/departments.php'=> 'api/jobs/departments.php',
    'api/offers.php'     => 'api/offers/offers.php',
    'api/rejected.php'   => 'api/rejections/rejected.php',
    'api/blacklisted.php'=> 'api/rejections/blacklisted.php',
    'api/reports.php'    => 'api/reports/reports.php',
    'api/stats.php'      => 'api/dashboard/stats.php',
    'api/notifications.php' => 'api/notifications/notifications.php'
];

foreach ($mappings as $old => $new) {
    if (file_exists($old)) {
        $dir = dirname($new);
        if (!is_dir($dir)) mkdir($dir, 0777, true);
        
        $content = file_get_contents($old);
        $content = str_replace("require 'db.php';", "require '../db.php';", $content);
        $content = str_replace('require "db.php";', "require '../db.php';", $content);
        file_put_contents($new, $content);
        unlink($old);
        echo "Moved $old to $new\n";
    }
}

// Now replace in src files
function updateSrcFiles($dir, $mappings) {
    $files = scandir($dir);
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') continue;
        $path = $dir . DIRECTORY_SEPARATOR . $file;
        if (is_dir($path)) {
            updateSrcFiles($path, $mappings);
        } else {
            if (preg_match('/\.tsx?$/', $path)) {
                $content = file_get_contents($path);
                $changed = false;
                foreach ($mappings as $old => $new) {
                    $search1 = "/$old";
                    $replace1 = "/$new";
                    if (strpos($content, $search1) !== false) {
                        $content = str_replace($search1, $replace1, $content);
                        $changed = true;
                    }
                }
                // Special case for API_URL in ats-store.tsx
                if (strpos($path, 'ats-store.tsx') !== false) {
                    if (strpos($content, 'const API_URL = "http://localhost/cims_api/candidates.php";') !== false) {
                        $content = str_replace('const API_URL = "http://localhost/cims_api/candidates.php";', 'const API_URL = "http://localhost/cims_api/candidates/candidates.php";', $content);
                        $changed = true;
                    }
                    if (strpos($content, 'const API_URL = `${import.meta.env.VITE_API_BASE_URL}/candidates.php`;') !== false) {
                        $content = str_replace('const API_URL = `${import.meta.env.VITE_API_BASE_URL}/candidates.php`;', 'const API_URL = `${import.meta.env.VITE_API_BASE_URL}/candidates/candidates.php`;', $content);
                        $changed = true;
                    }
                    // For hardcoded API URLs that might not have been caught
                    $content = str_replace('/cims_api/candidates.php', '/cims_api/candidates/candidates.php', $content);
                }
                
                if ($changed) {
                    file_put_contents($path, $content);
                    echo "Updated references in $path\n";
                }
            }
        }
    }
}

updateSrcFiles('src', $mappings);
echo "Done.";
?>
