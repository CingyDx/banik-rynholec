# TJ Banik Rynholec Web Platform - Design

## 1. Objective

Build a standalone club website and facility operations application for TJ Banik Rynholec. The product will combine a public club website, a view-only public calendar, booking requests, an invite-only administration area, content management, and Excel calendar import/export.

The first release will use manual booking approval. It will not include online payments or automatic booking confirmation.

## 2. Confirmed Product Decisions

- The club website is independent of the Rynholec municipality website.
- The club owns `banikrynholec.cz` at WEDOS.
- Netlify hosts the application initially.
- The application is a separate Netlify project from `cingytech` in the same team.
- Netlify access remains with Cingy.Tech. Michal and Rudla use the application admin panel only.
- The domain remains owned by the club.
- The first hosting tier is Netlify Free. Upgrade to Personal only when measured usage requires it.
- The design must remain portable enough to migrate away from Netlify later.
- Public booking requests require manual approval by a facility administrator.
- Content updates and booking changes must not require a production deploy.

## 3. User Roles

### Public visitor

- Reads club information, articles, team pages, gallery, and approved calendar events.
- Submits a booking request for a facility and time interval.
- Receives acknowledgement and the final approval or rejection by email.

### Facility administrator

- Invite-only account for Michal, Rudla, and approved successors.
- Reviews, edits, approves, rejects, and cancels booking requests.
- Manages calendar events, facilities, opening rules, and availability.
- Imports and exports calendar data in XLSX format.
- Manages public content if granted the editor permission.

### Super administrator

- Cingy.Tech role.
- Has all application permissions.
- Manages hosting, deployments, environment configuration, database migrations, monitoring, backups, and support.
- Netlify account access is never required for facility administrators.

## 4. Scope Decomposition

The product consists of six bounded areas:

1. Public club website.
2. Authentication and authorization.
3. Facility calendar and booking workflow.
4. Administration application.
5. Content and media management.
6. Hosting, monitoring, backup, and maintenance.

These areas are delivered incrementally so the club can review working software before the full system is complete.

## 5. Technical Architecture

### Frontend

- Astro for public, SEO-friendly pages.
- React application mounted under `/admin` for the administration experience.
- Responsive design for mobile, tablet, and desktop.
- Public calendar shows approved events only and never exposes private contact data.

### Authentication

- Netlify Identity through `@netlify/identity`.
- Registration disabled; users are invite-only.
- Application roles: `superadmin`, `facility_admin`, and `editor`.
- `/admin/login` is the public login route; `/admin/*` requires authentication.
- Every privileged API action checks identity and role server-side. Route hiding alone is not security.

### API and business logic

- Netlify Functions provide booking, calendar, content, notification, and import/export APIs.
- Mutating operations use transactions where multiple records must change together.
- Secrets are stored only in Netlify environment variables.

### Database

- Netlify Database provides managed PostgreSQL.
- Production and deploy-preview database branches stay isolated.
- SQL migrations are versioned with the application.
- Relational tables include:
  - `facilities`
  - `booking_requests`
  - `calendar_events`
  - `admin_profiles`
  - `teams`
  - `articles`
  - `media`
  - `import_jobs`
  - `audit_log`
- Approved events for the same facility cannot overlap. Both the API and database enforce this rule.

### Files

- Netlify Blobs stores managed images and optional original XLSX import files.
- Imports may discard the original file after processing when retention is not required.

### Email

- A transactional email provider sends booking acknowledgements, approval/rejection messages, password flows, and administrator alerts.
- Provider choice remains replaceable behind one notification module.

## 6. Booking Workflow

1. Visitor selects a facility, date, start time, end time, and supplies contact information.
2. The server validates input, rate limits the request, and stores it as `pending`.
3. Michal and Rudla receive a notification.
4. An administrator opens the request in `/admin/requests`.
5. The administrator approves, rejects, edits, or requests clarification.
6. Approval creates or updates a public calendar event in one transaction.
7. The server rejects approval when it would overlap another approved event.
8. The requester receives the decision by email.
9. Every administrative decision is written to the audit log.

The first release does not reserve a time slot while a request is pending. Administrators decide between competing requests.

## 7. Calendar and Excel

### Public calendar

- Day, week, and month views.
- Filters by facility and event type.
- Shows matches, training, approved rentals, tournaments, and closures.
- Contains no requester email, phone number, or internal note.

### Excel import

