import { expect, it, describe } from 'vitest'
import * as stdEnv from '../src'

describe('std-env', () => {
  it('has all exports (dummy)', () => {
    expect(Object.keys(stdEnv)).toMatchInlineSnapshot(`
      [
        "platform",
        "provider",
        "isCI",
        "hasTTY",
        "hasWindow",
        "isDebug",
        "isTest",
        "isProduction",
        "isDevelopment",
        "isMinimal",
        "isWindows",
        "isLinux",
        "isMacOS",
      ]
    `)
  })
})
