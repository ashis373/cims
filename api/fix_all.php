<?php
function fixAll($dir) {
    $files = scandir($dir);
    foreach ($files as $f) {
        if ($f === '.' || $f === '..') continue;
        $path = $dir . '/' . $f;
        if (is_dir($path)) {
            fixAll($path);
        } else if (preg_match('/\.(tsx|ts)$/', $path)) {
            $content = file_get_contents($path);
            $original = $content;
            
            // Fix catch (e, ...)
            $content = str_replace("catch (e, { credentials: 'include' })", "catch (e)", $content);
            $content = str_replace("catch(e, { credentials: 'include' })", "catch(e)", $content);
            
            // Fix fetchReports(, ...)
            $content = str_replace("fetchReports(, { credentials: 'include' })", "fetchReports()", $content);
            
            // Fix res.data, ...)
            $content = str_replace("res.data, { credentials: 'include' })", "res.data)", $content);
            $content = str_replace("data.data, { credentials: 'include' })", "data.data)", $content);
            
            // Fix .then(..., ...)
            $content = str_replace("res => res.json(), { credentials: 'include' })", "res => res.json())", $content);
            
            // Fix .catch(console.error, ...)
            $content = str_replace("catch(console.error, { credentials: 'include' })", "catch(console.error)", $content);
            $content = str_replace("catch (console.error, { credentials: 'include' })", "catch (console.error)", $content);
            
            // Fix res.status === 'success', ...)
            $content = str_replace("res.status === 'success', { credentials: 'include' })", "res.status === 'success')", $content);
            $content = str_replace("res.status === \"success\", { credentials: 'include' })", "res.status === \"success\")", $content);
            
            if ($content !== $original) {
                file_put_contents($path, $content);
                echo "Fixed $path\n";
            }
        }
    }
}
fixAll('src');
echo "Done.\n";
?>
