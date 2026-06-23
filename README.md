# TJ Banik Rynholec

Public club website and facility administration platform for TJ Banik Rynholec.

## Status

The project is in the public first-look phase. The approved product and visual specifications live in `docs/superpowers/specs`, and implementation plans live in `docs/superpowers/plans`.

## Local Development

Commands will be available after the Astro foundation is installed:

```bash
npm install
npm run dev
npm run check
npm test -- --run
npm run build
npm run test:e2e
```

## Ownership And Hosting

- TJ Banik Rynholec owns `banikrynholec.cz` at WEDOS.
- Cingy.Tech manages source code, Netlify hosting, deployments, backups, and support.
- The application will use a dedicated `banikrynholec` Netlify project in the existing `kryon-dx` team.
- Client administrators use the application at `/admin`; they do not need Netlify access.
- WEDOS DNS remains unchanged until launch readiness is confirmed.

## Security

- Credentials, tokens, applicant data, and environment files never enter Git.
- Netlify and WEDOS credentials belong only in their provider interfaces or approved secret stores.
- Netlify MFA must be enabled before production launch.

## Temporary Asset Sources

- Club crest source: `C:\Users\kryst\Downloads\2-Logo Banik Rynholec.pdf`, supplied by the client. The source PDF stays outside the repository.
- Venue photos: [Obec Rynholec - Sportovni areal](https://www.obecrynholec.cz/obec-rynholec/sportovni-areal/), supplied by the client as the temporary photo source.
- The municipality versions are only 450 pixels wide. They are suitable for the first look, but launch quality requires original-size files or a new club photo set.
- Publication permission and youth-photo privacy rules must be confirmed before launch.

## Git Workflow

- `main` contains reviewed releases.
- Feature work is developed on focused branches and reviewed through deploy previews.
- Production deploys are reserved for reviewed releases; content and booking updates will not trigger builds.

