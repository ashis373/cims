# CIMS Audit Report

**Review type:** read-only source-code audit  
**Scope:** React/TypeScript/Vite frontend, PHP/MySQL APIs, JWT/RBAC, email worker, uploads, `api/database.sql`  
**Requirements reviewed:** `cmsrecuremnt.md` and `User_Roles_Permissions.Md`

## Scores

| Area | Score |
|---|---:|
| Overall CIMS | 42/100 |
| Security | 24/100 |
| JWT migration | 70/100 |
| RBAC / permissions | 43/100 |
| Scope security | 0/100 |
| Performance | 52/100 |
| SRS coverage | ~48% |
| Production readiness | 20/100 |

## Executive conclusion

The main private APIs use JWT middleware and database-backed module permissions. However, the required All/Assigned/None scope model is not enforced anywhere in the data-access code. Candidate assignment columns are absent from the schema. As a result, users who have module access can access or modify records outside their intended assignment by changing identifiers.

The repository also contains publicly reachable maintenance endpoints, a tracked database dump with sensitive information, reflected credentialed CORS, development error disclosure, unsafe public uploads, and plaintext SMTP storage/exposure. It is not production-ready.

## Critical findings

| File | Line | Problem | Impact | Recommended fix |
|---|---:|---|---|---|
| `api/auth_middleware.php` | 112 | `scope` is only assigned to `$moduleScope`; it is never used to limit a query or mutation. | Assigned/None scopes do not protect data. | Centralize scope predicates and resource authorization checks. |
| `api/database.sql` | 812-839 | Candidates have no `assigned_recruiter_id` or `assigned_hiring_manager_id`. | Assignment cannot be enforced. | Add assignment columns, indexes, FKs, and authorization checks based on JWT user ID. |
| `api/candidates/candidates.php` | 29-172 | Returns all candidates and related history, documents, notes, applications, interviews, rejections, and email logs. | Full cross-user PII disclosure. | Apply backend scope filters and server pagination. |
| `api/candidates/documents.php` | 18-66 | Client provides `candidate_id`; no candidate ownership/scope validation. | Cross-candidate document upload. | Validate candidate and assignment before upload. |
| `api/candidates/download.php` | 25-28 | Filename-based download checks only module permission. | Any known filename may be downloaded. | Fetch by document ID; verify its candidate and scope before streaming. |
| `api/candidates/interviews.php` | 21-67 | Trusts `candidate_id`, `application_id`, and `created_by` from client. | Cross-candidate interview/stage manipulation and actor spoofing. | Derive candidate from application; use authenticated user; enforce scope. |
| `api/candidates/notes.php` | 29-72 | Arbitrary candidate/note IDs can be created, changed, or deleted. | IDOR across candidate notes. | Authorize candidate/note ownership and use authenticated author. |
| `api/offers/offers.php` | 21-127 | All offers are listed and any permitted editor can update any offer ID. | Cross-user offer/joining changes. | Authorize offer through application/candidate assignment. |
| `api/settings/email/db_update_templates.php` | 2-10 | Unauthenticated endpoint deletes all email templates. | Complete email-template data loss. | Remove from web root or require administrator authentication. |
| `api/database.sql` | 1760 | Tracked dump includes a plaintext SMTP credential and real-looking data. | Credential and PII exposure. | Rotate immediately; purge history; use secrets and sanitized fixtures. |

## High findings

