<?php
if (isset($_SERVER['HTTP_ORIGIN'])) { header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

$dirs = [
    'api/candidates',
    'api/jobs',
    'api/offers',
    'api/rejections',
    'api/reports',
    'api/dashboard',
    'api/notifications',
    'api/system'
];

foreach ($dirs as $dir) {
    if (is_dir($dir)) {
        $files = scandir($dir);
        foreach ($files as $f) {
            if (preg_match('/\.php$/', $f)) {
                $path = $dir . '/' . $f;
                $content = file_get_contents($path);
                
                $content = str_replace("include 'db.php';", "include '../db.php';", $content);
                $content = str_replace('include "db.php";', "include '../db.php';", $content);
                $content = str_replace("require_once 'db.php';", "require_once '../db.php';", $content);
                $content = str_replace('require_once "db.php";', "require_once '../db.php';", $content);
                
                // Also double check for any require 'db.php'; just in case
                $content = str_replace("require 'db.php';", "require '../db.php';", $content);
                $content = str_replace('require "db.php";', "require '../db.php';", $content);

                // If someone used require '../db.php'; and we replaced it to require '../../db.php', fix it
                $content = str_replace("require '../../db.php';", "require '../db.php';", $content);

                file_put_contents($path, $content);
                echo "Fixed $path\n";
            }
        }
    }
}
echo "Done fixing includes.\n";
?>
