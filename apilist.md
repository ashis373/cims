# CIMS API Endpoints

This document lists all active API endpoints inside the /api directory used by the Recruitment Dashboard.

## Authentication & Authorization
- POST /api/auth/login.php - Authenticate users and return JWT.
- POST /api/auth/logout.php - Revoke JWT and logout.
- POST /api/auth/reset_password.php - Reset a user's password.
- GET /api/auth/validate.php - Validate current session token.

## Candidates Management
- GET/POST /api/candidates/candidates.php - CRUD operations for candidates.
- POST /api/candidates/documents.php - Fetch or upload candidate documents.
- GET /api/candidates/download.php - Download a specific candidate's CV/Resume.
- POST /api/candidates/duplicates.php - Check for duplicate candidate entries based on email/phone.
- GET/POST /api/candidates/interviews.php - Schedule and manage candidate interviews.
- GET/POST /api/candidates/notes.php - Add/fetch notes on a specific candidate.
- GET /api/candidates/timeline.php - Fetch the activity timeline of a candidate.
- POST /api/candidates/upload.php - Upload and parse candidate resumes (CV Extraction).

## Job Openings
- GET/POST /api/jobs/jobs.php - Create, view, update, and manage job openings.
- GET /api/jobs/departments.php - Fetch all active departments for job grouping.

## Offers & Joining
- GET/POST /api/offers/offers.php - Manage offer letters and joining status.

## Risk Management (Rejections & Blacklists)
- GET/POST /api/rejections/rejected.php - Fetch and manage rejected candidates.
- GET/POST /api/rejections/blacklisted.php - Fetch and manage blacklisted candidates.

## Analytics & Reports
- GET /api/dashboard/stats.php - Fetch high-level recruitment metrics and pipeline stats for the dashboard.
- GET /api/reports/reports.php - Generate detailed hiring and performance reports.

## System Alerts & Notifications
- GET/POST /api/notifications/notifications.php - Fetch and manage system alerts/notifications.

## Email Management & SMTP
- GET/POST /api/settings/email/templates.php - CRUD operations for email templates.
- GET/POST /api/settings/email/smtp.php - Read and update SMTP configurations.
- POST /api/settings/email/test.php - Dispatch a test email to verify SMTP settings.
- POST /api/settings/email/send_manual.php - Manually dispatch emails to candidates.
- POST /api/settings/email/trigger.php - Trigger automated event-based emails.
- POST /api/settings/email/draft.php - Preview/generate an email draft before sending.
- GET /api/settings/email/logs.php - View SMTP delivery and error logs.
- GET /api/settings/email/queue_status.php - Monitor the background email queue.
- GET/POST /api/settings/email/worker.php - Process queued emails in the background.
- POST /api/settings/email/toggle_worker.php - Enable/Disable the email queue worker.

## System Administration & Users
- GET/POST /api/system/users.php - Manage system users (Recruiters, HR, etc.).
- GET/POST /api/system/roles.php - Manage user roles.
- GET/POST /api/system/permissions.php - Read and update role-based access control (RBAC) permissions.
- GET/POST /api/system/profile.php - Manage the current user's profile and settings.
- GET/POST /api/system/settings.php - Global application configuration and settings.
- GET/POST /api/system/reasons.php - Manage dropdown lists (Rejection reasons, etc.).
- GET /api/system/error_logs.php - Fetch backend PHP system error logs.
- GET/POST /api/system/setup.php - Initial database/system setup script.
- GET/POST /api/recruiters/recruiters.php - Fetch and manage recruiters list.

## Miscellaneous
- pi/db.php - Database connection handler.
- pi/jwt_utils.php - JWT encoding/decoding utilities.
- pi/auth_middleware.php - Core security middleware injected into routes.
- pi/vendor/ - Contains PHPMailer and other dependencies.
