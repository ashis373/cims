<?php
if (isset($_SERVER['HTTP_ORIGIN'])) { header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

if(!is_dir('api/system')) mkdir('api/system');

$files = [
    'api/permissions.php' => 'api/system/permissions.php',
    'api/profile.php' => 'api/system/profile.php',
    'api/reasons.php' => 'api/system/reasons.php',
    'api/roles.php' => 'api/system/roles.php',
    'api/system_settings.php' => 'api/system/settings.php',
    'api/setup_system_tables.php' => 'api/system/setup.php'
];

foreach($files as $src => $dst) {
    if(file_exists($src)) {
        $c = file_get_contents($src);
        $c = str_replace("require 'db.php';", "require '../db.php';", $c);
        $c = str_replace('require "db.php";', "require '../db.php';", $c);
        file_put_contents($dst, $c);
        unlink($src);
        echo "Moved $src to $dst\n";
    }
}
?>
