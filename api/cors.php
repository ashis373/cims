<?php
// Prevent multiple executions in a single request lifecycle
if (!defined('CIMS_CORS_INITIALIZED')) {
    define('CIMS_CORS_INITIALIZED', true);

    // 1. Determine environment mode (production vs development)
    $appEnv = $_ENV['APP_ENV'] ?? $_SERVER['APP_ENV'] ?? getenv('APP_ENV') ?: null;
    if ($appEnv === null && file_exists(__DIR__ . '/.env')) {
        $envLines = @file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($envLines) {
            foreach ($envLines as $line) {
                $line = trim($line);
                if (strpos($line, 'APP_ENV=') === 0) {
                    $appEnv = trim(trim(substr($line, 8)), '"\'');
                    break;
                }
            }
        }
    }
    $appEnv = strtolower($appEnv ?: 'production');

    // Localhost detection (only treats as development if running on local loopback)
    $serverHost = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '';
    $parsedHost = parse_url('http://' . $serverHost, PHP_URL_HOST);
    $isLocalServer = in_array($parsedHost, ['localhost', '127.0.0.1', '::1'], true);

    $isDevelopment = ($appEnv === 'development' || $appEnv === 'local') || $isLocalServer;

    // 2. Build strict allowlist (No dynamic host trust, no wildcard subdomains)
    $allowedOrigins = [];

    if ($isDevelopment) {
        // Development mode: Localhost origins + staging origin for testing
        $allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:5174',
            'http://localhost',
            'http://127.0.0.1',
            'https://demo.hexalearn.com'
        ];
    } else {
        // Production mode: STRICT HTTPS ONLY, exact ATS frontend origin
        // No dynamic host trust, no wildcard subdomains (*.hexalearn.com removed), no localhost
        $allowedOrigins = [
            'https://demo.hexalearn.com'
        ];

        // If FRONTEND_URL or APP_URL is explicitly set in production, allow only if exact HTTPS
        $prodUrl = $_ENV['FRONTEND_URL'] ?? $_ENV['APP_URL'] ?? getenv('FRONTEND_URL') ?: getenv('APP_URL') ?: null;
        if ($prodUrl && is_string($prodUrl)) {
            $parsed = parse_url(trim($prodUrl));
            if (!empty($parsed['scheme']) && strtolower($parsed['scheme']) === 'https' && !empty($parsed['host'])) {
                $exactOrigin = 'https://' . strtolower($parsed['host']) . (!empty($parsed['port']) ? ':' . $parsed['port'] : '');
                if (!in_array($exactOrigin, $allowedOrigins, true)) {
                    $allowedOrigins[] = $exactOrigin;
                }
            }
        }
    }

    // 3. Evaluate incoming Origin header with STRICT exact equality (no regex, no wildcards)
    $httpOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $isAllowed = !empty($httpOrigin) && in_array($httpOrigin, $allowedOrigins, true);

    // Always set Vary: Origin so intermediate caches do not serve cross-origin responses to wrong clients
    header("Vary: Origin");

    if ($isAllowed) {
        header("Access-Control-Allow-Origin: $httpOrigin");
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Accept, Origin, Cache-Control");
        header("Access-Control-Max-Age: 86400");
    }

    // 4. Handle preflight OPTIONS requests
    if (isset($_SERVER['REQUEST_METHOD']) && strtoupper($_SERVER['REQUEST_METHOD']) === 'OPTIONS') {
        if ($isAllowed) {
            http_response_code(204);
        } else {
            // Untrusted origin preflight is strictly rejected with 403 Forbidden
            http_response_code(403);
        }
        exit(0);
    }
}
