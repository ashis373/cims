<?php
if (isset($_SERVER['HTTP_ORIGIN'])) { header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

$files = [
    'api/setup_system_tables.php', 
    'api/profile.php', 
    'api/roles.php', 
    'api/permissions.php', 
    'api/system_settings.php', 
    'api/reasons.php'
];

foreach($files as $f) { 
    if (file_exists($f)) {
        $c = file_get_contents($f); 
        $c = str_replace('cims_', 'system_', $c); 
        file_put_contents($f, $c); 
        echo 'Updated ' . $f . PHP_EOL;
    }
}
?>
