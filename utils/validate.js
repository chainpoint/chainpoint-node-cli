// Dependencies
const ip = require('ip')
const url = require('url')
const { isIPv4 } = require('net')

// Functions
function validateETHAddress(address) {
  if (!/^0x[0-9a-fA-F]{40}$/i.test(address)) {
    throw new Error('The Ethereum (TNT) address is invalid')
  }

  return address.toLowerCase()
}

function validatePassword(password) {
  // 'false' is matched by the regex too
  if (password && !/^[a-zA-Z0-9]*$/.test(password)) {
    throw new Error('The password should only contain alphanumeric characters')
  }

  return password
}

function validatePublicUri(uri) {
  if (!uri) {
    return
  }

  const parsedUri = url.parse(uri)
  const error = new Error(
    'The public URI must only contain "http://" followed by an IP address'
  )
  const nullFields = ['auth', 'port', 'hash', 'search', 'query']

  if (
    parsedUri.protocol !== 'http:' ||
    parsedUri.path !== '/' ||
    !isIPv4(parsedUri.hostname)
  ) {
    throw error
  }

  for (let field of nullFields) {
    if (parsedUri[field] !== null) {
      throw error
    }
  }

  if (ip.isPrivate(parsedUri.hostname)) {
    throw new Error('The public URI must not be a private IP')
  }

  if (parsedUri.hostname === '0.0.0.0') {
    throw new Error('The public URI cannot be 0.0.0.0')
  }

  return uri
}

function validateHMAC(hmac) {
  if (hmac && !/^[0-9a-fA-F]{64}$/i.test(hmac)) {
    throw new Error('The auth key is incorrect')
  }

  return hmac
}

// Exports
module.exports = {
  validateETHAddress,
  validatePassword,
  validatePublicUri,
  validateHMAC
}
