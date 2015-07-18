
/**
 * Module dependencies.
 */

var responseTime = require('koa-response-time');
var ratelimit = require('koa-ratelimit');
var compress = require('koa-compress');
var logger = require('koa-logger');
var Router = require('koa-router');
var load = require('./lib/load');
var redis = require('redis');
var koa = require('koa');
var koaJsonApiHeaders = require('koa-jsonapi-headers');
var bodyParser = require('koa-bodyparser');

/**
 * Environment.
 */

var env = process.env.NODE_ENV || 'development';

/**
 * Expose `api()`.
 */

module.exports = api;

/**
 * Initialize an app with the given `opts`.
 *
 * @param {Object} opts
 * @return {Application}
 * @api public
 */

function api(opts) {
  opts = opts || {};
  var app = koa();
  var router = new Router(opts);

  // logging

  if ('test' != env) app.use(logger());

  // x-response-time

  app.use(responseTime());

  // rate limiting

  app.use(ratelimit({
    max: opts.ratelimit,
    duration: opts.duration,
    db: redis.createClient()
  }));

  // json api
  app.use(function *catchJsonApiErrors(next) {
    try {
      yield next;
    }
    catch (err) {

      // Response properties
      this.status = err.status || 500;
      this.body = err.message;
      this.response.type = 'application/vnd.api+json';
    }
  });
  app.use(koaJsonApiHeaders({excludeList: [
    '/github'
  ]}));

  // parsers
  app.use(bodyParser());

  // compression

  app.use(compress());

  // routing
  app
    .use(router.routes())
    .use(router.allowedMethods());

  // boot
  load(app, router, __dirname + '/api');

  return app;
}
