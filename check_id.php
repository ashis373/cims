<?php
require 'api/db.php';
$id = $conn->query("SELECT id FROM cims_users WHERE email='ashiskrout1@gmail.com'")->fetchColumn();
echo "ID: " . $id;
?>
