'use strict';

/**
 * Module dependencies.
 */

const AbstractGrantType = require('./abstract-grant-type');
const InvalidArgumentError = require('../errors/invalid-argument-error');
const InvalidGrantError = require('../errors/invalid-grant-error');
const InvalidRequestError = require('../errors/invalid-request-error');
const Promise = require('bluebird');
const promisify = require('promisify-any').use(Promise);
const isFormat = require('@node-oauth/formats');
const util = require('util');

/**
 * Constructor.
 */

function PasswordGrantType(options) {
  options = options || {};

  if (!options.model) {
    throw new InvalidArgumentError('Missing parameter: `model`');
  }

  if (!options.model.getUser) {
    throw new InvalidArgumentError('Invalid argument: model does not implement `getUser()`');
  }

  if (!options.model.saveToken) {
    throw new InvalidArgumentError('Invalid argument: model does not implement `saveToken()`');
  }

  AbstractGrantType.call(this, options);
}

/**
 * Inherit prototype.
 */

util.inherits(PasswordGrantType, AbstractGrantType);

/**
 * Retrieve the user from the model using a username/password combination.
 *
 * @see https://tools.ietf.org/html/rfc6749#section-4.3.2
 */

PasswordGrantType.prototype.handle = function(request, client) {
  if (!request) {
    throw new InvalidArgumentError('Missing parameter: `request`');
  }

  if (!client) {
    throw new InvalidArgumentError('Missing parameter: `client`');
  }

  const scope = this.getScope(request);

  return Promise.bind(this)
    .then(function() {
      return this.getUser(request);
    })
    .then(function(user) {
      return this.saveToken(user, client, scope);
    });
};

/**
 * Get user using a username/password combination.
 */

PasswordGrantType.prototype.getUser = function(request) {
  if (!request.body.username) {
    throw new InvalidRequestError('Missing parameter: `username`');
  }

  if (!request.body.password) {
    throw new InvalidRequestError('Missing parameter: `password`');
  }

  if (!isFormat.uchar(request.body.username)) {
    throw new InvalidRequestError('Invalid parameter: `username`');
  }

  if (!isFormat.uchar(request.body.password)) {
    throw new InvalidRequestError('Invalid parameter: `password`');
  }

  return promisify(this.model.getUser, 2).call(this.model, request.body.username, request.body.password)
    .then(function(user) {
      if (!user) {
        throw new InvalidGrantError('Invalid grant: user credentials are invalid');
      }

      return user;
    });
};

/**
 * Save token.
 */

PasswordGrantType.prototype.saveToken = function(user, client, requestedScope) {
  return Promise.bind(this)
    .then(function () {
      return this.validateScope(user, client,requestedScope);
    })
    .then(function(validatedScope) {
      return Promise.all([
        this.generateAccessToken(client, user, validatedScope),
        this.generateRefreshToken(client, user, validatedScope),
        this.getAccessTokenExpiresAt(),
        this.getRefreshTokenExpiresAt()
      ])
        .bind(this)
        .spread(function(accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt) {
          const token = {
            accessToken: accessToken,
            accessTokenExpiresAt: accessTokenExpiresAt,
            refreshToken: refreshToken,
            refreshTokenExpiresAt: refreshTokenExpiresAt,
            scope: validatedScope
          };

          return promisify(this.model.saveToken, 3).call(this.model, token, client, user);
        });
    });
};

/**
 * Export constructor.
 */

module.exports = PasswordGrantType;
