# TJ Banik Rynholec Delivery Roadmap

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the club website and facility administration platform in independently testable releases.

**Architecture:** One Astro application serves the public website and React administration interface. Netlify Functions expose the application API, managed PostgreSQL stores relational data, Netlify Blobs stores managed files, and invite-only Netlify Identity protects administrative operations.

**Tech Stack:** Astro, React, TypeScript, Vitest, Playwright, Netlify Functions, Netlify Identity, PostgreSQL, Netlify Blobs

---

## Delivery Order

- [ ] Phase 1: Foundation and public first look
  - Detailed plan: `docs/superpowers/plans/2026-06-23-foundation-public-first-look.md`
  - Result: local Git repository, tested Astro/React foundation, responsive public site, source assets, Netlify configuration, and a reviewable local build.
- [ ] Phase 2: Identity and administration foundation
  - Result: invite-only login, server-side roles, protected admin shell, administrator profiles, and authorization tests.
- [ ] Phase 3: Calendar and booking workflow
  - Result: facilities, public calendar, request form, manual approval/rejection, overlap protection, email notifications, and audit records.
- [ ] Phase 4: Content, media, and Excel operations
  - Result: editable articles, teams, gallery, facility content, Blob uploads, XLSX preview/import, and filtered export.
- [ ] Phase 5: Security, operations, and launch
  - Result: rate limiting, privacy and retention controls, backup restore drill, accessibility and responsive QA, WEDOS DNS connection, SSL, monitoring, and administrator runbook.

## Release Gates

- [ ] Each phase has automated tests for its business-critical behavior.
- [ ] Each phase produces a deploy preview for review before a production deploy.
- [ ] No phase commits credentials, applicant data, or original WEDOS secrets.
- [ ] Production content and booking updates run against runtime data and do not require a site rebuild.
- [ ] Booking requests remain manual until Michal explicitly approves a different operating model.

## Inputs Needed From The Club

- [ ] Confirm which facilities can receive public booking requests.
- [ ] Obtain Rudla's real XLSX calendar sample before Phase 4.
- [ ] Confirm administrator names and email addresses before Phase 2 invitations.
- [ ] Confirm booking rules, notification recipients, and requester data retention before Phase 3 production use.
- [ ] Confirm permission to publish municipality photos and youth-team photos before launch.

