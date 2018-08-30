// Dependencies
const fs = require('fs')
const path = require('path')
const rp = require('request-promise-native')
const { prompt } = require('inquirer')
const { EOL } = require('os')

// Utils
const { error, info, success } = require('../utils/terminal')
const {
  validateETHAddress,
  validatePublicUri,
  validateHMAC
} = require('../utils/validate')

// Functions
function inquirerValidate(validator) {
  return input => {
    try {
      validator(input)
      return true
    } catch (err) {
      return err
    }
  }
}

async function findIP() {
  return `http://${(await rp('https://icanhazip.com/')).trim()}`
}

// Command
module.exports = {
  command: 'config',
  describe: 'Configure a Chainpoint node',
  builder: {
    'tnt-addr': {
      description: 'TNT address',
      type: 'string'
    },
    'public-uri': {
      description: 'Public URI',
      type: 'string',
      default: 'automatic'
    },
    'auth-key': {
      description: 'Authentication key',
      type: 'string'
    },
    prompt: {
      description: 'Prompt in case of missing configuration',
      type: 'boolean',
      default: true
    }
  },

  async handler(argv) {
    let publicUriDefault
    if (argv.publicUri === 'automatic') {
      delete argv.publicUri
      publicUriDefault = await findIP()
    }

    const config = {}
    const fields = {
      tntAddr: {
        message: 'Ethereum (TNT) address:',
        validate: validateETHAddress,
        code: 100
      },
      publicUri: {
        message: 'Public URI (leave empty for private nodes):',
        validate: validatePublicUri,
        skip: argv.privateNode,
        code: 101,
        default: publicUriDefault
      },
      authKey: {
        message: 'Auth key (leave empty for new nodes):',
        validate: validateHMAC,
        code: 102
      }
    }

    for (let key in fields) {
      if (!argv[key] && argv.prompt) {
        const { answer } = await prompt({
          name: 'answer',
          message: fields[key].message,
          default: fields[key].default,
          validate: inquirerValidate(fields[key].validate)
        })
        argv[key] = answer
      }

      try {
        config[key] = fields[key].validate(argv[key])
      } catch (err) {
        error(err, fields[key].code)
      }
    }

    const env = [
      `NODE_TNT_ADDRESS=${config.tntAddr}`,
      config.publicUri && `CHAINPOINT_NODE_PUBLIC_URI=${config.publicUri}`
    ]
      .filter(line => !!line)
      .join(EOL)
      .concat(EOL)

    try {
      fs.writeFileSync(path.join(process.cwd(), '.env'), env)
      info('Wrote .env file')
    } catch (err) {
      error(`Could not write .env file: ${err.message}`, 11)
      return
    }

    if (config.authKey) {
      try {
        fs.writeFileSync(
          path.join(process.cwd(), 'keys', `${config.tntAddr}.key`),
          config.authKey + EOL
        )
        info('Wrote auth key')
      } catch (err) {
        error(`Could not write auth key: ${err.message}`, 11)
        return
      }
    }

    success('Done!')
  }
}
