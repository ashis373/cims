<?php
function fixFetches($dir) {
    $files = scandir($dir);
    foreach ($files as $f) {
        if ($f === '.' || $f === '..') continue;
        $path = $dir . '/' . $f;
        if (is_dir($path)) {
            fixFetches($path);
        } else if (preg_match('/\.(tsx|ts)$/', $path)) {
            $content = file_get_contents($path);
            $modified = false;
            
            if (strpos($content, "catch (err, { credentials: 'include' })") !== false) {
                $content = str_replace("catch (err, { credentials: 'include' })", "catch (err)", $content);
                $modified = true;
            }
            if (strpos($content, "catch((err, { credentials: 'include' })") !== false) {
                $content = str_replace("catch((err, { credentials: 'include' })", "catch((err)", $content);
                $modified = true;
            }
            
            if ($modified) {
                file_put_contents($path, $content);
                echo "Fixed $path\n";
            }
        }
    }
}
fixFetches('src');
echo "Done fixing.\n";
?>
