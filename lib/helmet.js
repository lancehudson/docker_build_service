'use strict';

// Module dependencies.
var helmet = require('koa-helmet');

module.exports = function(app) {
  app.use(helmet.xssFilter());
  app.use(helmet.frameguard('deny'));
  app.use(helmet.hidePoweredBy());
  app.use(helmet.ieNoOpen());
  app.use(helmet.noSniff());
  app.use(helmet.hsts());
  app.use(helmet.contentSecurityPolicy({
    defaultSrc: ['\'self\''],
    reportUri: '/report-csp-violation',
  }));
};
