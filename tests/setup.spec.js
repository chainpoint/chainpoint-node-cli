/* global describe, it */

// Dependencies
const chai = require('chai')
const childProcess = require('child_process')
const fs = require('fs')
const util = require('util')

const execFile = util.promisify(childProcess.execFile)

// Chai
const should = chai.should()

// Utils
const { LOCK_FILE, NODE_PATH } = require('./lib/config')
const { showDebug, spawnCommand } = require('./lib/utils')

// Tests
describe('setup', () => {
  it('should work for simple Travis test', async function() {
    // Only run this test on Travis (it has side effects on the system)
    if (process.env.TRAVIS !== 'true') {
      this.skip()
      return
    }

    // Disabled flags:
    // --no-swap: doesn't work on Travis
    // --no-check-os: Travis is on Ubuntu 14.04
    try {
      const command = spawnCommand(['setup', '--no-swap', '--no-check-os'], {
        cwd: process.env.TRAVIS_BUILD_DIR
      })

      if (showDebug('test:setup')) {
        command.stdout.pipe(process.stdout)
        command.stderr.pipe(process.stderr)
      }

      await new Promise((resolve, reject) => {
        command.on('close', code => {
          if (code !== 0) {
            reject(new Error(`Exited with code ${code}`))
            return
          }

          resolve()
        })
      })
    } catch (err) {
      should.not.exist(err)
    }

    // Check that the git repository and the lock file both exist
    fs.existsSync(NODE_PATH).should.be.true
    fs.existsSync(LOCK_FILE).should.be.true

    // Check if Docker is available
    try {
      await execFile('which', ['docker'])
    } catch (err) {
      should.not.exist(err)
    }

    // Check that Docker Compose is available and
    // that the git repository was cloned successfully
    let command
    try {
      command = await execFile('docker-compose', ['config'], {
        cwd: NODE_PATH
      })
    } catch (err) {
      should.not.exist(err)
    }

    ;/container_name: chainpoint-node/g.test(command.stdout).should.be.true
  }).timeout(600000)
})
