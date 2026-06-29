# TJ Banik Rynholec Web - Current Scope

## 1. Objective

Deliver a standalone club website for TJ Banik Rynholec with a simple informational calendar and one shared administrator login.

This is the revised budget-friendly scope after the client confirmed that the club wants an easy website with micro administration, not a full booking platform.

## 2. Confirmed Decisions

- The website is independent of the Rynholec municipality website.
- The club owns `banikrynholec.cz` at WEDOS.
- Netlify hosts the application initially.
- Netlify access remains with Cingy.Tech.
- Club administrators use `/admin`; they do not need GitHub or Netlify access.
- The domain remains owned by the club.
- The design uses the club direction: green, black, football, local club.
- Available photos from the municipality website can be used for prototype work.
- Better original photos should be supplied before final launch if available.
- WEDOS credentials and all production secrets stay outside Git.

## 3. In Scope For V1

### Public website

- Homepage.
- Club information.
- Team categories:
  - Pripravka.
  - Zaci.
  - A tym.
  - Stara garda.
- News/articles section for match reports and announcements.
- Gallery.
- Facility/area information.
- Contact page.
- Public read-only calendar.
- Creator credit for Cingy.Tech.

### Calendar

- Public monthly, weekly, and list views.
- Filters by field/facility/team and status.
- Event detail after clicking a calendar entry.
- Statuses:
  - Volno.
  - Obsazeno.
  - Trening.
  - Zapas.
  - Ceka na schvaleni.
- The calendar is informational only. It does not accept public booking requests in V1.

### Administration

- One shared administrator login.
- No roles.
- No public registration.
- Admin can edit calendar records on the web.
- Admin can import calendar records from Excel.
- Admin can export current calendar records to Excel.
- Admin can download a prepared Excel template for offline use.
- Rudla can fill the Excel template offline and import it later when online.

### Hosting And Launch

- Netlify project for the site.
- Runtime calendar data stored outside static builds.
- Environment variables for the shared admin account.
- DNS help for `banikrynholec.cz` when the site is approved.
- Basic responsive testing on desktop and mobile.

## 4. Explicitly Out Of Scope For V1

- Public online reservation form.
- Public user accounts.
- Multiple administrator roles.
- Automatic booking approval.
- Email approval/rejection workflow.
- Online payments.
- League/table integrations.
- Full CMS for every text and image.
- Complex audit log.
- Custom database platform.
- Home-server production hosting.

These can be priced later as separate upgrades.

## 5. Security Notes

- The shared admin password is configured only through Netlify environment variables.
- The session secret is configured only through Netlify environment variables.
- Real credentials, tokens, WEDOS passwords, and client private data must never enter Git.
- The club should change the WEDOS password after DNS setup because credentials were shared by email.

## 6. Acceptance Criteria

- Public visitor can read the club website on desktop and mobile.
- Public visitor can open the calendar, switch month/week/list views, filter entries, and view detail.
- Public visitor cannot import, export, create, edit, or delete calendar data.
- Admin can log in through `/admin`.
- Admin can create, edit, delete, import, export, reset, and download the Excel template.
- Excel import/export preserves the documented columns.
- The website builds successfully and automated tests pass.
