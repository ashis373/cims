<?php
if (isset($_SERVER['HTTP_ORIGIN'])) { header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

$fixes = [
    '/candidates.php' => '/candidates/candidates.php',
    '/duplicates.php' => '/candidates/duplicates.php',
    '/timeline.php'   => '/candidates/timeline.php',
    '/documents.php'  => '/candidates/documents.php',
    '/notes.php'      => '/candidates/notes.php',
    '/upload.php'     => '/candidates/upload.php',
    '/jobs.php'       => '/jobs/jobs.php',
    '/departments.php'=> '/jobs/departments.php',
    '/offers.php'     => '/offers/offers.php',
    '/rejected.php'   => '/rejections/rejected.php',
    '/blacklisted.php'=> '/rejections/blacklisted.php',
    '/reports.php'    => '/reports/reports.php',
    '/stats.php'      => '/dashboard/stats.php',
    '/notifications.php' => '/notifications/notifications.php'
];

function updateSrcFiles2($dir, $fixes) {
    $files = scandir($dir);
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') continue;
        $path = $dir . DIRECTORY_SEPARATOR . $file;
        if (is_dir($path)) {
            updateSrcFiles2($path, $fixes);
        } else {
            if (preg_match('/\.tsx?$/', $path)) {
                $content = file_get_contents($path);
                $changed = false;
                foreach ($fixes as $old => $new) {
                    if (strpos($content, $old) !== false) {
                        $content = str_replace($old, $new, $content);
                        $changed = true;
                    }
                }
                if ($changed) {
                    file_put_contents($path, $content);
                    echo "Updated $path\n";
                }
            }
        }
    }
}

updateSrcFiles2('src', $fixes);
echo "Done.";
?>
