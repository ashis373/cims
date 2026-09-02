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
$envFile = dirname(__DIR__) . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);
            if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
                putenv(sprintf('%s=%s', $name, $value));
                $_ENV[$name] = $value;
                $_SERVER[$name] = $value;
            }
        }
    }
}




// ============================================================
// GET JWT SECRET FROM .ENV
// ============================================================
//
// Example .env:
//
// JWT_SECRET=a2e8....................
//
// IMPORTANT:
// This secret stays on the PHP SERVER.
// It is NEVER sent to the browser/frontend.
//
// This is the ORIGINAL PRIVATE SECRET KEY.
// HMAC-SHA256 uses this secret to create the JWT signature.
// ============================================================

$secret = getenv('JWT_SECRET');
if (!$secret) {
    die(json_encode(["status" => "error", "message" => "CRITICAL ERROR: JWT_SECRET environment variable is not set."]));
}
define('JWT_SECRET', $secret);

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
?>


