'use strict';

let path           = require('path');
let extend         = require('util')._extend;
let bunyan         = require('bunyan');
let uuid           = require('uuid');
let redis          = require('redis');
let RedisTransport = require('bunyan-redis');

function reqSerializer(ctx) {
  return {
    url: ctx.url,
    headers: ctx.request.header,
    method: ctx.method,
    ip: ctx.ip,
    protocol: ctx.protocol,
    originalUrl: ctx.originalUrl,
    query: ctx.query
  };
}

function resSerializer(ctx) {
  return {
    statusCode: ctx.status,
    responseTime: ctx.responseTime,
    headers: ctx.response.header
  };
}

function uidSerializer (uuid) {
  return uuid;
}

let configDefaults = {
  name: 'app',
  redis: false,
  redisKey: "logstash",
  redisPort: 6379,
  redisPassword: null,
  redisDb: 0,
  console: true,
  jsonapi: false,
  isJsonApi: function () {
    return this.jsonapi;
  }
};

module.exports = function koaLogger(opts) {

  opts = opts || {};

  let config = extend(configDefaults, opts);
  let redisTransport = false;

  let streams = [];
  if (config.console) {
    streams.push({
      level: 'info',
      stream: process.stdout
    });
  }

  if (config.redis) {
    redisTransport = new RedisTransport({
      container: config.redisKey,
      host: config.redis,
      port: config.redisPort,
      password: config.redisPassword,
      db: config.redisDb
    });
    streams.push({
      type: 'raw',
      level: 'info',
      stream: redisTransport
    });
  }

  // Standard Logger
  var outLogger = bunyan.createLogger({

    name: config.name,

    serializers: {
      req: reqSerializer,
      res: resSerializer
    },

    streams: streams
  });

  if (config.console) {
    streams.push({
      level: 'error',
      stream: process.stdout
    });
  }

  if (config.redis) {
    streams.push({
      type: 'raw',
      level: 'error',
      stream: redisTransport
    });
  }

  // Error Logger
  var errLogger = bunyan.createLogger({

    name: config.name,

    serializers: {
      uid: uidSerializer,
      req: reqSerializer,
      res: resSerializer,
      err: bunyan.stdSerializers.err
    },

    streams: streams
  });

  return function *logger(next) {

    var ctx = this,
      start = new Date();

    ctx.uuid = uuid.v4();

    // If logging for a JSON API set the response Content-type before logging is done so the header  is correctly logged
    if (config.isJsonApi()) {
      ctx.response.type = 'application/vnd.api+json';
    }

    try {
      yield next;

      ctx.responseTime = new Date() - start;

      outLogger.info({uid: ctx.uuid, req: ctx, res: ctx});
    }
    catch (err) {

      // Response properties
      ctx.status = err.status || 500;
      ctx.responseTime = new Date() - start;

      // log error message and stack trace
      errLogger.error({uid: ctx.uuid, req: ctx, res: ctx, err: err});

      // Handle 500 errors - do not leak internal server error message to the user.
      // Standard error response message for user
      if (ctx.status === 500) {
        (config.isJsonApi()) ? ctx.body = {status: 500, title: 'Internal Server Error'} : ctx.body = 'Internal Server Error';
      }
      else {
        ctx.body = err.message;
      }
    }

    /*
    Currently - if a nested object is thrown the Content-type is set to 'application/json'
    Example:
    this.throw(401, {
      message: {
        status: 401,
        title: 'Unauthorized',
        detail: 'No Authorization header found'
      }
    })
    If JSON API is enabled to work around this we need to set the response Content-type again
    */
    if (config.isJsonApi()) {
      ctx.response.type = 'application/vnd.api+json';
    }

  };

};
