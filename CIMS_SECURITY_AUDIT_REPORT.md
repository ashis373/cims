# CIMS Security Audit Report

Date: 2026-09-11
Scope: Current workspace at `D:\xaamp\htdocs\full-cims`
Audit mode: Read-only inspection, no file modifications performed.

## Executive Summary

The current CIMS codebase has a strong foundation in several areas, including role-based access checks at the PHP API layer, password hashing with `password_hash()` / `password_verify()`, candidate-scope checks in child resource endpoints, and explicit `Access-Control-Allow-Origin` allowlisting. However, the project is not yet production-ready because there are still remaining security and operational issues that should be fixed before deployment.

This report is based on the current workspace contents and verified schema/dependency evidence, so the findings below are meant to be actionable production-readiness items rather than hypothetical concerns.

The most important current findings are:

- plaintext secret material is present in the workspace (`.env`, `api/.env`) and is not yet fully isolated from runtime artifacts,
- JWTs are accepted from the URL query string in `auth_middleware.php`, which risks token leakage into logs/caches,
- the frontend includes hardcoded demo accounts / credentials in the login page,
- the PHP backend has a few hardcoded identity checks and incomplete data-protection patterns,
- dependency audit still shows multiple known vulnerabilities in the frontend stack,
- the database schema already includes a `cims_users.role_id` foreign key, so the remaining work is to verify runtime role-deletion behavior rather than add missing relational integrity.

## CRITICAL BLOCKERS

### 1) Secret material is present in local runtime files and may be exposed outside the intended secret-management flow
- Severity: CRITICAL
- File + line: `.env:1-8`, `api/.env:1-8`, `api/jwt_utils.php:57-62`
- Problem: The workspace currently contains plaintext environment files with `JWT_SECRET`, `DB_*`, and `APP_ENV` values. `api/jwt_utils.php` loads `JWT_SECRET` directly from process environment variables, and `api/.env` mirrors the same values in the application tree.
- Why it matters: Even if `.env` is ignored by Git, secrets residing on disk and in deployable artifacts can still be exfiltrated, copied, or mistakenly bundled into backups, support snapshots, or debug environments. This directly impacts authentication integrity and database exposure.
- Recommended fix: Move `JWT_SECRET` and database credentials to a proper secret store or encrypted deployment configuration, keep `.env` files out of application directories and build artifacts, rotate the current secret, and remove any plaintext copies from the workspace before production deployment.

## HIGH

### 2) JWTs are accepted from the URL query string (`?token=...`)
- Severity: HIGH
- File + line: `api/auth_middleware.php:17-21`
- Problem: `auth_middleware.php` accepts a token from `$_GET['token']` when no Authorization header is present.
- Why it matters: Tokens in URLs are exposed via browser history, referer headers, server access logs, reverse-proxy logs, and link-sharing. This can enable token theft and replay even when the rest of the auth model is otherwise sound.
- Recommended fix: Remove query-string token support entirely and rely only on Authorization headers and secure, HttpOnly cookies. If backward compatibility is required, add a temporary deprecation window and log every use of query-string tokens for investigation.

### 3) Frontend login page exposes demo credentials directly in the UI
- Severity: HIGH
- File + line: `src/pages/auth/Login.tsx:136-139`
- Problem: The login screen renders a hardcoded list of test accounts including email and password values.
- Why it matters: Even if the accounts are meant for demos, shipping visible credentials in the production frontend makes it easier for unauthorized users to discover or enumerate valid accounts. This can also lead to accidental account misuse in shared environments.
- Recommended fix: Remove visible sample credentials from production builds, replace them with a clearly labeled “demo only” environment toggle that is disabled in production, or keep them only in non-production deployments.

### 4) Production dependency audit still reports multiple high-severity vulnerabilities
- Severity: HIGH
- File + line: `package.json:1-93`, `npm audit --omit=dev` (fresh evidence from terminal run)
- Problem: Fresh audit output reported 6 vulnerabilities total (1 low, 1 moderate, 4 high), including:
  - `esbuild` (development server issue on Windows)
  - `nanoid`
  - `postcss`
  - `react-router-dom`
  - `xlsx` (no fix available)
