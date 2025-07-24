type EnvObject = Record<string, string | undefined>;

declare global {
  var EdgeRuntime: undefined | unknown;
  var Netlify: undefined | unknown;
  var fastly: undefined | unknown;
  var Bun: undefined | unknown;

  var __env__: undefined | EnvObject;

  var Deno:
    | undefined
    | { env: { toObject(): EnvObject; [key: string]: unknown } };

  interface ImportMeta {
    env: EnvObject;
  }
}

export {};