| File | Line | Problem | Impact | Recommended fix |
|---|---:|---|---|---|
| `api/auth/login.php` | 2, 56 | Reflects arbitrary Origin with credentials; JWT cookie is `Secure=false`. | Cross-origin credential risk and HTTP token exposure. | Fixed CORS allowlist, HTTPS, Secure/HttpOnly/SameSite cookie flags. |
| `api/auth_middleware.php` | 9 | Cookie JWT auth has no CSRF protection. | State-changing cross-site request risk. | Bearer-only API or CSRF protection and restrictive SameSite cookie. |
| `src/pages/auth/Login.tsx` | 39 | JWT is stored in `localStorage`. | XSS can steal the token. | Prefer HttpOnly Secure cookie with CSRF protection. |
| `api/public/apply.php` | 44-61 | Public upload has no type, size, content, or rate-limit checks. | Malware, storage abuse, and arbitrary public files. | Validate content/size, scan files, randomize names, throttle/CAPTCHA, use non-public storage. |
| `api/system/users.php` | 31-47 | Admin photo upload accepts arbitrary file content. | Upload abuse. | Verify MIME/content and size. |
| `api/system/profile.php` | 46-50 | Password can change without current-password verification. | Account compromise impact is increased. | Require current password and password policy. |
| `api/candidates/interviews.php` | 26, 73-75, 118-120 | Writes payload/errors to web-adjacent log and returns detailed errors. | PII and implementation disclosure. | Stop raw-payload logging; return generic errors; log outside web root. |
| `api/db.php` | 2-31 | Hardcoded development mode displays paths, SQL errors, and traces. | Sensitive error disclosure. | Deployment-controlled production mode; no browser traces. |
| `api/system/setup.php` | 12-14, 101-103 | Web-accessible setup drops security tables and seeds a known password. | Major destructive administration risk. | Remove from deployed web root; use CLI migrations. |
| `api/settings/email/smtp.php` | 21-23 | `SELECT *` returns plaintext SMTP password to administrators. | Secret disclosure. | Never return secrets; use secret storage/encryption. |
| `api/settings/email/send_manual.php` | 20-37 | Caller controls recipient, body, candidate/template IDs, and duplicate hash. | Arbitrary queueing and scope bypass. | Resolve values server-side and enforce `email.send`. |
| `api/settings/email/trigger.php` | 24-124 | Any qualifying user can trigger email for any candidate. | Unauthorized candidate communication. | Enforce candidate scope; unique DB constraint; transactional queue insert. |
| `api/candidates/candidates.php` | 437-447 | Direct blacklist mutation; no request/approve/reject workflow. | Recruiter can bypass mandated approval. | Separate backend request/approval actions with `can_approve`. |
| `api/auth/login.php` | 12-66 | No rate limiting, lockout, CAPTCHA, or failed-login tracking. | Brute-force exposure. | Add IP/account throttling and secure audit events. |

## Medium findings

| File | Line | Problem | Impact | Recommended fix |
|---|---:|---|---|---|
| `api/auth/logout.php` | 38-47 | Legacy PHP session cleanup remains. | JWT migration is not fully cleaned up. | Remove once session migration is finalized. |
| `api/auth/logout.php` | 9-28 | Token is revoked without prior validation. | Invalid tokens can populate revocation table. | Validate before revocation; retain expiry for cleanup. |
| `api/auth_middleware.php` | 98 | System admin bypasses module permission records. | Permission source-of-truth is bypassed. | Make explicit policy/audit decision; centralize enforcement. |
| `api/system/permissions.php` | 36-51 | Does not persist `can_approve` or `can_export`. | Approval/export permissions cannot work. | Save and enforce all permission actions. |
| `api/rejections/blacklisted.php` | 19-38 | No scope filter and no approval actions. | Organization-wide blacklist disclosure; workflow missing. | Scope query and implement request/approve/reject APIs. |
| `api/reports/reports.php` | 19-96 | Organization-wide reports; no export authorization. | Scope bypass and report-data disclosure. | Apply scope and `can_export`. |
| `api/dashboard/stats.php` | 21-55 | Counts all organization records. | Scope bypass via metrics. | Scope aggregates. |
| `api/notifications/notifications.php` | 45-189 | Organization-wide alerts and repeated per-row candidate lookup. | Information disclosure and N+1 queries. | Scope alerts and use joins. |
| `api/jobs/departments.php` | 53 | String-interpolated `exec()` query. | Violates prepared-query standard. | Use prepared update. |
| `api/database.sql` | 1895-1897 | Email queue only indexes `unique_hash`. | Worker scans can degrade. | Add `(status, scheduled_at)` index. |
| `api/candidates/candidates.php` | 202-208 | Internal duplicate check is email-only. | SRS name/mobile/email duplication requirement is unmet. | Normalize/check all identifiers and index them. |
| `api/settings/email/worker.php` | 16 onward | HTTP-triggered worker; no cron/scheduler found. | Worker reliability and attack-surface problem. | Use a CLI worker run by OS scheduler/cron. |
| `src/services/ats-store.tsx` | 215 | Uses `token`, while login stores `cims_token`. | Trigger request may be unauthenticated. | Use one shared auth helper/key. |

## Remaining session references

- `session_start()`: `api/auth/logout.php:38`
- `$_SESSION`: `api/auth/logout.php:40`
- No other session authentication/checks were found.

## JWT conclusion

JWT generation/validation, expiration validation, active-user verification, Bearer parsing, revocation lookup, and logout revocation exist. The migration is mostly functional but not production-complete due to remaining legacy logout session cleanup, localStorage token exposure, insecure cookie configuration, reflected credentialed CORS, absent CSRF mitigation, and absent login throttling.

## Unprotected APIs

