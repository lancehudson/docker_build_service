'use strict';

let koa           = require('koa');
let responseTime  = require('koa-response-time-precise');
let ratelimit     = require('koa-better-ratelimit');
let router        = require('koa-router')();
let serve         = require('koa-static');
let etag          = require('koa-etag');
let fresh         = require('koa-fresh');
let path          = require('path');
let mount         = require('koa-mount');
let helmet        = require('koa-helmet');
let error         = require('koa-error');
let render        = require('koa-ejs');
let session       = require('koa-session');
let extend        = require('lodash').merge;


let logger        = require('./lib/logger.js');
let github        = require('./lib/github.js');

let ROOT_PATH = path.resolve(__dirname);
let APP_PATH = process.env.NODE_ENV === 'production' ? path.resolve(ROOT_PATH, '../../app/dist') : path.resolve(ROOT_PATH, '../../app/build');
let app = koa();

let config = require('./config.json');
if (process.env.CONFIG) {
  config = extend({}, config, require(process.env.CONFIG));
}

if (!config.github.clientID || !config.github.clientSecret) {
  throw new Error("Missing GitHub OAuth configuration, see README");
}

app.name = config.name;
app.keys = config.keys;

app.on('error', function(err, ctx){
  console.log('app error', err, ctx);
});

// Logger
config.logger.name = app.name;
app.use(logger(config.logger));

// x-response-time
app.use(responseTime());

// Helmet
app.use(helmet.xssFilter());
app.use(helmet.frameguard('deny'));
app.use(helmet.hidePoweredBy());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.hsts());
// TODO: CSP

// Cache
app.use(fresh());
app.use(etag());

app.use(session(app));
// TODO use redis for sessions

app.use(serve(APP_PATH));

// Setup Rate Limiting
app.use(mount('/api', ratelimit(config.ratelimit)));
// TODO: Support redis backend for rate limiting

// Web Pages
render(app, {
  root: APP_PATH,
  viewExt: 'ejs',
  cache: false,
  debug: true
});

router.get('/', function *(next){
  yield this.render('index', {session: this.session, state: this.state});
});

router.get('/login', github(config.github).login);
router.get('/callback', github(config.github).callback);

// rest endpoints
router.get('/api/whatever', function *(next){
  this.body = 'hi from get';
  yield next;
});
router.post('/api/whatever', function *(next){
  this.body = 'hi from post'
  yield next;
});

// Routes
app.use(router.routes());

// Error Handling
app.use(error());

app.listen(process.env.PORT || 3000);
