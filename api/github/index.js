'use strict';

// Module dependencies.
var debug = require('debug')('api:github');

/**
 * [events description]
 * @type {Object}
 */
var events = {
  /**
   * [description]
   * @return {[type]} [description]
   */
  ping: function* pingEventHandler() {
    debug('ping event');
    this.body = 'Ping Successful';
    this.type = 'text/plain';
  },
  /**
   * [description]
   * @return {[type]} [description]
   */
  push: function* pushEventHandler() {
    debug('push event');
    // TODO: Check if configured ref

    // Begin build pipeline
  },
};

/**
 * Verify Webhook and call the appropriate handler.
 * @api public
 */
var exec = function* exec() {
  // TODO: Verify Signature

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

// Expose exec
exports.exec = exec;
