CIMS Production RBAC — Overall Summary
1. Exactly 4 Roles

The CIMS system will have only:

Administrator
HR Manager
Recruiter
Hiring Manager

No System, System Administrator, Super Admin, or other duplicate business roles should appear in the UI.

Role IDs remain:

ID	Role
1	Administrator
2	HR Manager
3	Recruiter
4	Hiring Manager
2. Existing Database Will Be Reused

Use the existing CIMS tables wherever possible:

cims_users
cims_roles
cims_permissions
Existing candidate tables
Existing interview/offer/rejection/blacklist tables
Existing activity/email tables

Do not create a second RBAC architecture.

If an existing table needs additional columns, modify it.

Also check and remove/migrate any obsolete system_* authentication/role references before production RBAC is enabled.

3. Database Is the Permission Source of Truth

Permissions will not be permanently hardcoded into PHP.

Database controls:

Role
Permission
Scope
User status
User-specific access
Candidate assignment

Example:

Recruiter
    candidate.view       → Allowed
    candidate.create     → Allowed
    candidate.edit       → Assigned
    candidate.delete     → Denied

Blacklist
    blacklist.view       → Allowed
    blacklist.request    → Allowed
    blacklist.approve    → Denied

Administrator can change these from the UI.

4. Permission Types

Only permissions actually required by the application should exist.

Examples:

Dashboard
Jobs
Candidates
Interviews
Offers
Joining
Rejections
Blacklist
Reports
Email
Users
Roles
Departments
Recruiters

Actions can include:

view
create
edit
delete
approve
export
manage
history
assignment
schedule
reschedule
feedback
request
reject
send
5. Permission Scope

Every applicable permission can have a scope:

All
Assigned
Limited

For example:

Administrator
Candidate Edit → All

HR Manager
Candidate Edit → All

Recruiter
Candidate Edit → Assigned

Hiring Manager
Candidate Edit → Limited
6. Candidate Assignment

Candidates must support assignment such as:

assigned_recruiter_id
assigned_hiring_manager_id

Example:

Candidate A
    ↓
Recruiter = Rahul

Rahul:

Edit Candidate → ALLOW

Another recruiter:

Edit Candidate → DENY

This must be checked by PHP, using the authenticated JWT user ID.

React must never be trusted for:

user_id
role_id
assigned_user_id
7. JWT Authentication

Login:

React
   ↓
PHP Login API
   ↓
Verify email/password
   ↓
password_verify()
   ↓
Check is_active
   ↓
Create JWT
   ↓
React

JWT contains minimum identity information such as:

user_id
role_id
iat
exp

JWT should not contain the complete permission matrix.

8. Database Permission Check on Every API

Every protected PHP endpoint follows:

Request
   ↓
Read JWT
   ↓
Validate JWT
   ↓
Get user_id
   ↓
Check user exists
   ↓
Check is_active
   ↓
Get current role
   ↓
Get current permission from DB
   ↓
Check scope
   ↓
Check candidate assignment
   ↓
Allow / Deny
   ↓
Execute action
   ↓
Activity Log

Unauthorized:

403 Forbidden

Invalid/expired authentication:

401 Unauthorized
9. React Permission-Driven UI

React uses permissions for UX.

It controls:

Sidebar
Routes
Buttons
Actions
Menus
Page access

For example:

Recruiter

Candidates          ✓
Pipeline            ✓
Interviews          ✓
User Management     ✗
Role Management     ✗
SMTP Settings       ✗

Hiring Manager

Candidate View      ✓
Interview View      ✓
Feedback            ✓
Add Candidate       ✗
SMTP                ✗

But hiding a button is not security.

PHP remains the final security gate.

10. Administrator Access Management

Administrator gets a dedicated:

User & Access Management

Example:

User	Role	Status	Permissions	Last Updated	Updated By	Action
Rahul	Recruiter	Active	18	31 Aug 2026	Administrator	Manage

Administrator can:

Add user
Edit user
Activate user
Deactivate user
Change role
Grant permission
Revoke permission
Change scope
Review access
Review access history
11. Grant / Revoke Permission

Example:

Recruiter

Candidates
    View       ✓
    Add        ✓
    Edit       ✓
    Delete     ✗

