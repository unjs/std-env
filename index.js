const isCI = require('is-ci')

const { DEBUG, NODE_ENV = 'development' } = process.env

const env = {
  test: NODE_ENV === 'test',
  dev: NODE_ENV === 'development' || NODE_ENV === 'dev',
  production: NODE_ENV === 'production',
  debug: Boolean(DEBUG),
  ci: Boolean(isCI),
  tty: Boolean(process.stdout.isTTY),
  minimalCLI: undefined,
  windows: /^win/.test(process.platform)
}

env.minimalCLI = env.ci || env.test || env.producion || !env.tty

module.exports = env
