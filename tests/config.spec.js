/* global afterEach, beforeEach, describe, it */

// Dependencies
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const fs = require('fs-extra')

// Chai
const should = chai.should()
chai.use(chaiAsPromised)

// Utils
const { KEYS_PATH } = require('./lib/config')
const { readEnv, runCommand } = require('./lib/utils')

// Hooks
beforeEach(() => fs.mkdirp(KEYS_PATH))
afterEach(() => fs.rmdir(KEYS_PATH))

// Tests
describe('config', () => {
  it('should exit with error code 10 if the TNT address is incorrect', async () => {
    try {
      await runCommand('config', '--no-prompt', '--tnt-addr', '0x')
    } catch (err) {
      err.code.should.equal(10)
      return
    }

    throw new Error('Should have thrown an error')
  })

  it('should create an .env file with only the TNT address', async () => {
    const tntAddr = '0x08f5a9235b08173b7569f83645d2c7fb55e8ccd8'

    try {
      await runCommand('config', '--no-prompt', '--tnt-addr', tntAddr)
    } catch (err) {
      should.not.exist(err)
    }

    readEnv().should.deep.equal({
      NODE_TNT_ADDRESS: tntAddr
    })
  })
})
