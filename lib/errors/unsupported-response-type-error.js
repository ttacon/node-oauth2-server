'use strict';

/**
 * Module dependencies.
 */

const OAuthError = require('./oauth-error');
const util = require('util');

/**
 * Constructor.
 *
 * "The authorization server does not supported obtaining an
 * authorization code using this method."
 *
 * @see https://tools.ietf.org/html/rfc6749#section-4.1.2.1
 */

function UnsupportedResponseTypeError(message, properties) {
  properties = Object.assign({
    code: 400,
    name: 'unsupported_response_type'
  }, properties);

  OAuthError.call(this, message, properties);
}

/**
 * Inherit prototype.
 */

util.inherits(UnsupportedResponseTypeError, OAuthError);

/**
 * Export constructor.
 */

module.exports = UnsupportedResponseTypeError;