- Why it matters: The current frontend stack includes known vulnerable transitive packages. This raises the risk of XSS, redirect issues, data exfiltration, and denial-of-service conditions in the deployed application.
- Recommended fix: Upgrade to patched versions of `react-router-dom`, `vite`, `postcss`, and `nanoid`, and replace `xlsx` with a maintained alternative or vendor a patched version if compatibility requires it.

### 5) Hardcoded administrator identity checks remain in the user management code
- Severity: HIGH
- File + line: `api/system/users.php:146-151`, `api/system/users.php:213-219`
- Problem: User-management logic explicitly checks for `ashiskrout1@gmail.com` and for `id == 1` as the protected “core Administrator account”.
- Why it matters: Hardcoded identity checks make the security policy brittle and environment-dependent. If this email or ID changes, the protection logic can break or be bypassed inadvertently. It also leaks a real-person email into source code.
- Recommended fix: Replace this with a robust system-level guard that derives the protected admin identity from the database configuration or an approved metadata table, and never hardcode personal emails in application logic.

### 6) The codebase contains workspace-level sample secrets that can be copied into logs, backups, or shared environments
- Severity: HIGH
- File + line: `.env:1-8`, `api/.env:1-8`, `api/jwt_utils.php:57-62`
- Problem: The produced workspace contains full secret values, not just placeholders. The `.env` file is not tracked by Git but it is still present in the runtime path and cached in the local environment.
- Why it matters: This is high risk for accidental exposure through shared folders, backups, container snapshots, or support bundles.
- Recommended fix: Remove the current secret files from the workspace, rotate secrets immediately, and only inject them at deployment time via a secret manager or secure CI/CD environment.

## MEDIUM / LOW

### 7) `api/auth_middleware.php` uses cookie-based CSRF validation with an incomplete browser signal check
- Severity: MEDIUM
- File + line: `api/auth_middleware.php:80-95`
- Problem: For state-changing requests that use cookie auth, the middleware checks `x-requested-with` or `x-csrf-token`, or a limited `Sec-Fetch-Site` value. It does not enforce a server-issued CSRF token for all cookie-authenticated writes.
- Why it matters: This is partially protected, but not a full double-submit CSRF pattern. Browser behavior and proxy/CDN behavior can vary, making the protection less robust than a dedicated, validated CSRF token system.
- Recommended fix: Require a server-generated CSRF token for all non-Authorization-header write requests, validate it against a signed server-side value, and set stricter SameSite / Secure cookie policies in production.

### 8) Upload directory creation uses permissive directory permissions
- Severity: MEDIUM
- File + line: `api/candidates/upload.php:18-26`, `api/candidates/documents.php:17-27`, `api/system/users.php:58-69`, `api/system/profile.php:81-90`
- Problem: Several upload handlers call `mkdir($uploadDir, 0777, true)` or create directories with broad permissions, although the uploaded files themselves are later `chmod`ed.
- Why it matters: Overly permissive directory permissions can allow unintended file write or overwrite by unrelated processes, especially in shared hosting or multi-user deployments.
- Recommended fix: Create upload directories with `0755` or stricter ownership, ensure the web server user owns the directory, and verify the final directory permissions on deployment.

### 9) Some paths still depend on local file behavior rather than explicit deployment configuration
- Severity: MEDIUM
- File + line: `api/db.php:23-49`, `api/cors.php:7-35`, `api/jwt_utils.php:10-30`, `api/cors.php:38-78`
- Problem: The backend loads `.env` by scanning multiple parent directories and also uses `file_exists(__DIR__ . '/.env')` in `cors.php`. The environment resolution logic is flexible but not centralized.
- Why it matters: This increases the chance of accidental environment mixing, especially when moving between local, staging, and production deployments.
- Recommended fix: Standardize on one explicit configuration source per deployment, disable fallback scanning in production, and centrally validate required variables at startup.

