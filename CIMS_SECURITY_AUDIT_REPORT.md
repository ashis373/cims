# CIMS Security Audit Report

Date: 2026-09-11
Scope: Current workspace at `D:\xaamp\htdocs\full-cims`
Audit mode: Read-only inspection, no file modifications performed.

## Final assessment

### Current verdict: GO AFTER FIXES

The current workspace codebase is in much better shape than the earlier audit, and several high-severity issues have already been resolved. The remaining blockers are mainly production environment setup and non-production demo content.

## Verified fixes already present

- Query-string JWT support was removed from `api/auth_middleware.php`.
- Hardcoded admin email / `id == 1` logic was removed from `api/system/users.php`.
- User self-deactivation and self-deletion protections are now present in `api/system/users.php`.
- The last active Administrator protection is present in `api/system/users.php`.
- Upload directory handling was hardened and the directory permissions were improved.
- The schema includes a foreign key for user role linkage (`fk_users_role`) in `api/database.sql`.
- Dependency vulnerability cleanup was already performed on the frontend package set.

## Remaining issues

### HIGH

#### 2) Demo login credentials are still visible in the UI
- File: `src/pages/auth/Login.tsx`
- Problem: The login page still includes a hardcoded demo account list.
- Why it matters: This is acceptable for a local demo or staging environment, but it is not appropriate for a public production deployment.
- Recommended fix: Remove or gate these accounts so they only appear in non-production builds.

### MEDIUM

#### 3) CSRF protection is still not fully hardened for cookie-based writes
- File: `api/auth_middleware.php`
- Problem: The middleware performs a custom-header / same-origin style CSRF check, but it does not implement a full server-issued CSRF token validation flow for all cookie-authenticated state-changing requests.
- Why it matters: This reduces risk, but it is not the strongest or most complete CSRF model.
- Recommended fix: Add a server-generated CSRF token for all cookie-authenticated writes and validate it on every state-changing request.

#### 4) Environment loading is still too broad and not centralized
- File: `api/db.php`
- Problem: The code scans multiple possible parent paths for `.env` files and loads values from several sources.
- Why it matters: This can cause accidental configuration drift between environments and is not ideal for production control.
- Recommended fix: Standardize the production environment to a single explicit config source and remove fallback scanning in production.

#### 5) Frontend route protection should remain a UX layer, not the only authorization layer
- Files: `src/App.tsx`, `src/components/auth/PrivateRoute.tsx`
- Problem: Route-level UI restrictions are present, but these are not a substitute for backend permission enforcement.
- Why it matters: The backend remains the true authority for access decisions.
- Recommended fix: Keep frontend route checks for usability, but preserve backend enforcement as the source of truth.

## Verified secure / good areas

- Current tracked environment files contain only frontend base URLs (`VITE_API_BASE_URL`, `VITE_BASE_PATH`) and no plaintext secrets were found in the workspace during re-check.
- `api/auth_middleware.php` correctly validates JWTs, checks active account status, enforces revoked-token checks, and applies RBAC / module permission logic.
- `api/system/users.php` now prevents self-deletion, self-deactivation, and deleting or deactivating the last Administrator account.
- `api/database.sql` contains user-to-role linkage through a foreign key, reducing orphaned role assignments.
- The code no longer contains the earlier query-string token weakness.
- File upload areas have been tightened and directory permissions are improved.

## Manual checks still needed before production launch

1. Move secrets out of `.env` / `api/.env` and rotate the live JWT secret and database credentials.
2. Confirm HTTPS is enabled on the live server.
3. Confirm secure cookie settings are active for production.
4. Run a final smoke test for login/logout, RBAC, upload/download, and admin protections.
5. Verify that demo accounts are hidden or removed in the production build.

## Final recommendation

- Codebase status: Good
- Production launch status: Not yet fully ready until live-host secret handling and production deployment checks are complete
- Final call: GO AFTER FIXES

## Short production checklist

1. Strong DB password on live host
2. Rotate `JWT_SECRET` for production
3. Remove or hide demo credentials for public builds
4. Confirm HTTPS and secure cookies are active
5. Run final smoke test after deployment
