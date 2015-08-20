'use strict';

// Module dependencies.
var debug = require('debug')('api:github');
var scmp = require('scmp');
var crypto = require('crypto');
var tmp = require('tmp');
var clone = require('nodegit').Clone.clone;
var Q = require('q');
var os = require('os');
var rimraf = require('rimraf');

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

    // TODO: Check if configured ref
    if (this.request.body.ref !== 'refs/heads/master') {
      this.body = 'ref unconfigured, aborting.';
      this.type = 'text/plain';
      this.status = 202;
      return;
    }

    this.body = 'Build Pending';
    this.type = 'text/plain';
    this.status = 202;

    yield build.call(this.request.body);
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

// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
// jscs:disable requireCapitalizedComments

var build = function* () {
  // TODO: make api call to update status
  // TODO: clone repo
  debug('update repo status with clone pending',
    this.repository.full_name, // jshint ignore:line
    this.head_commit.id, // jshint ignore:line
    'pending', 'Running clone'
  );

  this.tmpPath = yield createTmpDir();
  yield cloneRepo.call(this);

  // TODO: docker build
  debug('update repo status with build pending',
    this.repository.full_name, // jshint ignore:line
    this.head_commit.id, // jshint ignore:line
    'pending', 'Running build'
  );

  // TODO: docker tag

  // TODO: docker push
  debug('update repo status with build pending',
    this.repository.full_name, // jshint ignore:line
    this.head_commit.id, // jshint ignore:line
    'pending', 'Pushing'
  );

  debug('update repo status with success',
    this.repository.full_name, // jshint ignore:line
    this.head_commit.id, // jshint ignore:line
    'success', 'The build succeeded!'
  );

  // Cleanup
  yield cleanupTmpDir.call(this);
};

var createTmpDir = function* () {
  var defer = Q.defer();

  tmp.dir({unsafeCleanup: true}, function(err, path) {
    if (err) {
      defer.reject(new Error(err));
    }
    debug('Temp Dir: ', path);
    defer.resolve(path);
  });

  return defer.promise;
};

var cleanupTmpDir = function* () {
  var defer = Q.defer();

  rimraf(this.tmpPath, function(err) {
    if (err) {
      defer.reject(new Error(err));
    }
    defer.resolve();
  });

  return defer.promise;
};

var cloneRepo = function* () {
  var ctx = this;
  var cloneOptions = {};

  // HTTPS certs don't work on OSX, great!
  if (os.platform() === 'darwin') {
    cloneOptions.remoteCallbacks = {
      certificateCheck: function() { return 1; },
    };
  }

  yield clone(ctx.repository.clone_url, // jshint ignore:line
    ctx.tmpPath,
    cloneOptions)
    .then(function(repo) {
      debug('Getting Commit: ', ctx.head_commit.id);  // jshint ignore:line
      return repo.getCommit(ctx.head_commit.id);  // jshint ignore:line
    });
};

// jscs:enable requireCamelCaseOrUpperCaseIdentifiers
// jscs:enable requireCapitalizedComments

// Expose exec
exports.exec = exec;
