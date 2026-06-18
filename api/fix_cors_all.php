<?php
function addCors($dir) {
    $files = scandir($dir);
    foreach ($files as $f) {
        if ($f === '.' || $f === '..') continue;
        $path = $dir . '/' . $f;
        if (is_dir($path)) {
            addCors($path);
        } else if (preg_match('/\.php$/', $path)) {
            $content = file_get_contents($path);
            if (strpos($content, 'Access-Control-Allow-Origin') === false && strpos($content, '<?php') !== false) {
                $cors = "header('Access-Control-Allow-Origin: *');\nheader('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');\nheader('Access-Control-Allow-Headers: Content-Type');\nif (\$_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }\n";
                $content = preg_replace('/<\?php\s+/', "<?php\n" . $cors, $content, 1);
                file_put_contents($path, $content);
                echo "Added CORS to $path\n";
            }
        }
    }
}
addCors('api');
echo "Done.\n";
?>
