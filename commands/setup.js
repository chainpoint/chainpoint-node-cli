// Dependencies
const dotenv = require('dotenv')
const fs = require('fs')
const path = require('path')
const ora = require('ora')
const os = require('os')
const shell = require('shelljs')

// Utils
const config = require('../utils/config')

// Data
const LOCK_FILE = '/.chainpoint-installer-run'
const NODE_PATH = path.join(os.homedir(), 'chainpoint-node')

// Functions
function sudoBash(command) {
  return shell.exec(
    `sudo bash <<EOF
      set -e
      ${command}
    EOF`.replace(/^\s+/gm, ''),
    { shell: '/bin/bash' }
  )
}

function bashSpinner(spinner, { code }, message) {
  if (code !== 0) {
    spinner.fail(`${message} failed`)
    process.exit(1)
  }

  spinner.succeed(`${message} succeeded`)
}

// Command
module.exports = {
  command: 'setup',
  describe: 'Set up a Chainpoint node',
  builder: {
    swap: {
      description: 'Swap size to create',
      type: 'string',
      default: '2G'
    },
    'lock-file': {
      description: 'Check and create a lock file (advanced)',
      type: 'boolean',
      default: true
    },
    'check-os': {
      description: 'Check if the current OS is compatible (advanced)',
      type: 'boolean',
      default: true
    },
    'install-docker': {
      description: 'Install Docker (advanced)',
      type: 'boolean',
      default: true
    },
    'install-docker-compose': {
      description: 'Install Docker Compose (advanced)',
      type: 'boolean',
      default: true
    },
    'clone-git': {
      description: 'Clone git repository (advanced)',
      type: 'boolean',
      default: true
    }
  },

  async handler(argv) {
    const spinner = ora('Setting up chainpoint node').start()

    // Check if the OS is Linux
    if (os.platform() !== 'linux') {
      spinner.fail('This command only works on Linux.')
      process.exit(1)
    }

    // Don't run this script more than once!
    if (argv.lockFile && fs.existsSync(LOCK_FILE)) {
      spinner.fail('Looks like this script has already been run. Exiting!')
      process.exit(0)
    }

    // Make sure we're running on Ubuntu 16.04 (Xenial)
    if (argv.checkOs) {
      spinner.start('Checking if operating system is compatible')

      const osRelease = dotenv.parse(fs.readFileSync('/etc/os-release'))

      if (osRelease.NAME !== 'Ubuntu') {
        spinner.fail(
          'Looks like you are not running this on an Ubuntu OS. Exiting!'
        )
        process.exit(1)
      }

      if (osRelease.UBUNTU_CODENAME !== 'xenial') {
        spinner.fail(
          'Looks like you are not running this on Ubuntu version 16.04 (Xenial). Exiting!'
        )
        process.exit(1)
      }

      spinner.info('Operating system checks succeeded')
    } else {
      spinner.warn(
        'You might be running this command on an unsupported operating system'
      )
    }

    // Install Docker
    if (argv.installDocker) {
      spinner.start('Installing Docker')

      const command = sudoBash(`
        # Install Docker
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
        add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
        apt update
        apt-cache policy docker-ce
        apt install -y docker-ce make

        # Add current user to docker group
        usermod -aG docker $USER
      `)

      bashSpinner(spinner, command, 'Docker installation')
    }

    // Install Docker Compose
    if (argv.installDockerCompose) {
      spinner.start('Installing Docker Compose')

      const command = sudoBash(`
        mkdir -p /usr/local/bin
        curl -s -L "https://github.com/docker/compose/releases/download/${
          config.setup.dockerCompose.version
        }/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
      `)

      bashSpinner(spinner, command, 'Docker Compose installation')
    }

    // Clone git repository
    if (argv.cloneGit) {
      spinner.start('Cloning git repository')

      if (fs.existsSync(NODE_PATH)) {
        spinner.warn('Git repository already exists, skipping...')
      } else {
        const command = sudoBash(
          `git clone -b master https://github.com/chainpoint/chainpoint-node ${NODE_PATH}`
        )

        bashSpinner(spinner, command, 'Git repository clone')
      }
    }

    // Create swap
    if (argv.swap) {
      spinner.start('Create a swap file')

      if (sudoBash("free | awk '/^Swap:/ {exit 1}'").code !== 0) {
        spinner.info('You already have a swap file, skipping...')
      } else {
        const command = sudoBash(`
          fallocate -l ${argv.swap} /swapfile
          chmod 600 /swapfile
          mkswap /swapfile
          swapon /swapfile
          echo '/swapfile none swap sw 0 0' >> /etc/fstab
          echo 'vm.swappiness=10' >> /etc/sysctl.conf
          echo 'vm.vfs_cache_pressure=50' >> /etc/sysctl.conf
          sysctl -p
        `)

        bashSpinner(spinner, command, 'Swap file creation')
      }
    }

    // Create lock file
    if (argv.lockFile) {
      sudoBash(`touch ${LOCK_FILE}`)
    }
  }
}
