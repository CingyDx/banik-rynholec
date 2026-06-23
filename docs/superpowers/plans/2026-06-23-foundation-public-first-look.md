# Foundation And Public First Look Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a tested, responsive first release of the public TJ Banik Rynholec website and a deployment-ready application foundation.

**Architecture:** Astro renders fast public pages while React is enabled only for future interactive islands and the administration application. Public content starts as typed local data so design review is not blocked by the database; later plans replace repositories behind stable interfaces with PostgreSQL-backed implementations. Netlify configuration is committed, but no live project or domain change is required to run locally.

**Tech Stack:** Astro, React, TypeScript, CSS custom properties, Lucide React, Vitest, Testing Library, Playwright, Netlify CLI

---

## File Structure

```text
/
  .editorconfig
  .gitignore
  README.md
  astro.config.mjs
  netlify.toml
  package.json
  playwright.config.ts
  tsconfig.json
  vitest.config.ts
  public/
    favicon.svg
    images/
      club-logo.png
      sportovni-areal-hero.jpg
      sportovni-areal-secondary.jpg
  src/
    components/
      public/
        ContactBand.astro
        FacilityPreview.astro
        Footer.astro
        Header.astro
        Hero.astro
        NewsPreview.astro
        SchedulePreview.astro
        TeamStrip.astro
    content/
      site.ts
    layouts/
      PublicLayout.astro
    pages/
      index.astro
      klub.astro
      kontakt.astro
      rezervace.astro
      tymy/
        index.astro
    styles/
      global.css
      tokens.css
    test/
      setup.ts
  tests/
    e2e/
      public-site.spec.ts
    unit/
      site-content.test.ts
```

## Task 1: Initialize Source Control And Project Metadata

**Files:**
- Create: `.editorconfig`
- Create: `.gitignore`
- Create: `README.md`

- [ ] Run `git init -b main`, commit the approved documentation, then create `feat/public-first-look`; all application implementation happens on the feature branch.
- [ ] Add ignores for `node_modules`, `dist`, `.astro`, `.netlify`, Playwright output, coverage, and all `.env*` files except `.env.example`.
- [ ] Document local commands, deployment ownership, the WEDOS/Netlify split, and the rule that credentials never enter Git.
- [ ] Run `git status --short` and confirm only intentional workspace files are untracked.
- [ ] Commit with `git add .editorconfig .gitignore README.md docs && git commit -m "docs: define Banik Rynholec delivery plan"`, then run `git switch -c feat/public-first-look`.

## Task 2: Scaffold Astro, React, And Test Tooling

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `src/test/setup.ts`
- Create: `netlify.toml`

- [ ] Create an Astro TypeScript project in the existing directory without replacing `docs` or Git metadata.
- [ ] Install `@astrojs/react`, `react`, `react-dom`, `lucide-react`, `vitest`, `jsdom`, Testing Library, Playwright, and Netlify CLI as project dependencies.
- [ ] Add scripts: `dev`, `build`, `preview`, `test`, `test:watch`, `test:e2e`, and `check`.
- [ ] Configure Netlify to build with `npm run build`, publish `dist`, and use Node 24.
- [ ] Run `npm run check`, `npm test -- --run`, and `npm run build`; all must exit 0.
- [ ] Commit with `git add . && git commit -m "build: scaffold Astro application"`.

## Task 3: Establish Typed Public Content

**Files:**
- Create: `src/content/site.ts`
- Create: `tests/unit/site-content.test.ts`

- [ ] Write a failing test that requires the four team categories, club contact details, facility summaries, navigation routes, and sample schedule items.
- [ ] Run `npm test -- --run tests/unit/site-content.test.ts` and confirm it fails because `src/content/site.ts` does not exist.
- [ ] Implement readonly TypeScript data and exported types for navigation, teams, facilities, news, contacts, and schedule items.
- [ ] Run the focused test and confirm it passes.
- [ ] Commit with `git add src/content tests/unit && git commit -m "feat: add typed public club content"`.

## Task 4: Prepare Approved Visual Assets

**Files:**
- Create: `public/images/club-logo.png`
- Create: `public/images/sportovni-areal-hero.jpg`
- Create: `public/images/sportovni-areal-secondary.jpg`
- Create: `public/favicon.svg`
- Document source: `README.md`

- [ ] Render the supplied PDF logo to a transparent PNG at a size suitable for header and high-density screens.
- [ ] Download two clearly identified sports-complex photos from the municipality page supplied by the client and preserve their aspect ratios.
- [ ] Optimize public raster assets while keeping the source PDF outside the repository.
- [ ] Record each temporary asset source and the need for final publication permission in `README.md`.
- [ ] Run an image-dimension check, confirm the logo is not visibly cropped, and document the low-resolution municipality source limitation until the club supplies originals.
- [ ] Commit with `git add public README.md && git commit -m "assets: add initial club identity and venue photos"`.

