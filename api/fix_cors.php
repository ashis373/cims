<?php
$files = glob('api/system/*.php');
foreach ($files as $file) {
    $content = file_get_contents($file);
    if (strpos($content, 'Access-Control-Allow-Origin') === false) {
        $cors = "header('Access-Control-Allow-Origin: *');\nheader('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');\nheader('Access-Control-Allow-Headers: Content-Type');\nif (\$_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }\n";
        
        // Insert right after <?php
        $content = preg_replace('/<\?php\s+/', "<?php\n" . $cors, $content, 1);
        file_put_contents($file, $content);
        echo "Added CORS to $file\n";
    }
}
echo "Done.";
?>
