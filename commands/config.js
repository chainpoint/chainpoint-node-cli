// Dependencies
const fs = require('fs')
const path = require('path')
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
      type: 'string'
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
    const config = {}
    const fields = {
      tntAddr: {
        message: 'Ethereum (TNT) address:',
        validate: validateETHAddress
      },
      publicUri: {
        message: 'Public URI (leave empty for private nodes):',
        validate: validatePublicUri,
        skip: argv.privateNode
      },
      authKey: {
        message: 'Auth key (leave empty for new nodes):',
        validate: validateHMAC
      }
    }

    for (let key in fields) {
      if (!argv[key] && argv.prompt) {
        const { answer } = await prompt({
          name: 'answer',
          message: fields[key].message,
          validate: inquirerValidate(fields[key].validate)
        })
        argv[key] = answer
      }

      try {
        config[key] = fields[key].validate(argv[key])
      } catch (err) {
        error(err, 10)
      }
    }

    const env = [
      `NODE_TNT_ADDRESS=${config.tntAddr}`,
      config.publicUri && `CHAINPOINT_NODE_PUBLIC_URI=${config.publicUri}`
    ]
      .filter(line => !!line)
      .join(EOL)

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
          config.authKey
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