Blacklist
    View       ✓
    Request    ✓
    Approve    ✗

Administrator changes:

Blacklist → Approve
Denied → Allowed

After saving:

Database updated
        ↓
Audit record created
        ↓
Next API request uses new permission

No new login should be required just to make a database permission change effective.

12. Access Audit

Every access modification must be recorded.

For example:

User: Rahul
Action: Permission Updated
Permission: Candidates → Edit
Previous: Denied
New: Allowed
Updated By: Administrator
Date: 31-Aug-2026
Time: 11:42 AM

Also log:

Permission revoked
Role changed
Scope changed
User activated
User deactivated
13. Candidate Activity History

Important recruitment activities are logged:

Candidate Created
Candidate Updated
Candidate Status Changed
Candidate Assigned
Interview Scheduled
Interview Rescheduled
Interview Feedback Added
Offer Released
Offer Accepted
Offer Declined
Joining Updated
Candidate Rejected
Blacklist Requested
Blacklist Approved
Blacklist Rejected

Candidate Timeline displays:

User
Action
Date
Time

This preserves the complete candidate history required by the SRS.

14. Blacklist Approval Workflow

Blacklist is not direct approval for Recruiters.

Correct flow:

Recruiter
   ↓
Request Blacklist
   ↓
Pending
   ↓
HR Manager / Administrator
   ↓
Approve OR Reject
   ↓
Update Status
   ↓
Activity Log

If Recruiter directly calls the approval API:

403 Forbidden
15. Permanent Candidate Delete

Production rules:

Administrator       → Allowed
HR Manager          → Controlled/Limited
Recruiter           → Denied
Hiring Manager      → Denied

The backend must enforce this.

16. Deactivated Users

When Administrator deactivates:

is_active = 0

Existing JWT must no longer provide access.

Next request:

JWT valid
   ↓
User exists
   ↓
is_active = 0
   ↓
DENY

So a deactivated user's existing token cannot continue working.

17. Sidebar

The existing CIMS sidebar remains:

Dashboard

Job Openings
 ├─ All Jobs
 └─ Create Job

Candidates
 ├─ All Candidates
 ├─ Add Candidate
 ├─ Duplicate Check
 └─ Candidate Timeline

Recruitment Pipeline

Offers & Joining
 ├─ Offer Management
 └─ Joining Tracker

Risk Management
 ├─ Rejected Candidates
 └─ Blacklisted Candidates

Reports
 ├─ Candidate Report
 ├─ Recruiter Performance
 ├─ Hiring Report
 └─ Rejection Analysis

Alerts Center

Email Settings
 ├─ Templates
 ├─ Send Email
 ├─ SMTP Settings
 └─ Delivery Logs

System Settings
 ├─ User Profile
 ├─ User Roles & Permissions
 ├─ Departments
 └─ Recruiters

But visibility is determined by permissions, not four separate hardcoded role menus.

18. Important Permission Mapping

Examples:

dashboard.view
jobs.view
jobs.create

candidate.view
candidate.create
candidate.edit
candidate.delete
candidate.history
candidate.assignment

offer.view
offer.manage
offer.release
offer.approve

blacklist.view
blacklist.request
blacklist.approve
blacklist.reject

report.view
report.export

email.template.view
email.template.manage
email.send
email.smtp.manage
email.logs.view

user.view
user.create
user.edit
user.deactivate

role.view
role.manage

department.manage
recruiter.manage
19. Existing CIMS Modules Stay

This RBAC update does not replace the CIMS application.

It integrates access control into your existing:

Dashboard
Jobs
Candidates
Pipeline
Offers & Joining
Risk Management
Reports
Alerts
Email
System Settings

The objective is:

Same CIMS modules + production-level authentication + authorization + permissions + scopes + audit + assignment control.

20. Production Testing

Each role must be tested separately.

Administrator
All modules             PASS
Create user             PASS
Deactivate user         PASS
Assign role             PASS
Grant permission        PASS
Revoke permission       PASS
Change scope            PASS
SMTP                    PASS
Blacklist approval      PASS
Delete candidate        PASS
Reports                 PASS
Export                  PASS
HR Manager
Candidates              PASS
Edit candidates         PASS
Interviews              PASS
Offers                  PASS
Blacklist approval      PASS
Reports                 PASS
Export                  PASS

