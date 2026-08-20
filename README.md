# TJ Banik Rynholec

Public club website and simple calendar administration for TJ Banik Rynholec.

## Status

Version 1.0 delivers the public club website, a live informational calendar, one shared administrator login, manual calendar editing, and Excel import/export.

## Links

- GitHub: https://github.com/CingyDx/banik-rynholec
- Production website: https://banikrynholec.cz
- Netlify fallback: https://banikrynholec.netlify.app
- Netlify project: https://app.netlify.com/projects/banikrynholec

## Local Development

Use these commands for local work:

```bash
npm install
npm run dev
npm run check
npm test -- --run
npm run build
npm run test:e2e
```

For local testing with Netlify Functions and the `/admin` login, run Netlify Dev with local-only credentials:

```powershell
$env:BANIK_ADMIN_USERNAME="banikrynholec"
$env:BANIK_ADMIN_PASSWORD="local-only-password"
$env:BANIK_SESSION_SECRET="local-development-secret-change-in-netlify"
$env:ASTRO_DEV_BACKGROUND="0"
npx netlify dev --offline --no-open --command "npx astro dev --host 127.0.0.1 --port 4321" --target-port 4321 --port 8888 --functions netlify/functions
```

Open `http://localhost:8888` for the full local app. The plain Astro server is useful for public UI work, but it does not serve Netlify Functions.

## Admin Environment

The `/admin` area uses one shared administrator account configured in Netlify environment variables:

```bash
BANIK_ADMIN_USERNAME=banikrynholec
BANIK_ADMIN_PASSWORD=change-me
BANIK_SESSION_SECRET=replace-with-a-long-random-secret
```

Do not commit real passwords or production secrets.

## Ownership And Hosting

- TJ Banik Rynholec owns `banikrynholec.cz` at WEDOS.
- Cingy.Tech manages source code, Netlify hosting, deployments, backups, and support.
- The application will use a dedicated `banikrynholec` Netlify project in the existing `kryon-dx` team.
- Client administrators use the application at `/admin`; they do not need Netlify access.
- Calendar data can be edited manually in the admin area or imported/exported through the prepared Excel template.
- WEDOS DNS remains unchanged until launch readiness is confirmed.
- First-look deploys are manual from the local repository so design iteration does not consume Netlify build minutes on every push. Enable Git-based continuous deployment only when a branch is ready for review.

## Security

- Credentials, tokens, applicant data, and environment files never enter Git.
- Netlify and WEDOS credentials belong only in their provider interfaces or approved secret stores.
- Netlify MFA must be enabled before production launch.

## Asset Sources

- Club crest source: client-supplied PDF. The source PDF stays outside the repository.
- Venue photos: [Obec Rynholec - Sportovni areal](https://www.obecrynholec.cz/obec-rynholec/sportovni-areal/), supplied by the client as the current venue photo source.
- Adult-team photo supplied by Rudolf Sladek for the club website.
- Youth photos supplied by Matej Sima for the club website. The gallery identifies them only as youth photos because individual team labels and captions were not supplied.
- The club remains responsible for confirming publication permissions and youth-photo privacy requirements.

## Git Workflow

- `main` contains reviewed releases.
- Feature work is developed on focused branches and reviewed through deploy previews.
- Production deploys are reserved for reviewed releases; calendar/admin updates will not trigger builds.