- Accept only the documented XLSX template or a mapped equivalent.
- Upload creates an import preview, not an immediate write.
- Preview reports invalid rows, duplicates, missing fields, and time conflicts.
- Administrator confirms valid rows before import.
- Import is transactional and produces an audit record.

### Excel export

- Export by date range, facility, status, and event type.
- Exports preserve stable column names for re-import.

## 8. Content Scope

- Homepage.
- Club information and contacts.
- Team categories: preparation, youth, A team, and veterans.
- Match articles and announcements.
- Tables and results where data is available.
- Facility pages for the pitch, gym, sauna, and other approved spaces.
- Gallery.
- Partners and sponsors.
- Public calendar and booking request form.

Municipality photos and the supplied PDF logo may be used for the first design. Higher-quality logo and match photography remain desirable before final launch.

## 9. Security and Privacy

- Enable MFA on the Cingy.Tech Netlify account before adding the client project.
- Invite-only application accounts.
- Server-side role checks for every privileged operation.
- Passwords are handled by the identity provider and never stored in the application database.
- Rate limiting and bot protection on public forms.
- Validation and parameterized SQL for all inputs.
- Private applicant data is visible only to authorized administrators.
- Audit log records actor, action, target, and timestamp.
- Database and media backup procedure is documented and tested.
- WEDOS and Netlify credentials are never committed to the repository or stored in project documents.
- Privacy notice and retention rules are required before launch, especially because youth team photos may be published.

## 10. Error Handling

- Booking submission returns a clear reference number.
- Repeated submissions use idempotency protection where practical.
- Notification failure does not lose a booking; it is logged and retried.
- Import errors identify exact spreadsheet rows and do not partially apply an unconfirmed import.
- Calendar conflicts return actionable details to administrators.
- Public pages remain available when an optional content or notification service is temporarily unavailable.

## 11. Testing

- Unit tests for booking validation, role checks, conflict detection, and Excel mapping.
- Integration tests for database transactions and Netlify Functions.
- End-to-end tests for login, request submission, approval, rejection, calendar publication, import, and export.
- Security tests verify unauthorized users cannot access admin APIs.
- Responsive browser testing on common desktop and mobile viewports.
- Accessibility checks for navigation, forms, dialogs, and calendar controls.
- A restore drill validates backup recovery before production handover.

## 12. Netlify and Ownership Model

- Create the `banikrynholec` Netlify project in the existing Cingy.Tech team.
- `cingytech` and `banikrynholec` share the team's credit allowance.
- Use unlimited deploy previews during development and publish production only for reviewed releases.
- Start on Free and monitor credits, bandwidth, functions, database usage, and web requests.
- Upgrade to Personal for a busy development or launch period only when measurements justify it.
- Reassess downgrade after two stable billing cycles.
- The source repository, export procedure, and contract must define a clean client handover path.
- A home server is excluded from the first production release and may be evaluated later as a separate infrastructure project.

## 13. Delivery Roadmap

### Week 1: Discovery and secure foundation

- Confirm v1 scope with Michal.
- Obtain the sample XLSX from Rudla.
- List facilities, booking rules, administrators, and notification recipients.
- Audit WEDOS without changing DNS.
- Enable Netlify MFA and prepare repository/project ownership rules.

### Week 2: Product and visual design

- Final sitemap and user flows.
- Public homepage, calendar, booking, and admin wireframes.
- Design direction using club colors and available photography.
- Approve the design before implementation.

### Weeks 3-4: Platform foundation and public MVP

- Application shell, database migrations, identity, roles, and API foundation.
- Public club pages, facility pages, teams, articles, and public calendar.
- Initial content and media pipeline.

### Weeks 5-6: Administration and booking workflow

- Admin dashboard and request queue.
- Calendar event management.
- Manual approval/rejection flow and conflict detection.
- Email notifications and audit logging.

### Week 7: Excel and hardening

- Import preview, validation, confirmation, and export.
- Security, rate limiting, privacy, backup, and monitoring.
- Full responsive and accessibility QA.

### Week 8: Client review and launch

- Acceptance testing with Michal and Rudla.
- Administrator training and runbook.
- Final content and photography adjustments.
- Connect WEDOS DNS, verify SSL, redirects, monitoring, and backups.
- Launch and observe usage before deciding whether a paid Netlify plan is needed.

## 14. Explicitly Deferred

- Automatic booking confirmation.
- Online payments and invoices.
- Customer accounts for the public.
- Mobile applications.
- Home-server production hosting.
- Complex league integrations not present in the supplied data.

These can be priced and delivered as later phases after the manual workflow is stable.

