// Dependencies
const childProcess = require('child_process')
const dotenv = require('dotenv')
const fs = require('fs')
const util = require('util')

const execFile = util.promisify(childProcess.execFile)
const { spawn } = childProcess

// Utils
const { ENV_PATH } = require('./config')

// Functions
function readEnv() {
  return dotenv.parse(fs.readFileSync(ENV_PATH))
}

function command(type, args, options) {
  return type('node', ['index.js', ...args], options)
}

function showDebug(name) {
  return (process.env.DEBUG || '').split(' ').includes(name)
}

// Exports
module.exports = {
  readEnv,
  execCommand: command.bind(null, execFile),
  spawnCommand: command.bind(null, spawn),
  showDebug
}
