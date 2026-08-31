## User Roles & Permissions

The system will provide role-based access control to ensure that each user can access only the functions required for their responsibilities.

### 1. Admin

**Authority:** Full system control.

**Permissions:**

* Full access to all CMS modules.
* Create, edit, deactivate and manage users.
* Assign roles and permissions.
* Add, edit and manage candidates.
* View complete candidate history.
* Manage candidate documents and resumes.
* Schedule and manage interviews.
* View and submit interview feedback.
* Manage offers and joining information.
* Approve or manage blacklisted candidates.
* Manage rejection and blacklist reasons.
* Configure email templates.
* Configure SMTP settings.
* Send emails.
* View delivery logs.
* View all dashboards and reports.
* Export reports in Excel, CSV and PDF.
* Manage system/master data and settings.

---

### 2. HR Manager

**Authority:** Recruitment management, review and approval.

**Permissions:**

* View all candidates.
* Add and edit candidate records.
* View complete candidate history.
* Manage candidate lifecycle/status.
* Schedule and manage interviews.
* View and review interview feedback.
* Approve required recruitment actions.
* Manage offer-related activities.
* Review offer acceptance and joining status.
* Review rejected candidates.
* Review blacklisted candidates.
* Approve or reject requests to proceed with blacklisted candidates.
* View recruitment dashboard.
* View recruitment and HR reports.
* Export reports.
* View email activity and delivery logs.
* Cannot manage system administrator settings or user permissions unless explicitly granted by Admin.

---

### 3. Recruiter

**Authority:** Day-to-day candidate and recruitment management.

**Permissions:**

* Add new candidates.
* Edit candidate information.
* Search and filter candidates.
* View candidate history.
* Upload and manage candidate resumes/documents.
* Move candidates through permitted recruitment stages.
* Identify duplicate candidates.
* Add candidate notes and remarks.
* Schedule and reschedule interviews.
* Send candidate emails using approved email templates.
* Record candidate communication and follow-ups.
* Record rejection reasons.
* Submit candidates for blacklist approval.
* Update offer and joining status where permitted.
* View assigned candidate information.
* View relevant recruitment dashboard information.

**Restrictions:**

* Cannot delete candidates permanently.
* Cannot manage users or roles.
* Cannot change SMTP configuration.
* Cannot modify system settings.
* Cannot independently approve a blacklisted candidate unless authorized by HR Manager/Admin.
* Access to candidates may be restricted to assigned candidates depending on system configuration.

---

### 4. Hiring Manager

**Authority:** Candidate evaluation and hiring decision support.

**Permissions:**

* View candidates referred/assigned for their positions.
* View candidate profiles and resumes.
* View relevant candidate history.
* Review shortlisted candidates.
* View interview schedules.
* Participate in interview evaluation.
* Submit interview feedback.
* Recommend candidates for selection or rejection.
* View interview-related candidate information.
* View relevant position and hiring reports.

**Restrictions:**

* Cannot manage candidate master records unless permission is granted.
* Cannot manage users or roles.
* Cannot configure SMTP/email settings.
* Cannot modify system settings.
* Cannot independently blacklist candidates.
* Cannot approve blacklisted candidates unless explicitly authorized.

---

### Role Permission Summary

| Module / Action      | Admin | HR Manager |  Recruiter  | Hiring Manager |
| -------------------- | :---: | :--------: | :---------: | :------------: |
| Dashboard            |  Full |    Full    |   Relevant  |    Relevant    |
| View Candidates      |   ✅   |      ✅     |      ✅      |    Assigned    |
| Add Candidate        |   ✅   |      ✅     |      ✅      |        ❌       |
| Edit Candidate       |   ✅   |      ✅     |      ✅      |     Limited    |
| Delete Candidate     |   ✅   |   Limited  |      ❌      |        ❌       |
| Candidate History    |   ✅   |      ✅     |      ✅      |    Assigned    |
| Resume/Documents     |   ✅   |      ✅     |      ✅      |      View      |
| Duplicate Detection  |   ✅   |      ✅     |      ✅      |      View      |
| Interview Schedule   |   ✅   |      ✅     |      ✅      |      View      |
| Interview Feedback   |   ✅   |   Review   | Record/View |        ✅       |
| Offer Management     |   ✅   |      ✅     |   Limited   |      View      |
| Rejection Management |   ✅   |      ✅     |    Record   |    Recommend   |
| Blacklist            |   ✅   |   Approve  |   Request   |      View      |
| Email Templates      |   ✅   | Manage/Use |     Use     |       Use      |
| Send Email           |   ✅   |      ✅     |      ✅      |     Limited    |
| SMTP Settings        |   ✅   |      ❌     |      ❌      |        ❌       |
| Delivery Logs        |   ✅   |      ✅     |   Relevant  |        ❌       |
| Reports              |   ✅   |      ✅     |   Relevant  |    Relevant    |
| Export Reports       |   ✅   |      ✅     |   Limited   |     Limited    |
| User Management      |   ✅   |      ❌     |      ❌      |        ❌       |
| Role Management      |   ✅   |      ❌     |      ❌      |        ❌       |
| System Settings      |   ✅   |      ❌     |      ❌      |        ❌       |

### Access Control Rules

1. **Admin has full access** to all CMS functionality.
2. **HR Manager manages recruitment operations and approvals** but does not control system-level settings.
3. **Recruiter handles day-to-day candidate processing** but cannot perform administrative actions.
4. **Hiring Manager primarily evaluates candidates and provides interview feedback.**
5. Sensitive actions such as **blacklist approval, permanent deletion and system configuration** must require appropriate authorization.
6. All important actions should be recorded in the **Candidate History / Activity Log** with user name, date, time and action performed.
7. The system should enforce permissions at both **UI level and backend/API level**; hiding a button alone must not be considered security.
