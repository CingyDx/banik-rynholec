import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const astroPackageRoot = dirname(require.resolve("astro/package.json"));
const astroCli = join(astroPackageRoot, "bin", "astro.mjs");

const child = spawn(process.execPath, [astroCli, "dev", "--host", "127.0.0.1"], {
  env: {
    ...process.env,
    ASTRO_DEV_BACKGROUND: "0",
  },
  stdio: "inherit",
});

function stop(signal) {
  if (!child.killed) {
    child.kill(signal);
  }
}

process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
