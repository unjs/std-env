// Gather initial information
var isCI = false
var debug = false
var tty = false
var nodeENV = 'development'
var browser = typeof window !== 'undefined'
var platform = ''

// Process dependent fields
if (typeof process !== 'undefined') {
  if (process.platform) {
    platform = String(process.platform)
  }

  if (process.env) {
    // isCI
    isCI = Boolean(require('ci-info').isCI)

    // NODE_ENV
    if (process.env.NODE_ENV) {
      nodeENV = String(process.env.NODE_ENV)
    }

    // DEBUG
    if (process.DEBUG) {
      debug = Boolean(process.env.DEBUG)
    }

    // TTY
    if (process.stdout) {
      tty = Boolean(process.stdout.isTTY)
    }
  }
}

// Construct env object
var env = {
  browser: browser,

  test: nodeENV === 'test',
  dev: nodeENV === 'development' || nodeENV === 'dev',
  production: nodeENV === 'production',
  debug: debug,

  ci: isCI,
  tty: tty,

  minimalCLI: undefined,

  windows: /^win/i.test(platform),
  darwin: /^darwin/i.test(platform),
  linux: /^linux/i.test(platform),
}

// Compute minimalCLI
env.minimalCLI = env.ci || env.test || !env.tty

// Export env
module.exports = Object.freeze(env)