### 10) The frontend route layer is not sufficient as the sole authorization boundary
- Severity: MEDIUM
- File + line: `src/App.tsx:115-170`, `src/components/auth/PrivateRoute.tsx:20-75`
- Problem: The app uses a global private route wrapper, but route-level module/role gating depends on the frontend component passing the right props. Some areas are protected only by backend permission checks, while the route list itself gives all authenticated users access to the page shell.
- Why it matters: This is not a direct vulnerability by itself, but it increases the chance of unauthorized UI exposure and inconsistent behavior if the backend checks are changed later.
- Recommended fix: Add route-level screen gating for all core modules in the frontend and keep backend authorization as the source of truth.

## VERIFIED SECURE

### Authentication, JWT, and token handling
- `api/jwt_utils.php` uses server-side `JWT_SECRET`, verifies HS256 signatures, and enforces `exp` timestamps. This is a strong baseline.
- `api/auth_middleware.php` checks the user still exists and is active, rejects revoked signatures, and applies role/module permission rules before serving protected endpoints.
- `api/login.php` includes login-attempt cleanup and per-IP/per-email tracking for brute-force throttling.

### Database integrity and RBAC
- `api/database.sql` already contains `fk_users_role`, which enforces `cims_users.role_id -> cims_roles.id` with `ON DELETE SET NULL` and `ON UPDATE CASCADE`.
- The remaining verification item is runtime behavior when roles are deleted or reassigned, especially around last-admin protection and any role references that may still be stale in application data.

### File upload / download controls
- `api/candidates/upload.php` and `api/candidates/documents.php` validate file type, extension, size, and image integrity before saving.
- `api/candidates/download.php` uses `basename()` and `realpath()` checks to reduce path traversal exposure and enforces candidate-scope access before serving a file.

### API exposure controls
- `api/cors.php` uses an exact origin allowlist and rejects untrusted preflight requests with `403`, reducing CORS misuse risk.
- `.htaccess` and `api/.htaccess` deny access to `.env`, `.sql`, `.log`, `.lock`, `.json`, `.md`, and `.git` files.
- `api/db.php` hides detailed SQL errors in non-development environments and logs them server-side.

## MANUAL TESTS STILL NEEDED

1. Verify login lockout behavior end-to-end with repeated failed attempts against a real environment.
2. Confirm that query-string token support is not still reachable through deployed proxies or reverse proxies.
3. Verify the CSRF flow for cookie-authenticated writes in a browser with real `SameSite` and `Secure` cookie settings.
4. Test all candidate child-resource endpoints (notes, interviews, documents, offers, rejections) with assigned and unassigned users to confirm IDOR protections hold under actual business roles.
5. Validate the SMTP worker path with real SMTP credentials and a test queue, including failure/retry behavior and logging.
6. Validate permission matrix behavior for `All / Assigned / None` scopes against real user roles and candidate assignments.
7. Run penetration checks against the public careers application and upload/download flows to confirm no file or HTML injection vectors remain.

## FINAL

### Current verdict: NO-GO

The current workspace is not yet production-ready because the remaining issues above include plaintext secret exposure, URL-token leakage, hardcoded demo credentials, and known high-severity dependency vulnerabilities. The project’s core controls are promising, but these issues still need to be resolved and re-verified before approving production deployment.

### Recommended move-to-production path

1. Rotate `JWT_SECRET` and any stored database credentials immediately.
2. Remove plaintext secret files from the workspace and deploy via a secure secret manager.
3. Eliminate query-string auth token support.
4. Remove visible demo credentials from the production login page.
5. Upgrade/replace all vulnerable frontend packages and retest with `npm audit` as a gate.
6. Validate runtime role-deletion behavior and any stale role references in the data, since the schema already includes the `fk_users_role` constraint.
7. Re-run the security audit after the fixes and then re-evaluate the final verdict as `GO AFTER FIXES` or `GO`.
