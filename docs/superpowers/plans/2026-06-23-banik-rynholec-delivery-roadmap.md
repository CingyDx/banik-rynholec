# TJ Banik Rynholec Delivery Roadmap

**Goal:** Deliver the revised simple club website and calendar administration scope.

**Architecture:** One Astro application serves the public website. React components handle the calendar and `/admin` interface. Netlify Functions protect the admin API and Netlify Blobs stores calendar JSON.

**Tech Stack:** Astro, React, TypeScript, Vitest, Playwright, Netlify Functions, Netlify Blobs, Excel import/export.

---

## Delivery Order

- [x] Phase 1: Public first look
  - Responsive public site foundation.
  - Club pages, facility page, contacts, teams, news, and first gallery.
  - Creator credit and Netlify preview.
- [x] Phase 2: Calendar prototype
  - Month, week, and list views.
  - Filters by resource/team and status.
  - Detail modal.
  - Excel import/export with mock data.
- [x] Phase 3: Revised admin scope
  - One shared admin login.
  - Admin-only calendar editing.
  - Admin-only import/export/reset/template actions.
  - Public calendar remains read-only.
- [ ] Phase 4: Client content pass
  - Replace placeholder text with confirmed club copy.
  - Replace temporary photos with original club photos if available.
  - Confirm real contacts, team descriptions, articles, and gallery sets.
- [ ] Phase 5: Production setup
  - Set Netlify environment variables for the admin account.
  - Test Netlify Functions and Blob persistence on deploy.
  - Connect `banikrynholec.cz` DNS after approval.
  - Verify SSL, redirects, mobile layout, and final Excel workflow.

## Release Gates

- [x] No real credentials are committed.
- [x] Public calendar hides admin actions.
- [x] Unit tests cover admin auth, calendar import/export, content, and UI mode behavior.
- [x] Playwright covers public pages and calendar behavior on desktop and mobile.
- [ ] Production deploy is reviewed before DNS changes.

## Inputs Needed From The Club

- [ ] Confirm final page text.
- [ ] Confirm official phone numbers and email addresses.
- [ ] Provide original-size logo if available.
- [ ] Provide better photos or approve using the current municipality photos.
- [ ] Provide Rudla's real Excel format if it differs from the prepared template.
- [ ] Confirm who will know the shared admin login.
