type NetlifyEnvApi = {
  env?: {
    get(name: string): string | undefined;
  };
};

type ProcessLike = {
  env?: Record<string, string | undefined>;
};

export function getEnv(name: string): string | undefined {
  const globals = globalThis as typeof globalThis & { Netlify?: NetlifyEnvApi; process?: ProcessLike };
  return globals.Netlify?.env?.get(name) ?? globals.process?.env?.[name];
}

export function getRequiredEnv(name: string): string {
  const value = getEnv(name);
  if (!value) {
    throw new Error(`Missing required environment variable ${name}.`);
  }
  return value;
}
