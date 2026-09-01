<?php
$c = new PDO('mysql:host=localhost;dbname=cims', 'root', '');
$stmt = $c->query("DESCRIBE cims_permissions");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
