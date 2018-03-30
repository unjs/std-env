const isCI = require('is-ci')

const env = {
  test: Boolean(process.env.NODE_ENV === 'test'),
  dev: Boolean(process.env.NODE_ENV === 'dev'),
  production: Boolean(process.env.NODE_ENV === 'production'),
  ci: Boolean(isCI),
  tty: Boolean(process.stdout.isTTY),
  minimalCLI: undefined
}

env.minimalCLI = env.ci || env.test || env.producion || !env.tty

module.exports = env
