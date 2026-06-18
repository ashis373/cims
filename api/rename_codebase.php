<?php
if (isset($_SERVER['HTTP_ORIGIN'])) { header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

$tables = ['applications', 'candidate_documents', 'candidate_history', 'candidate_interviews', 'candidate_notes', 'candidate_offers', 'candidate_rejections', 'candidates', 'candidates_normalized', 'candidates_old', 'job_openings', 'users'];

foreach (glob(__DIR__ . '/*.php') as $file) {
    if (basename($file) === 'rename_db.php' || basename($file) === 'list_tables.php') continue;
    
    $content = file_get_contents($file);
    $changed = false;
    
    foreach ($tables as $t) {
        // Regex to replace only whole words of table names not already prefixed
        $pattern = '/(?<!cims_)\b' . preg_quote($t, '/') . '\b/';
        if (preg_match($pattern, $content)) {
            $content = preg_replace($pattern, 'cims_' . $t, $content);
            $changed = true;
        }
    }
    
    if ($changed) {
        file_put_contents($file, $content);
        echo "Updated $file\n";
    }
}
echo "Codebase tables updated successfully.\n";
?>