## Task 5: Build The Visual System And Shared Layout

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `src/layouts/PublicLayout.astro`
- Create: `src/components/public/Header.astro`
- Create: `src/components/public/Footer.astro`

- [ ] Define a balanced palette based on club green and black, with neutral white/gray surfaces and a restrained contrasting accent; avoid a one-color green interface.
- [ ] Define spacing, typography, focus, border, and responsive container tokens without viewport-scaled font sizes.
- [ ] Implement a compact responsive header with visible club identity, desktop navigation, accessible mobile navigation, and a clear booking command.
- [ ] Implement metadata, skip link, semantic landmarks, and footer contact/navigation content in the shared layout.
- [ ] Run `npm run check` and `npm run build`; both must pass.
- [ ] Commit with `git add src/styles src/layouts src/components/public/Header.astro src/components/public/Footer.astro && git commit -m "feat: build public design system and shell"`.

## Task 6: Build The Homepage As A Real Club Experience

**Files:**
- Create: `src/components/public/Hero.astro`
- Create: `src/components/public/SchedulePreview.astro`
- Create: `src/components/public/TeamStrip.astro`
- Create: `src/components/public/FacilityPreview.astro`
- Create: `src/components/public/NewsPreview.astro`
- Create: `src/components/public/ContactBand.astro`
- Create: `src/pages/index.astro`

- [ ] Build a first viewport centered on the real club/venue image, the literal club name, immediate upcoming activity, and one booking action; leave the next section visible on common desktop and mobile screens.
- [ ] Add a scan-friendly upcoming schedule, team navigation, facility overview, current-news preview, and contact band without nesting cards inside cards.
- [ ] Ensure image crops preserve the inspectable venue subject at mobile and desktop breakpoints.
- [ ] Run `npm run check`, `npm test -- --run`, and `npm run build`; all must pass.
- [ ] Commit with `git add src && git commit -m "feat: create public homepage first look"`.

## Task 7: Add Supporting Public Routes

**Files:**
- Create: `src/pages/klub.astro`
- Create: `src/pages/kontakt.astro`
- Create: `src/pages/rezervace.astro`
- Create: `src/pages/tymy/index.astro`

- [ ] Add concise club, teams, and contact pages using the shared layout and typed content.
- [ ] Add a reservation explainer page that clearly labels requests as manually approved and does not pretend the request backend exists yet.
- [ ] Ensure every header/footer navigation target resolves without a placeholder error.
- [ ] Run `npm run check` and `npm run build`; both must pass.
- [ ] Commit with `git add src/pages && git commit -m "feat: add initial public routes"`.

## Task 8: Verify Behavior And Responsive Rendering

**Files:**
- Create: `tests/e2e/public-site.spec.ts`
- Modify: `playwright.config.ts`

- [ ] Write Playwright tests for page title, primary navigation, booking route, mobile menu, image loading, and absence of horizontal overflow.
- [ ] Run `npm run test:e2e` and fix failures without weakening assertions.
- [ ] Capture desktop at 1440x900 and mobile at 390x844; inspect hierarchy, crops, text wrapping, focus states, and overlap.
- [ ] Run final verification: `npm run check && npm test -- --run && npm run build && npm run test:e2e`.
- [ ] Commit with `git add . && git commit -m "test: verify public first look"`.

## Task 9: Prepare Remote Hosting Without Changing The Domain

**Files:**
- Modify: `README.md`
- Generated and ignored: `.netlify/state.json`

- [ ] Create a private GitHub repository named `banik-rynholec` under Kryštof's chosen owner, then add it as `origin` and push `main`.
- [ ] Create a separate Netlify project named `banikrynholec` in the existing `kryon-dx` team.
- [ ] Link the local project, deploy a preview, and smoke-test the preview URL.
- [ ] Do not connect `banikrynholec.cz` or change WEDOS DNS during this phase.
- [ ] Record the preview workflow and ownership boundaries in `README.md`.
- [ ] Commit with `git add README.md && git commit -m "docs: add preview deployment workflow"`, then push `main`.

## Definition Of Done

- [ ] A fresh clone installs with `npm ci` and passes all verification commands.
- [ ] The first look is visibly tailored to TJ Banik Rynholec and uses real supplied assets.
- [ ] Desktop and mobile screenshots show no overlap, clipped controls, missing images, or horizontal scroll.
- [ ] The public routes are honest about unfinished booking functionality.
- [ ] Git history contains focused commits and no credentials.
- [ ] A Netlify preview is available while the production domain remains untouched.
