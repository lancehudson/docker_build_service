'use strict';

// Module dependencies.
var os = require('os');
var path = require('path');

// Config
var allowedIps = require('./config').allowedIps;

/**
 * GET healthcheck results.
 */
exports.get = function* () {
  if (allowedIps.indexOf(this.request.ip) < 0) {
    this.throw('forbidden', 403);
  }

  this.body = {
    timestamp: Date.now(),
    uptime: process.uptime(),
    resources: {
      memory: process.memoryUsage(),
      loadavg: os.loadavg(),
    },
  };
};
