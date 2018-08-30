/* global describe, it */

// Dependencies
const chai = require('chai')

// Chai
const should = chai.should()

// Utils
const { runCommand } = require('./lib/utils')

// Tests
describe('setup', () => {
  it('should work for simple Travis test', async function() {
    if (process.env.TRAVIS !== 'true') {
      this.skip()
      return
    }

    try {
      await runCommand(
        ['setup', '--no-swap', '--no-check-os', '--no-install-docker'],
        {
          cwd: process.env.TRAVIS_BUILD_DIR
        }
      )
    } catch (err) {
      should.not.exist(err)
    }
  }).timeout(300000)
})
