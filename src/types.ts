export interface EnvInfo {
  /** Detect if global `window` object is available */
  browser: boolean
  /** Detect if `NODE_ENV` environment variable is `test` */
  test: boolean
  /** Detect if `NODE_ENV` environment variable is `dev` or `development` */
  dev: boolean
  /** Detect if `NODE_ENV` environment variable is `production` */
  production: boolean
  /** Detect if `DEBUG` environment variable is set */
  debug: boolean
  /** Detect if a well-known CI is detected */
  ci: boolean
  /** Detect if TTY is available */
  tty: boolean
  /** Detect if MINIMAL environment variable is set, running in CI or test or TTY is unavailable */
  minimal: boolean
  /** Detect if process.platform is windows */
  windows: boolean
  /** Detect if process.platform is darwin (MacOS) */
  darwin: boolean
  /** Detect if process.platform is linux */
  linux: boolean
}
