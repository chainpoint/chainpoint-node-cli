// Dependencies
const fs = require('fs')
const path = require('path')
const yargs = require('yargs')

// Utils
const { error } = require('./utils/terminal')

// Commands
const config = require('./commands/config')
const setup = require('./commands/setup')

// Basic test to check if the current working directory is a Chainpoint node
if (!fs.existsSync(path.join(process.cwd(), 'keys'))) {
  error('The current working directory is not a Chainpoint node', 1)
}

// Script
yargs
  .command(config)
  .command(setup)
  .help()
  .alias('h', 'help')
  .demandCommand()
  .strict().argv
