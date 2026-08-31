<?php
$db = new PDO('mysql:host=localhost;dbname=cims', 'root', '');
try {
    $db->exec("ALTER TABLE cims_smtp_config ADD COLUMN worker_enabled TINYINT(1) DEFAULT 1");
    echo "Column added";
} catch (Exception $e) {
    echo "Might already exist: " . $e->getMessage();
}
?>
