// Gather initial information
let isCI = false
let debug = false
let tty = false
let nodeENV = 'development'
let browser = typeof window !== 'undefined'
let platform = ''
let minimal = false

// Boolean helper
function toBoolean(val) {
  return (!val || val === 'false') ? false : true
}

// Process dependent
if (typeof process !== 'undefined') {
  // Platform
  if (process.platform) {
    platform = String(process.platform)
  }

  // TTY
  if (process.stdout) {
    tty = toBoolean(process.stdout.isTTY)
  }

  // Is CI
  isCI = Boolean(require('ci-info').isCI)

  // Env dependent
  if (process.env) {
    // NODE_ENV
    if (process.env.NODE_ENV) {
      nodeENV = process.env.NODE_ENV
    }

    // DEBUG
    debug = toBoolean(process.env.DEBUG)

    // MINIMAL
    minimal = toBoolean(process.env.MINIMAL)
  }
}

// Construct env object
const env = {
  browser: browser,

  test: nodeENV === 'test',
  dev: nodeENV === 'development' || nodeENV === 'dev',
  production: nodeENV === 'production',
  debug: debug,

  ci: isCI,
  tty: tty,

  minimal: undefined,
  minimalCLI: undefined,

  windows: /^win/i.test(platform),
  darwin: /^darwin/i.test(platform),
  linux: /^linux/i.test(platform),
}

// Compute minimal
env.minimal = minimal || env.ci || env.test || !env.tty
env.minimalCLI = env.minimal

// Export env
export default Object.freeze(env)
