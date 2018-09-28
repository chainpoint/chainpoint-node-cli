// Dependencies
const yargs = require('yargs')

// Commands
const config = require('./commands/config')
const setup = require('./commands/setup')

// Script
yargs
  .usage('Usage: chp-node <command> [options]')
  .command(config)
  .command(setup)
  .help()
  .alias('h', 'help')
  .demandCommand()
  .strict().argv
