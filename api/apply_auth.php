<?php
$files = glob('api/system/*.php');
foreach ($files as $file) {
    $content = file_get_contents($file);
    
    // Remove dummy session logic
    $content = preg_replace('/session_start\(\);\s*\/\/\s*Dummy session for testing\s*if\s*\(!isset\(\$_SESSION\[\'user_id\'\]\)\)\s*\{\s*\$_SESSION\[\'user_id\'\]\s*=\s*\d+;[^\}]+\}/i', '', $content);
    
    // Check if auth_middleware is already required
    if (strpos($content, 'auth_middleware.php') === false) {
        // Insert after require '../db.php';
        if (strpos($content, "require '../db.php';") !== false) {
            $content = str_replace("require '../db.php';", "require '../db.php';\nrequire_once '../auth_middleware.php';", $content);
        } else {
            $content = preg_replace('/<\?php/', "<?php\nrequire_once '../auth_middleware.php';\n", $content, 1);
        }
        
        file_put_contents($file, $content);
        echo "Updated $file\n";
    }
}
echo "Done.";
?>
