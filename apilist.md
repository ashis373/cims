# CIMS API Endpoints

This document lists all active API endpoints inside the /api directory used by the Recruitment Dashboard.

## Authentication & Authorization
- POST http://localhost/full-cims/api/auth/login.php - Authenticate users and return JWT.
- POST http://localhost/full-cims/api/auth/logout.php - Revoke JWT and logout.
- POST http://localhost/full-cims/api/auth/reset_password.php - Reset a user's password.
- GET http://localhost/full-cims/api/auth/validate.php - Validate current session token.

## Candidates Management
- GET/POST http://localhost/full-cims/api/candidates/candidates.php - CRUD operations for candidates.
- POST http://localhost/full-cims/api/candidates/documents.php - Fetch or upload candidate documents.
- GET http://localhost/full-cims/api/candidates/download.php - Download a specific candidate's CV/Resume.
- POST http://localhost/full-cims/api/candidates/duplicates.php - Check for duplicate candidate entries based on email/phone.
- GET/POST http://localhost/full-cims/api/candidates/interviews.php - Schedule and manage candidate interviews.
- GET/POST http://localhost/full-cims/api/candidates/notes.php - Add/fetch notes on a specific candidate.
- GET http://localhost/full-cims/api/candidates/timeline.php - Fetch the activity timeline of a candidate.
- POST http://localhost/full-cims/api/candidates/upload.php - Upload and parse candidate resumes (CV Extraction).

## Job Openings
- GET/POST http://localhost/full-cims/api/jobs/jobs.php - Create, view, update, and manage job openings.
- GET http://localhost/full-cims/api/jobs/departments.php - Fetch all active departments for job grouping.

## Offers & Joining
- GET/POST http://localhost/full-cims/api/offers/offers.php - Manage offer letters and joining status.

## Risk Management (Rejections & Blacklists)
- GET/POST http://localhost/full-cims/api/rejections/rejected.php - Fetch and manage rejected candidates.
- GET/POST http://localhost/full-cims/api/rejections/blacklisted.php - Fetch and manage blacklisted candidates.

## Analytics & Reports
- GET http://localhost/full-cims/api/dashboard/stats.php - Fetch high-level recruitment metrics and pipeline stats for the dashboard.
- GET http://localhost/full-cims/api/reports/reports.php - Generate detailed hiring and performance reports.

## System Alerts & Notifications
- GET/POST http://localhost/full-cims/api/notifications/notifications.php - Fetch and manage system alerts/notifications.

## Email Management & SMTP
- GET/POST http://localhost/full-cims/api/settings/email/templates.php - CRUD operations for email templates.
- GET/POST http://localhost/full-cims/api/settings/email/smtp.php - Read and update SMTP configurations.
- POST http://localhost/full-cims/api/settings/email/test.php - Dispatch a test email to verify SMTP settings.
- POST http://localhost/full-cims/api/settings/email/send_manual.php - Manually dispatch emails to candidates.
- POST http://localhost/full-cims/api/settings/email/trigger.php - Trigger automated event-based emails.
- POST http://localhost/full-cims/api/settings/email/draft.php - Preview/generate an email draft before sending.
- GET http://localhost/full-cims/api/settings/email/logs.php - View SMTP delivery and error logs.
- GET http://localhost/full-cims/api/settings/email/queue_status.php - Monitor the background email queue.
- GET/POST http://localhost/full-cims/api/settings/email/worker.php - Process queued emails in the background.
- POST http://localhost/full-cims/api/settings/email/toggle_worker.php - Enable/Disable the email queue worker.

## System Administration & Users
- GET/POST http://localhost/full-cims/api/system/users.php - Manage system users (Recruiters, HR, etc.).
- GET/POST http://localhost/full-cims/api/system/roles.php - Manage user roles.
- GET/POST http://localhost/full-cims/api/system/permissions.php - Read and update role-based access control (RBAC) permissions.
- GET/POST http://localhost/full-cims/api/system/profile.php - Manage the current user's profile and settings.
- GET/POST http://localhost/full-cims/api/system/settings.php - Global application configuration and settings.
- GET/POST http://localhost/full-cims/api/system/reasons.php - Manage dropdown lists (Rejection reasons, etc.).
- GET http://localhost/full-cims/api/system/error_logs.php - Fetch backend PHP system error logs.
- GET/POST http://localhost/full-cims/api/system/setup.php - Initial database/system setup script.
- GET/POST http://localhost/full-cims/api/recruiters/recruiters.php - Fetch and manage recruiters list.

## Miscellaneous
- pi/db.php - Database connection handler.
- pi/jwt_utils.php - JWT encoding/decoding utilities.
- pi/auth_middleware.php - Core security middleware injected into routes.
- pi/vendor/ - Contains PHPMailer and other dependencies.


---------------------------------------------------------



