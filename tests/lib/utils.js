// Dependencies
const childProcess = require('child_process')
const dotenv = require('dotenv')
const fs = require('fs')
const util = require('util')

const execFile = util.promisify(childProcess.execFile)

// Utils
const { ENV_PATH } = require('./config')

// Functions
function readEnv() {
  return dotenv.parse(fs.readFileSync(ENV_PATH))
}

async function runCommand(...args) {
  return execFile('node', ['index.js', ...args])
}

// Exports
module.exports = {
  readEnv,
  runCommand
}
