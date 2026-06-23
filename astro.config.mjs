import react from "@astrojs/react";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://banikrynholec.cz",
  output: "static",
  devToolbar: { enabled: false },
  integrations: [react()],
});
