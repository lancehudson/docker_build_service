'use strict';

// Module dependencies.
var request = require('supertest');
var api = require('../..');

// Global
var app = false;

beforeEach(function() {
  app = api().listen();
});

afterEach(function() {
  app.close();
  app = false;
});

// Tests
describe('POST /api/v1/github', function() {
  describe('ping event', function() {
    it('should respond with "Ping Successful"', function(done) {
      var data = require('./data/ping.json');

      request(app)
      .post('/api/v1/github')
      .set('User-Agent', 'GitHub-Hookshot/f5d5ca1')
      .set('Accept', '*/*')
      .set('Content-Type', 'application/json')
      .set('X-Github-Delivery', '349c7c00-2d12-11e5-9bd8-8e4aa7d9cb6e')
      .set('X-Github-Event', 'ping')
      .set('Accept-Encoding:', 'gzip')
      .send(data)
      .expect(200)
      .end(function(err, res) {
        if (err) { return done(err); }
        res.text.should.eql('Ping Successful');
        done();
      });
    });
  });
});

describe('POST /api/v1/github', function() {
  describe('pust event', function() {
    it('should respond with 202 and a status message', function(done) {
      var data = require('./data/push.json');

      request(app)
      .post('/api/v1/github')
      .set('User-Agent', 'GitHub-Hookshot/f5d5ca1')
      .set('Accept', '*/*')
      .set('Content-Type', 'application/json')
      .set('X-Github-Delivery', '8f54e580-2e82-11e5-9122-321b0f67d119')
      .set('X-Github-Event', 'push')
      .set('X-Hub-Signature', 'sha1=971b2099c3c770d6c6a3b1b4603bfe1d2bcb1020')
      .set('Accept-Encoding:', 'gzip')
      .send(data)
      .expect(202)
      .end(function(err, res) {
        if (err) { return done(err); }
        res.text.should.eql('Build Pending');
        done();
      });
    });
  });
});

describe('POST /api/v1/github', function() {
  describe('vaild signature', function() {
    it('should respond with 200', function(done) {
      var data = require('./data/push.json');

      request(app)
      .post('/api/v1/github')
      .set('User-Agent', 'GitHub-Hookshot/f5d5ca1')
      .set('Accept', '*/*')
      .set('Content-Type', 'application/json')
      .set('X-Github-Delivery', '8f54e580-2e82-11e5-9122-321b0f67d119')
      .set('X-Github-Event', 'ping')
      .set('X-Hub-Signature', 'sha1=971b2099c3c770d6c6a3b1b4603bfe1d2bcb1020')
      .set('Accept-Encoding:', 'gzip')
      .send(data)
      .expect(200)
      .end(done);
    });
  });
  describe('invaild signature', function() {
    it('should respond with 400', function(done) {
      var data = require('./data/push.json');

      request(app)
      .post('/api/v1/github')
      .set('User-Agent', 'GitHub-Hookshot/f5d5ca1')
      .set('Accept', '*/*')
      .set('Content-Type', 'application/json')
      .set('X-Github-Delivery', '8f54e580-2e82-11e5-9122-321b0f67d119')
      .set('X-Github-Event', 'ping')
      .set('X-Hub-Signature', 'sha1=INVALID')
      .set('Accept-Encoding:', 'gzip')
      .send(data)
      .expect(400)
      .end(done);
    });
  });
});

describe('POST /api/v1/github', function() {
  describe('invalid event', function() {
    it('should respond with an error', function(done) {
      request(app)
      .post('/api/v1/github')
      .set('User-Agent', 'GitHub-Hookshot/f5d5ca1')
      .set('Accept', '*/*')
      .set('Content-Type', 'application/json')
      .set('X-Github-Delivery', '349c7c00-2d12-11e5-9bd8-8e4aa7d9cb6e')
      .set('X-Github-Event', 'non-existent-event')
      .set('Accept-Encoding:', 'gzip')
      .expect(400)
      .end(done);
    });
  });

  describe('missing event', function() {
    it('should respond with an error', function(done) {
      request(app)
      .post('/api/v1/github')
      .set('User-Agent', 'GitHub-Hookshot/f5d5ca1')
      .set('Accept', '*/*')
      .set('Content-Type', 'application/json')
      .set('X-Github-Delivery', '349c7c00-2d12-11e5-9bd8-8e4aa7d9cb6e')
      .set('Accept-Encoding:', 'gzip')
      .expect(400)
      .end(done);
    });
  });
});
