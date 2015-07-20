'use strict';

// Module dependencies.
var responseTime = require('koa-response-time');
var ratelimit = require('koa-better-ratelimit');
var compress = require('koa-compress');
var logger = require('koa-logger');
var load = require('./lib/load');
var koa = require('koa');
var koaJsonApiHeaders = require('koa-jsonapi-headers');
var bodyParser = require('koa-body');
var helmet = require('./lib/helmet');
var mask = require('koa-json-mask');
var conditional = require('koa-conditional-get');
var etag = require('koa-etag');
var errorHandler = require('./lib/errorHandler');
var catchJsonApiErrors = require('./lib/catchJsonApiErrors');
var mount = require('koa-mount');

// Config
var config = require ('./api/config');

// Environment.
var env = process.env.NODE_ENV || 'development';

// Expose `application()`.
module.exports = application;

/**
 * Initialize an app with the given `opts`.
 *
 * @param {Object} opts
 * @return {Application}
 * @api public
 */
function application(opts) {
  opts = opts || {};
  var app = koa();

  // Setup Logging
  if ('test' !== env) {
    app.use(logger());
  }

  // Setup Headers
  headers(app, opts);

  // Setup Parsers
  app.use(bodyParser());
  app.use(mask());

  // Setup Compression
  app.use(compress());

  // Error Handling
  errorHandler(app);

  // Bootstrap API
  load(app, '/api/v1', __dirname + '/api');

  return app;
}

function headers(app, opts) {
  // Setup x-response-time
  app.use(responseTime());

  // Setup Security Headers
  helmet(app);

  // Setup etag
  app.use(conditional());
  app.use(etag());

  // Setup Rate Limiting
  app.use(ratelimit({
    max: opts.ratelimit,
    duration: opts.duration,
  }));

  // Enforce JSON Api
  app.use(mount('/api/v1', catchJsonApiErrors));
  app.use(mount('/api/v1', koaJsonApiHeaders(config.koaJsonApiHeaders)));
}
