<?php
if (isset($_SERVER['HTTP_ORIGIN'])) { header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

$tables = ['applications', 'candidate_documents', 'candidate_history', 'candidate_interviews', 'candidate_notes', 'candidate_offers', 'candidate_rejections', 'candidates', 'candidates_normalized', 'candidates_old', 'job_openings', 'users'];

foreach (glob(__DIR__ . '/*.php') as $file) {
    if (basename($file) === 'rename_db.php' || basename($file) === 'list_tables.php' || basename($file) === 'rename_codebase.php' || basename($file) === 'rename_codebase_safe.php') continue;
    
    $content = file_get_contents($file);
    $changed = false;
    
    foreach ($tables as $t) {
        $patterns = [
            '/(FROM\s+)' . $t . '\b/i',
            '/(INTO\s+)' . $t . '\b/i',
            '/(UPDATE\s+)' . $t . '\b/i',
            '/(JOIN\s+)' . $t . '\b/i',
            '/(TABLE\s+IF\s+NOT\s+EXISTS\s+)' . $t . '\b/i',
            '/(TABLE\s+IF\s+EXISTS\s+)' . $t . '\b/i',
            '/(TABLE\s+)' . $t . '\b/i',
            '/(REFERENCES\s+)' . $t . '\b/i',
            '/(`)' . $t . '(`)/i',
        ];
        
        foreach ($patterns as $pattern) {
            $content = preg_replace_callback($pattern, function($matches) use ($t) {
                // If it already matches cims_ because of \b? Wait, \b matches boundary. So cims_candidates won't match \bcandidates\b because _ is a word character.
                // It would only match 'candidates'. If it was already cims_candidates, it wouldn't match ' FROM candidates'.
                // EXCEPT if the pattern is just FROM cims_candidates, the \bcandidates won't match because 's_' is before it.
                return $matches[1] . 'cims_' . $t . (isset($matches[2]) && $matches[2] === '`' ? '`' : '');
            }, $content, -1, $count);
            
            if ($count > 0) $changed = true;
        }
    }
    
    if ($changed) {
        file_put_contents($file, $content);
        echo "Updated $file\n";
    }
}
echo "Codebase tables updated successfully.\n";
?>
