<?php
function updateCors($dir) {
    $files = scandir($dir);
    foreach ($files as $f) {
        if ($f === '.' || $f === '..') continue;
        $path = $dir . '/' . $f;
        if (is_dir($path)) {
            updateCors($path);
        } else if (preg_match('/\.php$/', $path)) {
            $content = file_get_contents($path);
            
            // Replace old CORS logic
            $newCors = "if (isset(\$_SERVER['HTTP_ORIGIN'])) { header(\"Access-Control-Allow-Origin: {\$_SERVER['HTTP_ORIGIN']}\"); }\nheader('Access-Control-Allow-Credentials: true');\nheader('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');\nheader('Access-Control-Allow-Headers: Content-Type, Authorization');\nif (\$_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }\n";
            
            $content = preg_replace("/header\('Access-Control-Allow-Origin:\s*\*'\);\nheader\('Access-Control-Allow-Methods:\s*GET,\s*POST,\s*PUT,\s*DELETE,\s*OPTIONS'\);\nheader\('Access-Control-Allow-Headers:\s*Content-Type'\);\nif\s*\(\\\$_SERVER\['REQUEST_METHOD'\]\s*===\s*'OPTIONS'\)\s*\{\s*exit\(0\);\s*\}/", $newCors, $content);
            
            file_put_contents($path, $content);
        }
    }
}
updateCors('api');
echo "CORS updated for credentials support.\n";
?>
