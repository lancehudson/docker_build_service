'use strict';

// Module dependencies.
var errorHandler = require('koa-errorhandler');
var jade = require('jade');

// Locals
var path = __dirname + '/error.jade';
var env = process.env.NODE_ENV || 'development';

module.exports = function(app) {
  app.use(errorHandler({
    json: jsonErrorHandler,
    html: htmlErrorHandler,
  }));
};

var jsonErrorHandler = function(err) {
  if (err.message.errors) {
    return { errors: err.message.errors };
  } else {
    return { errors: [{ code: err.name, title: err.message }] };
  }
};

var htmlErrorHandler = function(err) {
  return jade.renderFile(path, {
    env: env,
    ctx: this,
    request: this.request,
    response: this.response,
    name: err.name,
    error: err.message,
    stack: err.stack,
    status: this.status,
    code: err.code,
  });
};