- `api/public/jobs.php`: intentionally public jobs list.
- `api/public/apply.php`: intentionally public, but upload/abuse security is inadequate.
- `api/settings/email/db_templates.php`: unprotected maintenance endpoint.
- `api/settings/email/db_update_templates.php`: unprotected destructive maintenance endpoint.

`apilist.md` documents `auth/reset_password.php` and `auth/validate.php`; neither file exists.

## RBAC and scope conclusion

The code checks database `can_view`, `can_add`, `can_edit`, and `can_delete` for many main APIs. It does not enforce `can_approve` or `can_export`. `All`, `Assigned`, and `None` scopes are not enforced. Candidate assignment fields do not exist. Client-provided IDs are trusted across candidates, notes, interviews, documents, offers, and email flows.

## SRS coverage

| Requirement | Status |
|---|---|
| Candidate master data | Partial |
| Candidate lifecycle | Partial |
| Duplicate detection | Partial |
| Candidate history/timeline | Partial |
| Rejection management | Partial |
| Blacklist approval workflow | Incorrect |
| Offer/no-join tracking | Partial |
| Automated/manual email | Partial |
| Internal notifications | Partial |
| Dashboard/funnel | Partial |
| Reports/analytics | Partial |
| Excel/PDF/CSV export | Partial |
| Search/filtering | Partial |
| JWT authentication | Partial |
| Backend RBAC | Partial |
| Backend assigned-scope security | Missing |
| Permission-driven frontend UX | Partial |
| File/upload security | Incorrect |
| Production hardening | Missing |

## Performance and quality

- Route-level React lazy loading is implemented in `src/App.tsx`.
- Candidate retrieval is unpaginated and loads all related records.
- Reports issue multiple funnel queries rather than a grouped aggregate.
- Notifications contain N+1 candidate queries.
- Queue lookup indexing is insufficient.
- PHP syntax check passed for all first-party PHP files.
- `npm run lint` failed with 12,813 findings.
- `tsc --noEmit` failed with type errors, including broken calls, missing `toast`, and unsafe possibly-undefined access.

## Priority implementation order

1. Rotate exposed SMTP credentials and remove/purge the sensitive SQL dump/history.
2. Remove/protect maintenance and setup endpoints.
3. Implement candidate assignment plus mandatory backend scope/IDOR checks across every API.
4. Fix CORS, HTTPS/cookies, CSRF posture, development error disclosure, and rate limiting.
5. Harden every upload/download route.
6. Implement blacklist approval and approve/export permission enforcement.
7. Convert email worker to scheduled CLI processing and repair queue deduplication/retry controls.
8. Add pagination, indexes, lint/type fixes, and test coverage.
-----------------------
1. Scope/IDOR security
   Users can access or modify other users’ candidates, notes, interviews, documents, offers, reports, and emails by changing IDs. Add candidate assignment fields and enforce All / Assigned / None in every backend query.
2. Exposed SMTP credential
   The SMTP password is present in api/database.sql. Rotate it immediately, remove it from Git/history, and store it in environment secrets.
3. Dangerous public endpoints
   api/settings/email/db_update_templates.php can delete all email templates without login. Remove or admin-protect it. Also remove/protect db_templates.php and system/setup.php.
4. Unsafe uploads/downloads
   Public application uploads accept arbitrary files without size/type validation. Candidate downloads rely on filenames and do not verify ownership. Validate files, store outside public folders, and authorize documents by candidate scope.
5. CORS and HTTPS
   APIs reflect any website origin while allowing cookies. Use a fixed frontend-origin allowlist, require HTTPS, and set JWT cookies as Secure, HttpOnly, and SameSite.
6. JWT storage / CSRF
   JWT is stored in localStorage, so XSS can steal it. Prefer secure HttpOnly cookies with CSRF protection, or strengthen XSS prevention substantially.
7. Blacklist approval workflow
   Recruiters can directly blacklist candidates. Build request → pending → HR/Admin approve/reject flow with backend permission checks.
8. Missing permission actions
   can_approve and can_export exist in the database but are not enforced. Implement dedicated backend checks.
9. Production error exposure
   api/db.php runs in development mode and can expose SQL errors, paths, and stack traces. Disable detailed browser errors in production.
10. Login protection
       Add rate limiting, failed-login audit, password policy, and optional account lockout/CAPTCHA.
11. Email worker reliability
       Run the worker through cron/Windows Task Scheduler/CLI, not a browser endpoint. Add queue indexes and database-enforced duplicate protection.
12. Performance and build quality
       Add pagination to candidate APIs, scope dashboard/report queries, reduce N+1 notification queries, fix TypeScript errors, and resolve lint failures.
The first implementation phase should focus on items 1–6 before the application is exposed to real users or production data.