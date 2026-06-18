<?php
require 'db.php';

try {
    $conn->exec("RENAME TABLE jobs TO cims_jobs");
    echo "Table renamed successfully.";
} catch (PDOException $e) {
    echo "Error renaming table (maybe already renamed): " . $e->getMessage();
}
?>
