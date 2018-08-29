// Dependencies
const path = require('path')

// Exports
module.exports = {
  ENV_PATH: path.join(process.cwd(), '.env'),
  KEYS_PATH: path.join(process.cwd(), 'keys')
}
