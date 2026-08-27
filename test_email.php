<?php
$_SERVER['REQUEST_METHOD'] = 'POST';
// create a mock php://input by replacing it or just overriding data
$data = ['email' => 'test@example.com'];
// We'll just patch test.php to read from a variable if it's set, or we can use curl
