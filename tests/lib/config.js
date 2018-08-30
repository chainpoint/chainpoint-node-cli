// Dependencies
const path = require('path')
const os = require('os')

// Exports
module.exports = {
  ENV_PATH: path.join(process.cwd(), '.env'),
  KEYS_PATH: path.join(process.cwd(), 'keys'),
  NODE_PATH: path.join(os.homedir(), 'chainpoint-node'),
  LOCK_FILE: '/.chainpoint-installer-run',

  // Standard testing data
  TNT_ADDR: '0x08f5a9235b08173b7569f83645d2c7fb55e8ccd8',
  PUBLIC_URI: 'http://1.2.3.4',
  AUTH_KEY: new Array(65).join('0')
}
