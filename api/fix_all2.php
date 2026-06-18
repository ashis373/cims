<?php
function fixAll2($dir) {
    $files = scandir($dir);
    foreach ($files as $f) {
        if ($f === '.' || $f === '..') continue;
        $path = $dir . '/' . $f;
        if (is_dir($path)) {
            fixAll2($path);
        } else if (preg_match('/\.(tsx|ts)$/', $path)) {
            $content = file_get_contents($path);
            $original = $content;
            
            $content = str_replace("], { credentials: 'include' })", "])", $content);
            $content = str_replace("}, { credentials: 'include' });", "});", $content);
            
            if ($content !== $original) {
                file_put_contents($path, $content);
                echo "Fixed $path\n";
            }
        }
    }
}
fixAll2('src');
echo "Done.\n";
?>
