# Chainpoint Node CLI

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Build Status](https://travis-ci.org/filoozom/chainpoint-node-cli.svg?branch=master)](https://travis-ci.org/filoozom/chainpoint-node-cli)

## About

This CLI can be used to make node management easier.

## Commands

This CLI contains detailed information about all command line arguments, simply by using the `-h` command line argument.

### Config

The following command will ask you a few questions, like your TNT address, public URI and auth key and will then automatically create all configuration files for you:

```
$ ./chp-node config
```

You can also use a few different command line arguments to automate the process. More information can be found using the `-h` argument.

### Setup

The `setup` command is used to install a Chainpoint node. It uses `sudo` and will alter your system. It will install dependencies such as Docker and Docker Compose and create a swap file. The command can be ran without arguments, but can also be configured to best suit your use case:

```
$ ./chp-node setup
```
