/* global afterEach, beforeEach, describe, it */

// Dependencies
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const fs = require('fs-extra')
const path = require('path')

// Chai
const should = chai.should()
chai.use(chaiAsPromised)

// Utils
const {
  AUTH_KEY,
  ENV_PATH,
  KEYS_PATH,
  PUBLIC_URI,
  TNT_ADDR
} = require('./lib/config')
const { readEnv, runCommand } = require('./lib/utils')

// Hooks
beforeEach(() => fs.mkdirp(KEYS_PATH))
afterEach(() => Promise.all([fs.remove(KEYS_PATH), fs.remove(ENV_PATH)]))

// Tests
describe('config', () => {
  describe('validate', () => {
    describe('TNT address (code 100)', () => {
      function checkIncorrectTntAddress(message, address) {
        it(message, async () => {
          try {
            await runCommand('config', '--no-prompt', '--tnt-addr', address)
          } catch (err) {
            err.code.should.equal(100)
            return
          }

          throw new Error('Should have thrown an error')
        })
      }

      checkIncorrectTntAddress('should exit if it is empty', '')
      checkIncorrectTntAddress('should exit if it is too short', '0x')
      checkIncorrectTntAddress(
        'should exit if it it contain non-alphanumeric characters',
        `0x${new Array(41).join('z')}`
      )
    })

    describe('public URI (code 101)', () => {
      function checkIncorrectPublicUri(message, uri) {
        it(message, async () => {
          try {
            await runCommand(
              'config',
              '--no-prompt',
              '--tnt-addr',
              TNT_ADDR,
              '--public-uri',
              uri
            )
          } catch (err) {
            err.code.should.equal(101)
            return
          }

          throw new Error('Should have thrown an error')
        })
      }

      checkIncorrectPublicUri(
        'should exit if it is just an IP address',
        '1.2.3.4'
      )
      checkIncorrectPublicUri(
        'should exit if it is http://0.0.0.0',
        'http://0.0.0.0'
      )
      checkIncorrectPublicUri(
        'should exit if it has a path',
        'http://1.2.3.4/path'
      )
      checkIncorrectPublicUri(
        'should exit if it has a port',
        'http://1.2.3.4:81'
      )
    })

    describe('auth key (code 102)', () => {
      function checkIncorrectAuthKey(message, key) {
        it(message, async () => {
          try {
            await runCommand(
              'config',
              '--no-prompt',
              '--tnt-addr',
              TNT_ADDR,
              '--auth-key',
              key
            )
          } catch (err) {
            err.code.should.equal(102)
            return
          }

          throw new Error('Should have thrown an error')
        })
      }

      checkIncorrectAuthKey('should exit if it is too short', '0')
      checkIncorrectAuthKey(
        'should exit if it it contain non-alphanumeric characters',
        new Array(65).join('z')
      )
    })
  })

  describe('success', () => {
    it('should create an .env file with only the TNT address', async () => {
      try {
        await runCommand('config', '--no-prompt', '--tnt-addr', TNT_ADDR)
      } catch (err) {
        should.not.exist(err)
      }

      readEnv().should.deep.equal({
        NODE_TNT_ADDRESS: TNT_ADDR
      })
    })

    it('should create an .env file with the TNT address and the public URI', async () => {
      try {
        await runCommand(
          'config',
          '--no-prompt',
          '--tnt-addr',
          TNT_ADDR,
          '--public-uri',
          PUBLIC_URI
        )
      } catch (err) {
        should.not.exist(err)
      }

      readEnv().should.deep.equal({
        NODE_TNT_ADDRESS: TNT_ADDR,
        CHAINPOINT_NODE_PUBLIC_URI: PUBLIC_URI
      })
    })

    it('should create an a file in the keys directory with the name of the TNT address', async () => {
      try {
        await runCommand(
          'config',
          '--no-prompt',
          '--tnt-addr',
          TNT_ADDR,
          '--auth-key',
          AUTH_KEY
        )
      } catch (err) {
        should.not.exist(err)
      }

      let authKey
      try {
        authKey = fs.readFileSync(
          path.join(KEYS_PATH, `${TNT_ADDR}.key`),
          'utf8'
        )
      } catch (err) {
        should.not.exist(err)
      }
      authKey.trim().should.equal(AUTH_KEY)
    })
  })
})