User Management         BLOCK
Role Management         BLOCK
SMTP                    BLOCK
Recruiter
Add candidate           PASS
Edit assigned           PASS
Edit another recruiter  BLOCK
Delete candidate        BLOCK
Interview               PASS
Blacklist request       PASS
Blacklist approval      BLOCK
Users                   BLOCK
Roles                   BLOCK
SMTP                    BLOCK
Hiring Manager
Assigned candidates     PASS
Resume                  PASS
Interview               PASS
Feedback                PASS
Recommendation          PASS
Add candidate           BLOCK
Master edit             BLOCK/Limited
Blacklist approval      BLOCK
Users                   BLOCK
SMTP                    BLOCK
Final Production Architecture
                    CIMS
                      │
             ┌────────┴────────┐
             │                 │
           React             PHP API
             │                 │
       Permission UX       JWT Validation
             │                 │
       Sidebar/Routes      User Active Check
             │                 │
       Buttons/Actions     Current Role
             │                 │
             │             Permission DB
             │                 │
             │                Scope
             │                 │
             │             Assignment
             │                 │
             └──────────→ Activity Log
                              │
                            MySQL
                              │
             ┌────────────────┼────────────────┐
             │                │                │
        cims_users       cims_roles     cims_permissions
Production Definition of Done

The module is complete only when:

Authentication

JWT login works
JWT expiration works
Active-user check works
Deactivated users lose access

RBAC

Exactly 4 roles
No System/Super Admin duplicate role
Existing CIMS tables reused
Correct role IDs
Permissions stored in DB
Scopes supported
Assignments supported

Administrator

User creation
Role assignment
Permission grant
Permission revoke
Scope changes
Activation/deactivation
Access audit

Backend

Every protected API checks JWT
Every protected API checks active user
Every protected API checks permission
Scope is enforced
Assignment is enforced
401/403 responses are correct

Frontend

Permission-driven sidebar
Permission-driven routes
Permission-driven buttons
Unauthorized pages blocked

Recruitment

Candidate history
Activity log
Candidate assignment
Blacklist approval workflow
Protected deletion

Testing

All 4 roles tested
Postman/API tests completed
Assigned vs unassigned candidates tested
Admin-only APIs tested with non-admin JWT
Deactivated JWT tested
Permission revoke tested immediately

Most importantly: the Administrator becomes the person who can manage user access dynamically from the CIMS UI, while PHP + MySQL remain the actual security enforcement layer. This gives you the production-level access-control architecture without creating another role system.
 ---------------------------------------------------------------------------------------------- all product code ----------------------------------------------
Password policy — minimum length/complexity, and whether failed-login attempts get rate-limited or lock the account. Nothing in the doc mentions brute-force protection on the login endpoint.
HTTPS enforcement — JWT tokens sent over plain HTTP can be intercepted. Confirm your PHP server forces SSL/TLS, especially since this handles candidate PII (mobile, email, salary).
SQL injection protection — since this is raw PHP + MySQL, confirm every query uses prepared statements/parameterized queries, not string concatenation. This isn't mentioned anywhere in the RBAC doc but is a prerequisite for it to matter at all.
CORS configuration — if React and PHP are on different origins/ports in production, PHP needs explicit CORS rules so only your actual frontend domain can call the API — not any website.
JWT secret management — where does JWT_SECRET live? Should be in an environment variable, never committed to git, rotated periodically. Not mentioned in the doc.
Refresh token / session renewal — doc says JWT has exp but doesn't say what happens when it expires mid-work. Silent logout? Refresh token? Decide now so it's not a surprise in UAT.
Rate limiting on sensitive endpoints — login, blacklist approval, permission changes — to prevent abuse/scripted attacks.
Backup/rollback plan for the migration itself — Section 2 says "migrate/remove obsolete system_* references safely." Before running that migration on production data, take a full DB backup and test the migration on a staging copy first. This is the highest-risk step in the whole plan since it touches existing live data.
HTTPS-only cookies or secure storage for JWT on the React side — if you're storing the JWT in localStorage, it's vulnerable to XSS. Consider httpOnly cookies if your architecture allows it, or at minimum sanitize all rendered user input to prevent XSS from stealing tokens.