'use strict';

// Module dependencies.
var debug = require('debug')('api:github');
var scmp = require('scmp');
var crypto = require('crypto');

// TODO get this from db based on url
var key = '111';

/**
 * Event handlers
 * @type {Object}
 */
var events = {
  /**
   * Ping Event Handler
   */
  ping: function* pingEventHandler() {
    debug('ping event');
    this.body = 'Ping Successful';
    this.type = 'text/plain';
  },
  /**
   * Push Event Handler
   */
  push: function* pushEventHandler() {
    debug('push event');

    this.body = 'Build Pending';
    this.type = 'text/plain';
    this.status = 202;


    // TODO: Check if configured ref

    // Begin build pipeline
  },
};

/**
 * Verify Webhook and call the appropriate handler.
 * @api public
 */
var exec = function* exec() {
  // JSON Only
  this.assert(this.is('json'), 400, 'API requires header "Content-Type" ' +
    'set to "application.json"');

  // Verify Signature
  if (!verifySignature.call(this)) {
    this.throw('bad_signature', 400, {
      message: {
        errors: [
          {
            code: 'bad_signature',
            title: 'API requires header "X-Hub-Signature" ' +
              'to be set to a valid signature.',
          },
        ],
      },
    });
  }

  // Get Event Type
  var event = this.request.header['x-github-event'];

  // Check if a handler exists and call it or error
  if (event && events[event]) {
    debug('delegating to event', event);
    yield events[event].call(this);
  } else {
    debug('unsupported event', event);
    this.throw('invalid_request', 400, {
      message: {
        errors: [
          {
            code: 'invalid_request',
            title: 'API requires header "X-Github-Event" ' +
              'to be set to a supported event type.',
          },
        ],
      },
    });
  }
};

var verifySignature = function() {
  var rawSignature = this.request.header['x-hub-signature'];
  if (rawSignature) {
    var signatureParts = this.request.header['x-hub-signature'].split('=');
    var algorithm = signatureParts[0];
    var signature = signatureParts[1];

    if (signature) {
      var hmac = crypto.createHmac(algorithm, key);
      hmac.update(JSON.stringify(this.request.body));
      var digest = hmac.digest('hex');
      if (scmp(digest, signature)) {
        return true;
      } else {
        return false;
      }
    }
  }

  return true;
};

// Expose exec
exports.exec = exec;
