<?php
function updateFetches($dir) {
    $files = scandir($dir);
    foreach ($files as $f) {
        if ($f === '.' || $f === '..') continue;
        $path = $dir . '/' . $f;
        if (is_dir($path)) {
            updateFetches($path);
        } else if (preg_match('/\.(tsx|ts)$/', $path)) {
            $content = file_get_contents($path);
            
            // Replace fetch(..., { ... })
            $content = preg_replace('/fetch\(([^,]+),\s*\{/', "fetch($1, { credentials: 'include', ", $content);
            
            // Replace fetch(...) that has no options
            $content = preg_replace('/fetch\(([^,]+)\)/', "fetch($1, { credentials: 'include' })", $content);
            
            file_put_contents($path, $content);
        }
    }
}
updateFetches('src');
echo "Updated fetch calls to include credentials.\n";
?>
