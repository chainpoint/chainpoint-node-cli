// Dependencies
const childProcess = require('child_process')
const dotenv = require('dotenv')
const fs = require('fs')
const util = require('util')
const { constantCase, paramCase } = require('change-case')

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

function getCommandParams(type, config) {
  const args = ['config', '--no-prompt']
  const options = { env: process.env }
  const envKeys = {
    tntAddr: 'CHAINPOINT_NODE_TNT_ADDRESS',
    password: 'CHAINPOINT_NODE_UI_PASSWORD'
  }

  switch (type) {
    case 'flags':
      for (let key in config) {
        args.push(`--${paramCase(key)}`)
        args.push(config[key])
      }
      break

    case 'env':
      args.push('--env')
      for (let key in config) {
        const envKey = envKeys[key] || `CHAINPOINT_NODE_${constantCase(key)}`
        options.env = {
          ...options.env,
          [envKey]: config[key]
        }
      }
      break
  }

  return [args, options]
}

// Exports
module.exports = {
  readEnv,
  execCommand: command.bind(null, execFile),
  spawnCommand: command.bind(null, spawn),
  showDebug,
  getCommandParams
}
