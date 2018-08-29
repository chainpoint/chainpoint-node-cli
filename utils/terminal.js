// Dependencies
const chalk = require('chalk')
const logSymbols = require('log-symbols')

// Functions
function write(symbol, color, message, error, code) {
  const text = error.message || error
  const write = [
    logSymbols[symbol],
    color && message ? chalk[color](` ${message} `) : ' ',
    text
  ]
    .filter(element => !!element)
    .join('')

  process.stderr.write(write + '\n')

  if (code) {
    process.exit(code)
  }
}

function trim(string) {
  return string.trim().replace(/^\t+/gm, '')
}

module.exports = {
  trim,
  info: write.bind(null, 'info', 'blue', 'INFO'),
  warn: write.bind(null, 'warning', 'yellow', 'WARNING'),
  error: write.bind(null, 'error', 'red', 'ERROR'),
  success: write.bind(null, 'success', null, null)
}
