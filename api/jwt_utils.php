<?php
// ============================================================
// JWT UTILITIES FILE
// ============================================================
//
// This file is responsible for loading environment variables
// (specifically the JWT_SECRET) and providing functions to
// Generate and Validate JSON Web Tokens (JWTs).
//
// It is included globally in backend API files to secure 
// endpoints and ensure that requests are authenticated.
// ============================================================

// Autoload Composer dependencies (vlucas/phpdotenv, etc.)
require_once __DIR__ . '/vendor/autoload.php';

$dotenvPath = dirname(__DIR__);
if (file_exists($dotenvPath . '/.env')) {
    $dotenv = Dotenv\Dotenv::createImmutable($dotenvPath);
    $dotenv->safeLoad();
}

// ============================================================
// GET JWT SECRET FROM .ENV
// ============================================================
$secret = $_ENV['JWT_SECRET'] ?? getenv('JWT_SECRET');
if (!$secret) {
    die(json_encode(["status" => "error", "message" => "CRITICAL ERROR: JWT_SECRET environment variable is not set."]));
}
if (!defined('JWT_SECRET')) {
    define('JWT_SECRET', $secret);
}

// ============================================================
// BASE64 URL ENCODING & DECODING
// ============================================================
//
// JWTs must be URL-safe (meaning they can be passed safely 
// in URLs). Standard base64 uses '+' and '/', which break URLs.
// 
// These helper functions replace '+' with '-' and '/' with '_', 
// and strip any trailing '=' padding to make the string URL-safe.
// ============================================================
function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data) {
    return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
}

// ============================================================
// GENERATE JWT
// ============================================================
//
// When PHP generates the JWT:
//
// 1. Create HEADER
// 2. Create PAYLOAD
// 3. Combine HEADER + PAYLOAD
// 4. Use the SAME JWT_SECRET from .env
// 5. HMAC-SHA256 calculates a NEW SIGNATURE
// 6. Return:
//
//    HEADER.PAYLOAD.SIGNATURE
//
// IMPORTANT:
//
// JWT_SECRET != SIGNATURE
//
// JWT_SECRET is the PRIVATE KEY.
// SIGNATURE is the NEW value calculated from:
//
// HEADER + PAYLOAD + JWT_SECRET
//
// The JWT_SECRET itself is NEVER placed inside the JWT.
// ============================================================
function generate_jwt($payload) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $base64UrlHeader = base64url_encode($header);
    $base64UrlPayload = base64url_encode(json_encode($payload));
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = base64url_encode($signature);
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

// ============================================================
// VALIDATE JWT
// ============================================================
//
// When the user sends the JWT back to your PHP API:
//
// 1. PHP receives:
//       HEADER.PAYLOAD.SIGNATURE
//
// 2. PHP takes HEADER + PAYLOAD
//
// 3. PHP uses the SAME JWT_SECRET from .env AGAIN
//
// 4. HMAC-SHA256 calculates the signature AGAIN
//
// 5. PHP compares:
//       Calculated Signature
//                    vs
//       Signature inside JWT
//
// 6. If they MATCH:
//       JWT is valid.
//
// 7. If they DON'T MATCH:
//       JWT is invalid.
//
// IMPORTANT:
//
// The JWT_SECRET is NEVER received from the browser.
// PHP already has it from the server's .env file.
// ============================================================
function validate_jwt($jwt) {
    $parts = explode('.', $jwt);
    if (count($parts) !== 3) return false;
    
    $signature = hash_hmac('sha256', $parts[0] . "." . $parts[1], JWT_SECRET, true);
    $base64UrlSignature = base64url_encode($signature);
    
    if (hash_equals($base64UrlSignature, $parts[2])) {
        $payload = json_decode(base64url_decode($parts[1]), true);
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return false; // Expired
        }
        return $payload;
    }
    return false;
}

// ============================================================
// DATA ENCRYPTION & DECRYPTION (AES-256-CBC)
// ============================================================
// Used for securely storing sensitive data like SMTP passwords
// in the database.
// ============================================================
function encrypt_data($data) {
    if (empty($data)) return $data;
    $method = 'AES-256-CBC';
    $key = hash('sha256', JWT_SECRET, true); // derive a 256-bit key
    $ivLength = openssl_cipher_iv_length($method);
    $iv = openssl_random_pseudo_bytes($ivLength);
    $encrypted = openssl_encrypt($data, $method, $key, OPENSSL_RAW_DATA, $iv);
    return base64_encode($iv . $encrypted);
}

function decrypt_data($data) {
    if (empty($data)) return $data;
    $method = 'AES-256-CBC';
    $key = hash('sha256', JWT_SECRET, true);
    $decoded = base64_decode($data);
    $ivLength = openssl_cipher_iv_length($method);
    if (strlen($decoded) < $ivLength) return $data; // not properly encrypted
    $iv = substr($decoded, 0, $ivLength);
    $encrypted = substr($decoded, $ivLength);
    $decrypted = openssl_decrypt($encrypted, $method, $key, OPENSSL_RAW_DATA, $iv);
    return $decrypted !== false ? $decrypted : $data;
}
